// La Refresquera: une la lógica del tablero con la pantalla, la yapa y los anuncios.

import * as L from './logica.js';
import * as P from './pedidos.js';
import { svgSimbolo, dibujoSimbolo } from './sabores.js';
import { saboresDe, nombreBebida, descBebida } from './bebidas.js';
import { paisActual, pais as datosPais, texto } from '../shared/paises.js';
import * as B from './botella.js';
import { recetasDe, YAPA_RECETA, recetasNuevas, botellaReceta, nivelesEn, sumarNivel } from './recetario.js';
import { compartir } from '../shared/compartir.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { obtener, guardar, puesto, sumarYapa, gastarYapa, marcarJuego, visto, marcarVisto } from '../shared/almacen.js';
import { t, aplicarTextos } from '../shared/i18n.js';
import { sonar, alternar, activo } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios } from '../shared/anuncios.js';
import { EN_PORTAL } from '../shared/config.js';
import { chipYapa, contadorYapa, aviso, flotante, ventana, escapar, confeti, celebrarNivel } from '../shared/ui.js';
import { caserito } from '../shared/marca.js';
import { aplicarDecoracion, enUso } from '../shared/decoracion.js';
import { ganarXp } from '../shared/progreso.js';

const COSTO_EXTRA = 25;
const COSTO_PISTA = 10;
const YAPA_NIVEL = 5;
const MAX_EXTRA = { niveles: 1, pedidos: 2 };

const $ = (sel) => document.querySelector(sel);
const datos = puesto('refresquera');
// Las bebidas del tablero son las del país donde está el jugador.
const PAIS = paisActual(obtener());
const { SABORES, IDS_SABORES } = saboresDe(PAIS);
datos.nivel ??= 1;
datos.record ??= 0;
datos.partidasPedidos ??= 0;
datos.modo ??= 'niveles';

const juego = {
  modo: datos.modo,
  tablero: null, // tablero del modo niveles
  inicial: null,
  historial: [],
  sel: null,
  extras: 0,
  pista: null,
  bloqueado: false,
  pedidos: null, // estado del modo pedidos
  restante: 0,
  total: 1,
  pausas: 0,
  jugando: false,
};

const rnd = Math.random;

// ---------- Utilidades ----------

function tablero() {
  return juego.modo === 'pedidos' ? juego.pedidos.tablero : juego.tablero;
}

function ponerTablero(nuevo) {
  if (juego.modo === 'pedidos') juego.pedidos.tablero = nuevo;
  else juego.tablero = nuevo;
}

function jugar(si) {
  if (si === juego.jugando) return;
  juego.jugando = si;
  if (si) anuncios.inicioPartida();
  else anuncios.finPartida();
}

/** Abre una ventana con el juego en pausa: el reloj de caseritos se detiene. */
async function abrir(opciones) {
  juego.pausas++;
  jugar(false);
  try {
    return await ventana(opciones);
  } finally {
    juego.pausas--;
    if (!juego.pausas && partidaActiva()) jugar(true);
  }
}

function partidaActiva() {
  return juego.modo === 'niveles' ? !L.estaResuelto(juego.tablero) : juego.pedidos && !juego.pedidos.terminado;
}

function esperar(ms) {
  return new Promise((ok) => setTimeout(ok, ms));
}

// ---------- Pintar ----------

function forma() {
  return enUso('vaso');
}

let terminadosAntes = new Set();

function pintarVasos(opc = {}) {
  const t0 = tablero();
  const zona = $('#vasos');
  const n = t0.vasos.length;
  const porFila = n <= 5 ? n : Math.ceil(n / 2);
  zona.style.setProperty('--por-fila', porFila);
  zona.dataset.filas = n <= 5 ? 1 : 2;
  const enfocado = zona.contains(document.activeElement) ? document.activeElement.dataset.i : null;
  const terminados = new Set();

  zona.innerHTML = t0.vasos
    .map((v, i) => {
      const terminado = L.vasoTerminado(t0, i);
      if (terminado) terminados.add(i);
      const clases = ['vaso'];
      if (juego.sel === i) clases.push('elegido');
      if (terminado) clases.push('completo');
      if (terminado && !terminadosAntes.has(i) && !opc.sinTapar) clases.push('tapando');
      if (opc.nuevos?.has(i)) clases.push('nuevo');
      if (opc.sacude === i) clases.push('sacude');
      if (juego.pista?.[0] === i) clases.push('pista-origen');
      if (juego.pista?.[1] === i) clases.push('pista-destino');
      const capas = v.map((s, k) => {
        const llega = opc.llega && opc.llega.vaso === i && k >= v.length - opc.llega.n;
        return {
          color: SABORES[s].color,
          simbolo: dibujoSimbolo(s),
          oculta: L.capaOculta(t0, i, k),
          llega,
          retraso: llega ? (k - (v.length - opc.llega.n)) * 80 : 0,
          revelada: opc.revelada === i && k === v.length - 1,
        };
      });
      const solo = t0.solo[i] ? { color: SABORES[t0.solo[i]].color, simbolo: dibujoSimbolo(t0.solo[i]) } : null;
      const svg = B.svgVaso(capas, {
        id: i,
        forma: forma(),
        cap: L.capDe(t0, i),
        solo,
        terminado: terminado ? SABORES[v[0]].color : null,
      });
      let etiqueta = `${t('vaso', { n: i + 1 })}: ${
        v.length ? v.map((s, k) => (L.capaOculta(t0, i, k) ? '?' : nombreBebida(s))).join(', ') : t('vacio')
      }`;
      if (solo) etiqueta += `, ${t('soloAcepta', { sabor: nombreBebida(t0.solo[i]) })}`;
      if (terminado) etiqueta += `, ${t('completo')}`;
      if (juego.sel === i) etiqueta += `, ${t('seleccionado')}`;
      const brillo = terminado ? SABORES[v[0]].color : 'transparent';
      return `<button type="button" class="${clases.join(' ')}" data-i="${i}" aria-label="${escapar(etiqueta)}" style="--brillo:${brillo}">${svg}</button>`;
    })
    .join('');
  terminadosAntes = terminados;

  if (enfocado !== null) zona.querySelector(`[data-i="${enfocado}"]`)?.focus();
  ajustarTamano();
}

function ajustarTamano() {
  const zona = $('#vasos');
  const n = tablero().vasos.length;
  const porFila = n <= 5 ? n : Math.ceil(n / 2);
  const filas = n <= 5 ? 1 : 2;
  const hueco = porFila > 5 ? 10 : 16;
  zona.style.setProperty('--hueco', `${hueco}px`);
  const porAncho = (zona.clientWidth - 16 - hueco * (porFila - 1)) / porFila;
  const porAlto = (zona.clientHeight - 30 * filas - 34 * (filas - 1)) / filas / (B.ALTO / B.ANCHO);
  const ancho = Math.max(30, Math.min(78, porAncho, porAlto));
  zona.style.setProperty('--ancho', `${Math.floor(ancho)}px`);
}

const yaVistos = new Set();

function pintarPedidos() {
  const zona = $('#pedidos-zona');
  zona.hidden = juego.modo !== 'pedidos';
  if (juego.modo !== 'pedidos' || !juego.pedidos) return;
  const e = juego.pedidos;
  $('#atendidos').textContent = e.atendidos;
  $('#record').textContent = Math.max(datos.record, e.atendidos);
  const asientos = [];
  for (let i = 0; i < P.FILA_MAX; i++) {
    const c = e.fila[i];
    if (!c) {
      asientos.push('<li class="asiento"></li>');
      continue;
    }
    const s = SABORES[c.sabor];
    const nuevo = !yaVistos.has(c.id);
    yaVistos.add(c.id);
    asientos.push(`<li class="asiento ocupado${nuevo ? ' llega' : ''}" data-id="${c.id}">
      <span class="pedido" style="--c:${s.color}">${svgSimbolo(c.sabor)}</span>
      ${caserito(c.cara, datosPais(PAIS).sombreros)}
      <span class="solo-lector">${escapar(t('quiere', { sabor: nombreBebida(c.sabor) }))}</span>
    </li>`);
  }
  const fila = $('#fila');
  fila.innerHTML = asientos.join('');
  fila.classList.toggle('casi-llena', e.fila.length >= P.FILA_MAX);
  pintarReloj();
}

function pintarReloj() {
  const barra = $('#llegada');
  if (barra) barra.style.width = `${Math.min(100, (1 - juego.restante / juego.total) * 100)}%`;
}

function pintarBarra() {
  $('#subtitulo').textContent = juego.modo === 'niveles' ? t('nivel', { n: datos.nivel }) : t('pedidos');
  for (const b of document.querySelectorAll('.modo')) b.setAttribute('aria-pressed', String(b.dataset.modo === juego.modo));
  $('#deshacer').disabled = juego.modo !== 'niveles' || !juego.historial.length;
  $('#extra').disabled = juego.extras >= MAX_EXTRA[juego.modo];
  const sonido = $('#sonido');
  sonido.setAttribute('aria-label', activo() ? t('sonidoSi') : t('sonidoNo'));
  sonido.innerHTML = activo()
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
}

function pintar(opc) {
  pintarBarra();
  pintarPedidos();
  pintarVasos(opc);
}

// ---------- Partidas ----------

function empezarNiveles() {
  juego.modo = 'niveles';
  juego.tablero = L.generarNivel(datos.nivel, IDS_SABORES);
  juego.inicial = juego.tablero;
  juego.historial = [];
  juego.sel = null;
  juego.extras = 0;
  juego.pista = null;
  juego.bloqueado = false;
  pintar();
  jugar(true);
  presentarNovedades();
}

/** La primera vez que aparece un vaso especial, se explica con un dibujo. */
async function presentarNovedades() {
  const t0 = juego.tablero;
  const lista = [];
  if (!visto('tuto-niveles')) lista.push({ clave: 'tuto-niveles', titulo: t('refresquera'), texto: t('tutoNiveles'), casera: true });
  const ejemplo = (capas, op) => `<div class="ejemplo-vaso">${B.svgVaso(capas, { id: 950, forma: forma(), ...op })}</div>`;
  const capa = (s, extra = {}) => ({ color: SABORES[s].color, simbolo: dibujoSimbolo(s), ...extra });
  if (t0.hielo.some((h) => h > 0) && !visto('tuto-hielo')) {
    lista.push({ clave: 'tuto-hielo', titulo: t('nuevoHielo'), texto: t('nuevoHieloTexto'), html: ejemplo([capa('api', { oculta: true }), capa('tumbo', { oculta: true }), capa('frutilla')], {}) });
  }
  const conTapa = t0.solo.find(Boolean);
  if (conTapa && !visto('tuto-tapa')) {
    lista.push({ clave: 'tuto-tapa', titulo: t('nuevoTapa'), texto: t('nuevoTapaTexto'), html: ejemplo([], { solo: { color: SABORES[conTapa].color, simbolo: dibujoSimbolo(conTapa) } }) });
  }
  if (t0.caps.includes(L.CAPACIDAD_CHICO) && !visto('tuto-chico')) {
    lista.push({ clave: 'tuto-chico', titulo: t('nuevoChico'), texto: t('nuevoChicoTexto'), html: ejemplo([capa('limonada'), capa('limonada')], { cap: L.CAPACIDAD_CHICO }) });
  }
  for (const n of lista) {
    await abrir({ titulo: n.titulo, texto: n.texto, html: n.html || '', conCasera: Boolean(n.casera), botones: [{ texto: t('entendido') }] });
    marcarVisto(n.clave);
  }
}

function empezarPedidos() {
  juego.modo = 'pedidos';
  juego.pedidos = P.nuevaPartida({ ids: IDS_SABORES, rnd, semilla: Math.floor(rnd() * 1e9) });
  juego.sel = null;
  juego.extras = 0;
  juego.pista = null;
  juego.bloqueado = false;
  juego.total = P.intervaloLlegada(0);
  juego.restante = juego.total;
  pintar();
  jugar(true);
  if (!visto('tuto-pedidos')) {
    abrir({ titulo: t('pedidos'), texto: t('tutoPedidos'), conCasera: true, botones: [{ texto: t('entendido') }] }).then(() =>
      marcarVisto('tuto-pedidos')
    );
  }
}

function cambiarModo(modo) {
  if (modo === juego.modo && (modo === 'niveles' ? juego.tablero : juego.pedidos)) return;
  jugar(false);
  datos.modo = modo;
  guardar();
  if (modo === 'niveles') empezarNiveles();
  else empezarPedidos();
}

// ---------- Jugadas ----------

function tocarVaso(i) {
  if (juego.bloqueado || juego.pausas) return;
  const t0 = tablero();
  if (juego.sel === null) {
    if (!t0.vasos[i].length) {
      sonar.no();
      return;
    }
    juego.sel = i;
    sonar.elegir();
    pintarVasos();
    return;
  }
  if (juego.sel === i) {
    juego.sel = null;
    sonar.soltar();
    pintarVasos();
    return;
  }
  if (L.puedeVerter(t0, juego.sel, i)) {
    mover(juego.sel, i);
    return;
  }
  // Vaso con etiqueta: avisa qué sabor acepta.
  const sabor = L.arriba(t0.vasos[juego.sel]);
  if (t0.solo[i] && t0.solo[i] !== sabor && t0.vasos[i].length < L.capDe(t0, i)) {
    sonar.no();
    aviso(t('soloAcepta', { sabor: nombreBebida(t0.solo[i]) }));
    pintarVasos({ sacude: i });
    return;
  }
  // No se puede: si el otro vaso tiene refresco, pasa a ser el elegido.
  if (t0.vasos[i].length) {
    juego.sel = i;
    sonar.elegir();
    pintarVasos();
  } else {
    sonar.no();
    juego.sel = null;
    pintarVasos({ sacude: i });
  }
}

/**
 * Inclina la botella de origen sobre la de destino y deja caer un chorro del refresco.
 * Devuelve { pose, chorro } para terminar la animación después de pintar.
 */
async function animarVertido(desde, hacia, color, nivelFinal) {
  const a = document.querySelector(`.vaso[data-i="${desde}"] .botella`);
  const b = document.querySelector(`.vaso[data-i="${hacia}"] .botella`);
  if (!a || !b || !a.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return null;
  const t0 = tablero();
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  const escalaA = ra.height / B.ALTO;
  const escalaB = rb.height / B.ALTO;
  const gA = B.geometria(forma(), L.capDe(t0, desde));
  const gB = B.geometria(forma(), L.capDe(t0, hacia));
  const izquierda = rb.left + rb.width / 2 < ra.left + ra.width / 2;
  const ang = izquierda ? -66 : 66;
  const rad = (ang * Math.PI) / 180;
  // Punta de la botella inclinada, girando sobre su centro
  const d = (B.ALTO / 2 - gA.boca) * escalaA;
  const cx = ra.left + ra.width / 2;
  const cy = ra.top + ra.height / 2;
  const puntaX = cx + d * Math.sin(rad);
  const puntaY = cy - d * Math.cos(rad);
  const bocaX = rb.left + rb.width / 2 + (izquierda ? 5 : -5) * escalaB;
  const bocaY = rb.top + (gB.boca - 16) * escalaB;
  const pose = `translate(${bocaX - puntaX}px, ${bocaY - puntaY}px) rotate(${ang}deg)`;
  a.style.transformOrigin = '50% 50%';
  a.closest('.vaso').style.zIndex = '5';
  a.animate([{ transform: 'translateY(-16px)' }, { transform: pose }], { duration: 210, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' });
  await esperar(200);
  // El chorro cae desde la punta hasta la superficie del refresco en el destino
  const superficie = rb.top + (gB.fondo - nivelFinal * B.CAPA) * escalaB;
  const chorro = document.createElement('div');
  chorro.className = 'chorro';
  chorro.style.background = color;
  chorro.style.left = `${bocaX - 2.5 * escalaB}px`;
  chorro.style.width = `${Math.max(3, 5 * escalaB)}px`;
  chorro.style.top = `${bocaY}px`;
  chorro.style.height = `${Math.max(8, superficie - bocaY)}px`;
  document.body.appendChild(chorro);
  chorro.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 130, easing: 'ease-in' });
  await esperar(160);
  return { pose, chorro };
}

function terminarVertido(desde, anim) {
  if (!anim) return;
  const { pose, chorro } = anim;
  chorro.animate([{ opacity: 1 }, { opacity: 0, transform: 'scaleY(.2) translateY(60px)' }], { duration: 180, easing: 'ease-in' }).onfinish = () =>
    chorro.remove();
  const vuelve = document.querySelector(`.vaso[data-i="${desde}"] .botella`);
  if (!vuelve) return;
  const caja = vuelve.closest('.vaso');
  caja.style.zIndex = '5';
  vuelve.style.transformOrigin = '50% 50%';
  vuelve.animate([{ transform: pose }, { transform: 'none' }], { duration: 230, easing: 'cubic-bezier(.4,0,.3,1)' }).onfinish = () => {
    caja.style.zIndex = '';
    vuelve.style.transformOrigin = '';
  };
}

async function mover(desde, hacia) {
  const antes = tablero();
  const { tablero: despues, cantidad, revelada } = L.verter(antes, desde, hacia);
  if (!cantidad) return;
  juego.bloqueado = true;
  const color = SABORES[L.arriba(antes.vasos[desde])].color;
  sonar.verter(cantidad);
  const anim = await animarVertido(desde, hacia, color, despues.vasos[hacia].length);
  juego.bloqueado = false;
  if (tablero() !== antes) {
    anim?.chorro.remove();
    return; // la partida cambió mientras se vertía
  }
  if (juego.modo === 'niveles') juego.historial.push(antes);
  ponerTablero(despues);
  juego.sel = null;
  juego.pista = null;
  if (marcarJuego() && obtener().racha > 1) aviso(t('rachaSube', { n: obtener().racha }), { tipo: 'exito' });
  pintarBarra();
  pintarVasos({ llega: { vaso: hacia, n: cantidad }, revelada: revelada ? desde : null });
  terminarVertido(desde, anim);
  if (revelada) setTimeout(() => sonar.elegir(), 150);
  if (L.vasoTerminado(despues, hacia)) setTimeout(() => sonar.listo(), 160);

  if (juego.modo === 'niveles') {
    if (L.estaResuelto(despues)) nivelCompleto();
    else if (L.estaAtascado(despues)) setTimeout(atascado, 450);
  } else {
    intentarServir().then(() => {
      if (!juego.pedidos.terminado && atascadoEnPedidos()) atascado();
    });
  }
}

/** Sirve a los caseritos que esperan un vaso que ya está completo. */
async function intentarServir() {
  const e = juego.pedidos;
  const t0 = e.tablero;
  const hay = t0.vasos.some((v) => L.estaCompleto(v, t0.cap) && e.fila.some((c) => c.sabor === v[0]));
  if (!hay) return;
  juego.bloqueado = true;
  await esperar(380);
  if (juego.pedidos !== e) return;
  const filaAntes = e.fila.slice();
  const servidos = P.servir(e, rnd);
  if (servidos.length) {
    for (const s of servidos) {
      const k = filaAntes.findIndex((c) => c.id === s.caserito.id);
      const asiento = $('#fila').children[k];
      if (asiento) flotante(`+${P.YAPA_POR_PEDIDO}`, asiento);
    }
    sumarYapa(P.YAPA_POR_PEDIDO * servidos.length);
    celebrarNivel(ganarXp('refresquera', servidos.length));
    sonar.servido();
    aviso(t('servido'), { tipo: 'exito' });
    if (e.atendidos > datos.record) {
      datos.record = e.atendidos;
      guardar();
    }
    juego.sel = null;
    // Con la fila vacía no hay nada que hacer: el siguiente caserito llega enseguida.
    if (!e.fila.length) juego.restante = Math.min(juego.restante, 2);
    pintarPedidos();
    pintarVasos({ nuevos: new Set(servidos.map((s) => s.vaso)) });
  }
  juego.bloqueado = false;
}

async function nivelCompleto() {
  juego.bloqueado = true;
  datos.nivel++;
  guardar();
  sumarYapa(YAPA_NIVEL);
  const subida = ganarXp('refresquera', 2);
  setTimeout(() => {
    confeti();
    celebrarNivel(subida);
  }, 450);
  anuncios.celebrar();
  await esperar(500);
  sonar.servido();
  await abrir({
    titulo: t('servido'),
    texto: `${t('nivelListo')} ${t('masYapa', { n: YAPA_NIVEL })}`,
    conCasera: true,
    cerrable: false,
    botones: [{ texto: t('siguiente'), valor: 'sig' }],
  });
  sumarNivel(datos, PAIS);
  const nuevas = recetasNuevas(datos, PAIS);
  if (nuevas.length) {
    const yapa = YAPA_RECETA * nuevas.length;
    sumarYapa(yapa);
    await abrir({
      titulo: t('recetaNueva', { nombre: nuevas.map((r) => nombreBebida(r.id)).join(', '), n: yapa }),
      texto: nuevas.length === 1 ? descBebida(nuevas[0].id) : '',
      html: `<div class="recetas-nuevas">${nuevas.map((r, k) => `<div class="ejemplo-vaso">${botellaReceta(r.id, forma(), k)}</div>`).join('')}</div>`,
      botones: [{ texto: t('entendido') }],
    });
  }
  guardar();
  jugar(false);
  empezarNiveles();
}

/** Semana del año (lunes a domingo) para la tabla de la semana. */
function semanaActual() {
  const d = new Date();
  const jueves = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7)));
  const inicio = new Date(Date.UTC(jueves.getUTCFullYear(), 0, 4));
  const semana = 1 + Math.round(((jueves - inicio) / 86400000 - 3 + ((inicio.getUTCDay() + 6) % 7)) / 7);
  return `${jueves.getUTCFullYear()}-S${semana}`;
}

function anotarSemana(atendidos) {
  const id = semanaActual();
  if (!datos.semana || datos.semana.id !== id) datos.semana = { id, atendidos: 0, mejor: 0 };
  datos.semana.atendidos += atendidos;
  datos.semana.mejor = Math.max(datos.semana.mejor, atendidos);
  return datos.semana;
}

async function finPedidos() {
  const e = juego.pedidos;
  e.terminado = true;
  juego.bloqueado = true;
  jugar(false);
  sonar.fin();
  const record = e.atendidos > 0 && e.atendidos >= datos.record;
  datos.record = Math.max(datos.record, e.atendidos);
  datos.partidasPedidos++;
  const semana = anotarSemana(e.atendidos);
  guardar();
  pintarPedidos();
  let eleccion = 'retar';
  while (eleccion === 'retar') {
    eleccion = await abrir({
      titulo: t('filaLlena'),
      texto: `${t('atendiste', { n: e.atendidos })}${record ? ` ${t('nuevoRecord')}` : ''} ${t('estaSemana', { n: semana.atendidos, mejor: semana.mejor })}`,
      conCasera: true,
      cerrable: false,
      botones: [
        { texto: t('otraVez'), valor: 'otra' },
        ...(e.atendidos > 0 ? [{ texto: t('retar'), valor: 'retar', clase: 'hierbabuena' }] : []),
        { texto: t('irNiveles'), valor: 'niveles', clase: 'secundario' },
      ],
    });
    if (eleccion === 'retar') {
      const r = await compartir(t('retoRefresquera', { n: e.atendidos }));
      if (r === 'copiado') aviso(t('copiado'), { tipo: 'exito' });
    }
  }
  if (eleccion === 'niveles') cambiarModo('niveles');
  else empezarPedidos();
}

/** El recetario: los doce refrescos, los que ya tienes y cuándo llegan los demás. */
function abrirRecetario() {
  if (juego.pausas) return;
  const hechos = nivelesEn(datos, PAIS);
  const recetas = recetasDe(PAIS);
  const tienes = recetas.filter((r) => hechos >= r.niveles).length;
  const tarjetas = recetas.map((r, n) => {
    const abierta = hechos >= r.niveles;
    return `<button type="button" class="receta${abierta ? '' : ' cerrada'}" data-receta="${r.id}" ${abierta ? '' : 'disabled'}>
      ${botellaReceta(r.id, forma(), n)}
      <span>${escapar(abierta ? nombreBebida(r.id) : t('recetaBloqueada', { n: r.niveles }))}</span>
    </button>`;
  }).join('');
  abrir({
    titulo: `${t('recetario')} · ${texto(datosPais(PAIS).nombre)}`,
    texto: t('recetasTienes', { n: tienes, total: recetas.length }),
    html: `<div class="recetario">${tarjetas}</div><p class="receta-detalle" id="receta-detalle"></p>`,
    botones: [{ texto: t('cerrar') }],
  });
}

document.addEventListener('click', (ev) => {
  const r = ev.target.closest('[data-receta]');
  if (!r) return;
  const detalle = document.getElementById('receta-detalle');
  if (detalle) detalle.textContent = `${nombreBebida(r.dataset.receta)}: ${descBebida(r.dataset.receta)}`;
  for (const x of document.querySelectorAll('.receta.elegida')) x.classList.remove('elegida');
  r.classList.add('elegida');
});

// ---------- Ayudas ----------

function agregarVaso() {
  juego.extras++;
  if (juego.modo === 'pedidos') {
    P.agregarVaso(juego.pedidos);
  } else {
    juego.tablero = L.agregarVacio(L.clonar(juego.tablero));
  }
  sonar.listo();
  pintar({ nuevos: new Set([tablero().vasos.length - 1]) });
}

async function pedirVasoExtra({ desdeAtasco = false } = {}) {
  if (juego.extras >= MAX_EXTRA[juego.modo]) {
    aviso(t('sinExtras'));
    return false;
  }
  const botones = [
    { texto: t('pagarYapa', { n: COSTO_EXTRA }), valor: 'yapa', deshabilitado: obtener().yapa < COSTO_EXTRA },
  ];
  if (anuncios.hayRecompensa) botones.push({ texto: t('verAnuncio'), valor: 'anuncio', clase: 'hierbabuena' });
  if (desdeAtasco && juego.modo === 'niveles') {
    if (juego.historial.length) botones.push({ texto: t('deshacer'), valor: 'deshacer', clase: 'secundario' });
    botones.push({ texto: t('reiniciar'), valor: 'reiniciar', clase: 'secundario' });
  } else {
    botones.push({ texto: t('cerrar'), valor: null, clase: 'secundario' });
  }
  const texto = obtener().yapa < COSTO_EXTRA && !anuncios.hayRecompensa ? t('faltaYapa') : desdeAtasco ? t('atascadoTexto') : '';
  const eleccion = await abrir({ titulo: desdeAtasco ? t('atascado') : t('vasoExtra'), texto, botones });
  if (eleccion === 'yapa') {
    if (gastarYapa(COSTO_EXTRA)) {
      agregarVaso();
      return true;
    }
    aviso(t('faltaYapa'), { tipo: 'alerta' });
  } else if (eleccion === 'anuncio') {
    juego.pausas++;
    const vio = await anuncios.verRecompensa();
    juego.pausas--;
    if (vio) {
      agregarVaso();
      return true;
    }
    aviso(t('anuncioFallo'), { tipo: 'alerta' });
  } else if (eleccion === 'deshacer') {
    deshacer();
  } else if (eleccion === 'reiniciar') {
    reiniciar();
  }
  return false;
}

/** En pedidos, un vaso completo sin cliente no es atasco: el próximo caserito puede pedirlo. */
function atascadoEnPedidos() {
  const t0 = juego.pedidos.tablero;
  return L.estaAtascado(t0) && !t0.vasos.some((v) => L.estaCompleto(v, t0.cap));
}

function sinSalida() {
  return juego.modo === 'pedidos' ? atascadoEnPedidos() : L.estaAtascado(tablero());
}

async function atascado() {
  if (juego.pausas || !sinSalida()) return;
  if (juego.modo === 'pedidos' && juego.extras >= MAX_EXTRA.pedidos) {
    finPedidos();
    return;
  }
  if (juego.extras >= MAX_EXTRA[juego.modo]) {
    // Sin vaso extra posible en niveles: queda deshacer o reiniciar.
    const eleccion = await abrir({
      titulo: t('atascado'),
      texto: t('atascadoTexto'),
      botones: [
        ...(juego.historial.length ? [{ texto: t('deshacer'), valor: 'deshacer' }] : []),
        { texto: t('reiniciar'), valor: 'reiniciar', clase: 'secundario' },
      ],
    });
    if (eleccion === 'deshacer') deshacer();
    else if (eleccion === 'reiniciar') reiniciar();
    return;
  }
  const ok = await pedirVasoExtra({ desdeAtasco: true });
  if (!ok && juego.modo === 'pedidos' && atascadoEnPedidos() && !juego.pausas) finPedidos();
}

function deshacer() {
  if (juego.modo !== 'niveles' || !juego.historial.length || juego.bloqueado) {
    sonar.no();
    return;
  }
  const previo = L.clonar(juego.historial.pop());
  // Si se compró un vaso extra después, se conserva.
  while (previo.vasos.length < juego.tablero.vasos.length) L.agregarVacio(previo);
  juego.tablero = previo;
  juego.sel = null;
  juego.pista = null;
  sonar.soltar();
  pintar();
}

function reiniciar() {
  if (juego.bloqueado) return;
  if (juego.modo === 'pedidos') {
    empezarPedidos();
    return;
  }
  const t0 = L.clonar(juego.inicial);
  for (let i = 0; i < juego.extras; i++) L.agregarVacio(t0);
  juego.tablero = t0;
  juego.historial = [];
  juego.sel = null;
  juego.pista = null;
  pintar();
}

async function darPista() {
  if (juego.bloqueado) return;
  const t0 = tablero();
  const mov = juego.modo === 'niveles' ? L.pista(t0) : L.mejorMovimiento(t0);
  if (!mov) {
    aviso(t('sinPista'));
    return;
  }
  if (!gastarYapa(COSTO_PISTA)) {
    if (!anuncios.hayRecompensa) {
      aviso(t('faltaYapa'), { tipo: 'alerta' });
      return;
    }
    // Sin yapa suficiente: la pista puede salir gratis viendo un anuncio
    const eleccion = await abrir({ titulo: t('pista'), texto: t('faltaYapa'), botones: [{ texto: t('pistaGratis'), valor: 'anuncio', clase: 'hierbabuena' }, { texto: t('cerrar'), valor: null, clase: 'secundario' }] });
    if (eleccion !== 'anuncio') return;
    juego.pausas++;
    const vio = await anuncios.verRecompensa();
    juego.pausas--;
    if (!vio) {
      aviso(t('anuncioFallo'), { tipo: 'alerta' });
      return;
    }
  }
  juego.pista = mov;
  juego.sel = null;
  sonar.elegir();
  pintarVasos();
  setTimeout(() => {
    if (juego.pista === mov) {
      juego.pista = null;
      pintarVasos();
    }
  }, 3000);
}

// ---------- Reloj de caseritos ----------

let ultimo = performance.now();
function reloj(ahora) {
  const dt = Math.min(0.25, (ahora - ultimo) / 1000);
  ultimo = ahora;
  const e = juego.pedidos;
  if (juego.modo === 'pedidos' && e && !e.terminado && !juego.pausas && !document.hidden) {
    juego.restante -= dt;
    if (juego.restante <= 0) {
      P.llegaCaserito(e, rnd);
      if (e.terminado) {
        finPedidos();
      } else {
        sonar.llega();
        juego.total = P.intervaloLlegada(e.atendidos);
        juego.restante = juego.total;
        pintarPedidos();
        if (!juego.bloqueado) intentarServir();
      }
    }
    pintarReloj();
  }
  requestAnimationFrame(reloj);
}

// ---------- Arranque ----------

function iniciar() {
  window.QHATU_LISTO = true;
  document.body.insertAdjacentHTML('afterbegin', B.definiciones());
  iniciarPlataforma({ esPuesto: true });
  aplicarDecoracion();
  aplicarTextos();
  $('#chip-yapa').innerHTML = chipYapa();
  contadorYapa();
  if (EN_PORTAL) $('#volver').hidden = true;
  const costo = document.createElement('small');
  costo.className = 'costo';
  costo.textContent = String(COSTO_PISTA);
  $('#pista').appendChild(costo);

  $('#vasos').addEventListener('click', (ev) => {
    const vaso = ev.target.closest('.vaso');
    if (vaso) tocarVaso(Number(vaso.dataset.i));
  });
  for (const b of document.querySelectorAll('.modo')) b.addEventListener('click', () => cambiarModo(b.dataset.modo));
  $('#deshacer').addEventListener('click', deshacer);
  $('#reiniciar').addEventListener('click', reiniciar);
  $('#pista').addEventListener('click', darPista);
  $('#extra').addEventListener('click', () => {
    if (!juego.bloqueado) pedirVasoExtra();
  });
  $('#sonido').addEventListener('click', () => {
    alternar();
    pintarBarra();
  });
  $('#recetario').addEventListener('click', abrirRecetario);
  document.addEventListener('qhatu:idioma', () => pintar());
  window.addEventListener('resize', ajustarTamano);

  if (juego.modo === 'pedidos') empezarPedidos();
  else empezarNiveles();
  requestAnimationFrame(reloj);

  iniciarAnuncios().then(() => {
    anuncios.cargaLista();
    // La partida pudo empezar antes de que cargara el SDK del portal.
    if (juego.jugando) anuncios.inicioPartida();
  });
}

iniciar();

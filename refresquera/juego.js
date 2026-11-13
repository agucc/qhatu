// La Refresquera: une la lógica del tablero con la pantalla, la yapa y los anuncios.

import * as L from './logica.js';
import * as P from './pedidos.js';
import { SABORES, IDS_SABORES, svgSimbolo } from './sabores.js';
import { obtener, guardar, puesto, sumarYapa, gastarYapa, marcarJuego, visto, marcarVisto } from '../shared/almacen.js';
import { t, aplicarTextos, nombreSabor } from '../shared/i18n.js';
import { sonar, alternar, activo } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios, tocaAnuncio } from '../shared/anuncios.js';
import { EN_PORTAL } from '../shared/config.js';
import { chipYapa, contadorYapa, aviso, flotante, ventana, escapar } from '../shared/ui.js';
import { caserito } from '../shared/marca.js';

const COSTO_EXTRA = 25;
const COSTO_PISTA = 10;
const YAPA_NIVEL = 5;
const MAX_EXTRA = { niveles: 1, pedidos: 2 };

const $ = (sel) => document.querySelector(sel);
const datos = puesto('refresquera');
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

function pintarVasos(opc = {}) {
  const t0 = tablero();
  const zona = $('#vasos');
  const n = t0.vasos.length;
  const porFila = n <= 5 ? n : Math.ceil(n / 2);
  zona.style.setProperty('--por-fila', porFila);
  zona.dataset.filas = n <= 5 ? 1 : 2;
  const enfocado = zona.contains(document.activeElement) ? document.activeElement.dataset.i : null;

  zona.innerHTML = t0.vasos
    .map((v, i) => {
      const completo = L.estaCompleto(v, t0.cap);
      const clases = ['vaso'];
      if (juego.sel === i) clases.push('elegido');
      if (completo) clases.push('completo');
      if (opc.nuevos?.has(i)) clases.push('nuevo');
      if (opc.sacude === i) clases.push('sacude');
      if (juego.pista?.[0] === i) clases.push('pista-origen');
      if (juego.pista?.[1] === i) clases.push('pista-destino');
      const capas = v
        .map((s, k) => {
          const llega = opc.llega && opc.llega.vaso === i && k >= v.length - opc.llega.n;
          const retraso = llega ? (k - (v.length - opc.llega.n)) * 70 : 0;
          return `<div class="capa${llega ? ' llega' : ''}" style="--c:${SABORES[s].color};--retraso:${retraso}ms">${svgSimbolo(s)}</div>`;
        })
        .join('');
      let etiqueta = `${t('vaso', { n: i + 1 })}: ${v.length ? v.map(nombreSabor).join(', ') : t('vacio')}`;
      if (completo) etiqueta += `, ${t('completo')}`;
      if (juego.sel === i) etiqueta += `, ${t('seleccionado')}`;
      const brillo = completo ? SABORES[v[0]].color : 'transparent';
      return `<button type="button" class="${clases.join(' ')}" data-i="${i}" aria-label="${escapar(etiqueta)}" style="--brillo:${brillo}"><span class="vaso-interior">${capas}</span></button>`;
    })
    .join('');

  if (enfocado !== null) zona.querySelector(`[data-i="${enfocado}"]`)?.focus();
  ajustarTamano();
}

function ajustarTamano() {
  const zona = $('#vasos');
  const n = tablero().vasos.length;
  const porFila = n <= 5 ? n : Math.ceil(n / 2);
  const filas = n <= 5 ? 1 : 2;
  const hueco = 12;
  const porAncho = (zona.clientWidth - hueco * (porFila - 1)) / porFila;
  const porAlto = (zona.clientHeight - 28 * filas - 20 * (filas - 1)) / filas / 3.9;
  const ancho = Math.max(30, Math.min(72, porAncho, porAlto));
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
      ${caserito(c.cara)}
      <span class="solo-lector">${escapar(t('quiere', { sabor: nombreSabor(c.sabor) }))}</span>
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
  if (!visto('tuto-niveles')) {
    abrir({ titulo: t('refresquera'), texto: t('tutoNiveles'), conCasera: true, botones: [{ texto: t('entendido') }] }).then(() =>
      marcarVisto('tuto-niveles')
    );
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

function mover(desde, hacia) {
  const antes = tablero();
  const { tablero: despues, cantidad } = L.verter(antes, desde, hacia);
  if (!cantidad) return;
  if (juego.modo === 'niveles') juego.historial.push(antes);
  ponerTablero(despues);
  juego.sel = null;
  juego.pista = null;
  sonar.verter(cantidad);
  if (marcarJuego() && obtener().racha > 1) aviso(t('rachaSube', { n: obtener().racha }), { tipo: 'exito' });
  pintarBarra();
  pintarVasos({ llega: { vaso: hacia, n: cantidad } });
  if (L.estaCompleto(despues.vasos[hacia], despues.cap)) setTimeout(() => sonar.listo(), 120);

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
  const terminado = datos.nivel;
  datos.nivel++;
  guardar();
  sumarYapa(YAPA_NIVEL);
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
  jugar(false);
  if (tocaAnuncio(terminado)) await anuncios.pausaEntreNiveles();
  empezarNiveles();
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
  guardar();
  pintarPedidos();
  const eleccion = await abrir({
    titulo: t('filaLlena'),
    texto: `${t('atendiste', { n: e.atendidos })}${record ? ` ${t('nuevoRecord')}` : ''}`,
    conCasera: true,
    cerrable: false,
    botones: [
      { texto: t('otraVez'), valor: 'otra' },
      { texto: t('irNiveles'), valor: 'niveles', clase: 'secundario' },
    ],
  });
  if (datos.partidasPedidos % 3 === 0) await anuncios.pausaEntreNiveles();
  if (eleccion === 'niveles') cambiarModo('niveles');
  else empezarPedidos();
}

// ---------- Ayudas ----------

function agregarVaso() {
  juego.extras++;
  if (juego.modo === 'pedidos') {
    P.agregarVaso(juego.pedidos);
  } else {
    const nuevo = L.clonar(juego.tablero);
    nuevo.vasos.push([]);
    juego.tablero = nuevo;
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
  while (previo.vasos.length < juego.tablero.vasos.length) previo.vasos.push([]);
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
  for (let i = 0; i < juego.extras; i++) t0.vasos.push([]);
  juego.tablero = t0;
  juego.historial = [];
  juego.sel = null;
  juego.pista = null;
  pintar();
}

function darPista() {
  if (juego.bloqueado) return;
  const t0 = tablero();
  const mov = juego.modo === 'niveles' ? L.pista(t0) : L.mejorMovimiento(t0);
  if (!mov) {
    aviso(t('sinPista'));
    return;
  }
  if (!gastarYapa(COSTO_PISTA)) {
    aviso(t('faltaYapa'), { tipo: 'alerta' });
    return;
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

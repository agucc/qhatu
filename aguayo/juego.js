// El Aguayo: el telar en pantalla, arrastrar piezas, tejer franjas, el caserito, la yapa y los anuncios.

import * as A from './logica.js';
import { obtener, guardar, puesto, sumarYapa, gastarYapa, marcarJuego, visto, marcarVisto } from '../shared/almacen.js';
import { t, aplicarTextos } from '../shared/i18n.js';
import { paisActual, pais as datosPais, texto, NOMBRES_COLORES } from '../shared/paises.js';
import { sonar, alternar, activo } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios } from '../shared/anuncios.js';
import { EN_PORTAL } from '../shared/config.js';
import { chipYapa, contadorYapa, aviso, flotante, ventana, confeti, celebrarNivel } from '../shared/ui.js';
import { caserito, casera } from '../shared/marca.js';
import { compartir } from '../shared/compartir.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { caseritoConHistoria, htmlCaserito, esCasera, anotarFranjas, jugarEnFiesta } from '../shared/album.js';
import { SEGUNDOS, crearReloj, montarBarraReloj, pintarReloj, ocultarReloj, preguntarContrarreloj, finContrarreloj, yapaReloj } from '../shared/reloj.js';
import { aplicarDecoracion } from '../shared/decoracion.js';
import { ganarXp } from '../shared/progreso.js';

const COSTO_CAMBIAR = 10;
const COSTO_SEGUIR = 20;
const YAPA_PEDIDO = 3;
const MAX_TELA = 6;

const $ = (sel) => document.querySelector(sel);
const datos = puesto('aguayo');
datos.record ??= 0;
datos.partidas ??= 0;

const rnd = Math.random;

const juego = {
  telar: A.crearTelar(),
  mano: [],
  puntos: 0,
  pedido: null,
  tela: [],
  elegida: null,
  seguirUsado: false,
  primerJugada: true,
  bloqueado: false,
  pausas: 0,
  jugando: false,
  terminado: false,
};

// ---------- Ayudas ----------

function jugar(si) {
  if (si === juego.jugando) return;
  juego.jugando = si;
  if (si) anuncios.inicioPartida();
  else anuncios.finPartida();
}

async function abrir(opciones) {
  juego.pausas++;
  jugar(false);
  try {
    return await ventana(opciones);
  } finally {
    juego.pausas--;
    if (!juego.pausas && !juego.terminado) jugar(true);
  }
}

// El tejido es el del país donde está el jugador: sus colores y su nombre.
const PAIS = paisActual(obtener());
const TELAR = datosPais(PAIS).telar;
const HILOS = TELAR.paleta.map(([id]) => id);
const COLOR_HILO = Object.fromEntries(TELAR.paleta);

function colorDe(hilo) {
  return COLOR_HILO[hilo] || A.COLOR_HILO[hilo] || '#888';
}

function nombreHilo(id) {
  return texto(NOMBRES_COLORES[id]) || id;
}

// ---------- Pintar ----------

function medirTelar() {
  const zona = $('#telar-zona');
  const lado = Math.min(zona.clientWidth, zona.clientHeight) - 16;
  const celda = Math.max(24, Math.floor((lado - 3 * 7) / 8));
  document.documentElement.style.setProperty('--celda', `${celda}px`);
  const mano = $('#mano');
  const mini = Math.max(10, Math.min(18, Math.floor((mano.clientHeight - 20) / 5)));
  document.documentElement.style.setProperty('--mini', `${mini}px`);
}

function pintarTelar({ lleno = null, tejer = null, vista = null } = {}) {
  const telar = lleno || juego.telar;
  const caja = $('#telar');
  const porTejer = new Set();
  if (tejer) {
    for (const fr of tejer) {
      for (let i = 0; i < A.TAM; i++) porTejer.add(fr.tipo === 'fila' ? `${fr.indice},${i}` : `${i},${fr.indice}`);
    }
  }
  const enVista = new Map();
  const brillan = new Set();
  if (vista) {
    for (const [f, c] of vista.celdas) enVista.set(`${vista.fila + f},${vista.col + c}`, vista.color);
    const prueba = A.colocar(juego.telar, vista.celdas, vista.fila, vista.col, vista.color);
    if (prueba) {
      for (const fr of prueba.franjas) {
        for (let i = 0; i < A.TAM; i++) brillan.add(fr.tipo === 'fila' ? `${fr.indice},${i}` : `${i},${fr.indice}`);
      }
    }
  }
  let html = '';
  for (let f = 0; f < A.TAM; f++) {
    for (let c = 0; c < A.TAM; c++) {
      const k = `${f},${c}`;
      const hilo = telar[f][c];
      const clases = ['celda'];
      let color = '';
      if (hilo) {
        clases.push('hilo');
        color = colorDe(hilo);
      } else if (enVista.has(k)) {
        clases.push('vista');
        color = colorDe(enVista.get(k));
      }
      if (porTejer.has(k)) clases.push('teje');
      if (brillan.has(k)) clases.push('por-tejer');
      html += `<div class="${clases.join(' ')}" role="gridcell" data-f="${f}" data-c="${c}"${color ? ` style="--c:${color}"` : ''}></div>`;
    }
  }
  caja.innerHTML = html;
}

function htmlPieza(celdas, color) {
  const { filas, cols } = A.medida(celdas);
  const llenas = new Set(celdas.map(([f, c]) => `${f},${c}`));
  let html = `<div class="pieza" style="grid-template-columns:repeat(${cols},auto)">`;
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      html += llenas.has(`${f},${c}`) ? `<span class="hilo" style="--c:${colorDe(color)}"></span>` : '<span></span>';
    }
  }
  return `${html}</div>`;
}

function pintarMano() {
  const zona = $('#mano');
  zona.innerHTML = juego.mano
    .map((m, i) => {
      if (!m) return `<div class="ranura vacia" aria-hidden="true"></div>`;
      const cabe = A.hayLugar(juego.telar, m.pieza.celdas);
      const clases = ['ranura'];
      if (juego.elegida === i) clases.push('elegida');
      if (!cabe) clases.push('no-cabe');
      return `<button type="button" class="${clases.join(' ')}" data-i="${i}" aria-label="${t('piezas')} ${i + 1}, ${nombreHilo(m.color)}">${htmlPieza(m.pieza.celdas, m.color)}</button>`;
    })
    .join('');
}

function pintarTela(nuevas = 0) {
  $('#tela').innerHTML = juego.tela
    .map(
      (colores, i) =>
        `<div class="tela-franja${i < nuevas ? ' nueva' : ''}">${colores.map((h) => `<span style="--c:${colorDe(h)}"></span>`).join('')}</div>`
    )
    .join('');
}

function pintarDatos() {
  $('#puntos').textContent = juego.puntos;
  $('#record').textContent = Math.max(datos.record, juego.puntos);
}

function pintarPedido({ nuevo = false } = {}) {
  const p = juego.pedido;
  $('#pedido-cara').innerHTML = esCasera(p.historia) ? casera(PAIS) : caserito(p.cara, datosPais(PAIS).sombreros);
  $('#pedido-hilo').style.setProperty('--c', colorDe(p.color));
  const texto = t('quiereFranja', { color: nombreHilo(p.color) });
  if (p.historia) $('#pedido-texto').innerHTML = htmlCaserito(p.historia);
  else $('#pedido-texto').textContent = texto;
  $('#pedido').classList.toggle('con-historia', Boolean(p.historia));
  $('#pedido').setAttribute('aria-label', p.historia ? `${p.historia.nombre}: ${p.historia.linea} ${texto}` : texto);
  const caja = $('#pedido');
  caja.classList.remove('atendido');
  if (nuevo) {
    caja.classList.remove('llega');
    void caja.offsetWidth;
    caja.classList.add('llega');
  }
}

function nuevoPedido() {
  const opciones = HILOS.filter((h) => !juego.pedido || h !== juego.pedido.color);
  // A veces llega una tejedora o un caserito con nombre que pide su color.
  const esp = caseritoConHistoria(PAIS, 'telar', rnd);
  const historia = esp && opciones.includes(esp.color) ? esp : null;
  const color = historia ? historia.color : opciones[Math.floor(rnd() * opciones.length)];
  juego.pedido = { color, cara: Math.floor(rnd() * 1000), historia };
  pintarPedido({ nuevo: true });
}

function pintarSonido() {
  const b = $('#sonido');
  b.setAttribute('aria-label', activo() ? t('sonidoSi') : t('sonidoNo'));
  b.innerHTML = activo()
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
}

function pintarTodo() {
  pintarTelar();
  pintarMano();
  pintarTela();
  pintarDatos();
}

// ---------- Partida ----------

function empezar() {
  juego.telar = A.crearTelar();
  juego.mano = A.nuevaMano(rnd, juego.telar, HILOS);
  juego.puntos = 0;
  juego.tela = [];
  juego.elegida = null;
  juego.seguirUsado = false;
  juego.primerJugada = true;
  juego.bloqueado = false;
  juego.terminado = false;
  juego.pedido = null;
  nuevoPedido();
  pintarTodo();
  jugar(true);
  if (!visto('tuto-aguayo')) {
    abrir({ titulo: texto(TELAR.nombre), texto: `${texto(TELAR.origen)} ${t('tutoAguayo')}`, conCasera: true, botones: [{ texto: t('entendido') }] }).then(() =>
      marcarVisto('tuto-aguayo')
    );
  }
}

function colocarPieza(i, fila, col) {
  const m = juego.mano[i];
  if (!m || juego.bloqueado || juego.terminado) return false;
  const r = A.colocar(juego.telar, m.pieza.celdas, fila, col, m.color);
  if (!r) {
    sonar.no();
    return false;
  }
  juego.mano[i] = null;
  juego.elegida = null;
  juego.telar = r.telar;
  juego.puntos += r.puntos;
  sonar.soltar();
  if (juego.primerJugada) {
    juego.primerJugada = false;
    if (marcarJuego() && obtener().racha > 1) aviso(t('rachaSube', { n: obtener().racha }), { tipo: 'exito' });
  }

  if (r.franjas.length) {
    juego.bloqueado = true;
    pintarTelar({ lleno: r.lleno, tejer: r.franjas });
    sonar.tejer(r.franjas.length);
    const lamina = anotarFranjas(PAIS, r.franjas.length);
    if (lamina) setTimeout(() => aviso(lamina, { tipo: 'exito' }), 900);
    juego.tela = [...r.franjas.map((fr) => fr.colores).reverse(), ...juego.tela].slice(0, MAX_TELA);
    pintarTela(r.franjas.length);
    if (r.franjas.length >= 2) {
      const extra = r.franjas.length - 1;
      sumarYapa(extra);
      confeti({ cantidad: 24 });
      aviso(`${t('variasFranjas', { n: r.franjas.length })} ${t('masYapa', { n: extra })}`, { tipo: 'exito' });
      anuncios.celebrar();
    } else {
      aviso(t('tejido'));
    }
    // ¿El caserito quería una franja de ese color?
    if (r.franjas.some((fr) => fr.dominante === juego.pedido.color)) {
      sumarYapa(YAPA_PEDIDO);
      celebrarNivel(ganarXp('aguayo', 1));
      sonar.servido();
      $('#pedido').classList.add('atendido');
      flotante(`+${YAPA_PEDIDO}`, $('#pedido'));
      aviso(t('vendido'), { tipo: 'exito' });
      const anterior = juego.pedido;
      setTimeout(() => {
        if (juego.pedido === anterior) nuevoPedido();
      }, 700);
    }
    setTimeout(() => {
      juego.bloqueado = false;
      despuesDeJugar();
    }, 400);
  } else {
    despuesDeJugar();
  }
  return true;
}

function despuesDeJugar() {
  if (juego.mano.every((m) => m === null)) juego.mano = A.nuevaMano(rnd, juego.telar, HILOS);
  pintarTelar();
  pintarMano();
  pintarDatos();
  if (A.estaTrabado(juego.telar, juego.mano)) finPartida();
}

/** Piezas que sí caben: la ayuda para seguir tejiendo. */
function manoDeRescate() {
  const mano = [];
  for (let intento = 0; intento < 200 && mano.length < 3; intento++) {
    const pz = A.piezaAlAzar(rnd);
    if (A.hayLugar(juego.telar, pz.celdas)) mano.push({ pieza: pz, color: HILOS[Math.floor(rnd() * HILOS.length)] });
  }
  while (mano.length < 3) mano.push({ pieza: A.pieza('uno'), color: HILOS[Math.floor(rnd() * HILOS.length)] });
  return mano;
}

async function finPartida() {
  // En contrarreloj, trabarse o llenar el canasto termina la ronda con lo hecho.
  if (juego.reloj) return finReloj();
  juego.terminado = true;
  jugar(false);
  sonar.fin();
  const record = juego.puntos > 0 && juego.puntos > datos.record;
  datos.record = Math.max(datos.record, juego.puntos);
  guardar();
  pintarDatos();
  const botones = [];
  if (!juego.seguirUsado) {
    botones.push({ texto: t('piezasNuevas', { n: COSTO_SEGUIR }), valor: 'yapa', deshabilitado: obtener().yapa < COSTO_SEGUIR });
    if (anuncios.hayRecompensa) botones.push({ texto: t('verAnuncio'), valor: 'anuncio', clase: 'hierbabuena' });
  }
  botones.push({ texto: t('otraVez'), valor: 'otra', clase: juego.seguirUsado ? '' : 'secundario' });
  if (juego.puntos > 0) botones.push({ texto: t('retar'), valor: 'retar', clase: 'secundario' });
  botones.push({ texto: t('volverMercado'), valor: 'mercado', clase: 'secundario' });
  const resumen = `${t('hiciste', { n: juego.puntos })}${record ? ` ${t('nuevoRecord')}` : ''}${juego.seguirUsado ? '' : ` ${t('piezasNuevasTexto')}`}`;
  const eleccion = await abrir({ titulo: t('telarTrabado'), texto: resumen, conCasera: true, cerrable: false, botones });

  let sigue = false;
  if (eleccion === 'yapa' && gastarYapa(COSTO_SEGUIR)) sigue = true;
  else if (eleccion === 'anuncio') {
    juego.pausas++;
    sigue = await anuncios.verRecompensa();
    juego.pausas--;
    if (!sigue) aviso(t('anuncioFallo'), { tipo: 'alerta' });
  }
  if (sigue) {
    juego.seguirUsado = true;
    juego.terminado = false;
    juego.mano = manoDeRescate();
    pintarMano();
    jugar(true);
    return;
  }
  if (eleccion === 'retar') {
    const r = await compartir(t('retoAguayo', { n: juego.puntos, tejido: texto(TELAR.nombre) }));
    if (r === 'copiado') aviso(t('copiado'), { tipo: 'exito' });
    juego.terminado = true;
    finPartida();
    return;
  }
  if (eleccion === 'yapa' || eleccion === 'anuncio') {
    finPartida();
    return;
  }
  datos.partidas++;
  guardar();
  if (eleccion === 'mercado') {
    location.href = '../index.html';
    return;
  }
  empezar();
}

// ---------- Arrastrar piezas ----------

let arrastre = null;

function paso() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--celda')) + 3;
}

/** Celda del telar donde caería la esquina de la pieza que se arrastra. */
function celdaBajo(fantasma) {
  const telar = $('#telar').getBoundingClientRect();
  const r = fantasma.getBoundingClientRect();
  const p = paso();
  return { fila: Math.round((r.top - telar.top - 8) / p), col: Math.round((r.left - telar.left - 8) / p) };
}

function moverFantasma(x, y) {
  const { fantasma, tactil } = arrastre;
  const r = fantasma.getBoundingClientRect();
  // En pantallas táctiles la pieza va un poco más arriba para que el dedo no la tape
  const alzado = tactil ? paso() * 1.4 : 0;
  fantasma.style.left = `${x - r.width / 2}px`;
  fantasma.style.top = `${y - r.height / 2 - alzado}px`;
  const { fila, col } = celdaBajo(fantasma);
  const m = juego.mano[arrastre.i];
  const valida = A.cabe(juego.telar, m.pieza.celdas, fila, col);
  arrastre.destino = valida ? { fila, col } : null;
  pintarTelar(valida ? { vista: { celdas: m.pieza.celdas, fila, col, color: m.color } } : {});
}

function empezarArrastre(ev, i) {
  const m = juego.mano[i];
  const fantasma = document.createElement('div');
  fantasma.innerHTML = htmlPieza(m.pieza.celdas, m.color);
  const pieza = fantasma.firstElementChild;
  pieza.classList.add('fantasma');
  document.body.appendChild(pieza);
  arrastre.fantasma = pieza;
  arrastre.activo = true;
  document.querySelector(`.ranura[data-i="${i}"]`)?.classList.add('arrastrando');
  moverFantasma(ev.clientX, ev.clientY);
}

function terminarArrastre() {
  arrastre?.fantasma?.remove();
  document.querySelector('.ranura.arrastrando')?.classList.remove('arrastrando');
  arrastre = null;
}

$('#mano').addEventListener('pointerdown', (ev) => {
  const ranura = ev.target.closest('.ranura[data-i]');
  if (!ranura || juego.bloqueado || juego.pausas || juego.terminado) return;
  const i = Number(ranura.dataset.i);
  arrastre = { i, x0: ev.clientX, y0: ev.clientY, activo: false, tactil: ev.pointerType !== 'mouse', destino: null };
  ranura.setPointerCapture(ev.pointerId);
});

$('#mano').addEventListener('pointermove', (ev) => {
  if (!arrastre) return;
  if (!arrastre.activo) {
    if (Math.hypot(ev.clientX - arrastre.x0, ev.clientY - arrastre.y0) < 8) return;
    empezarArrastre(ev, arrastre.i);
    return;
  }
  moverFantasma(ev.clientX, ev.clientY);
});

$('#mano').addEventListener('pointerup', () => {
  if (!arrastre) return;
  const { i, activo, destino } = arrastre;
  terminarArrastre();
  if (activo) {
    if (destino) colocarPieza(i, destino.fila, destino.col);
    else {
      sonar.no();
      pintarTelar();
    }
    return;
  }
  // Toque sin arrastrar: elegir la pieza y luego tocar el telar
  juego.elegida = juego.elegida === i ? null : i;
  sonar.elegir();
  pintarMano();
});

$('#mano').addEventListener('pointercancel', () => {
  terminarArrastre();
  pintarTelar();
});

/** Con una pieza elegida, tocar una celda la pone con su primer cuadro ahí. */
function anclaEn(celda) {
  const m = juego.mano[juego.elegida];
  const [f0, c0] = m.pieza.celdas[0];
  return { fila: Number(celda.dataset.f) - f0, col: Number(celda.dataset.c) - c0 };
}

$('#telar').addEventListener('click', (ev) => {
  const celda = ev.target.closest('.celda');
  if (!celda || juego.elegida === null) return;
  const { fila, col } = anclaEn(celda);
  colocarPieza(juego.elegida, fila, col);
});

$('#telar').addEventListener('pointermove', (ev) => {
  if (juego.elegida === null || arrastre || ev.pointerType !== 'mouse') return;
  const celda = ev.target.closest('.celda');
  if (!celda) return;
  const m = juego.mano[juego.elegida];
  const { fila, col } = anclaEn(celda);
  pintarTelar(A.cabe(juego.telar, m.pieza.celdas, fila, col) ? { vista: { celdas: m.pieza.celdas, fila, col, color: m.color } } : {});
});

// ---------- Botones ----------

$('#cambiar').addEventListener('click', () => {
  if (juego.bloqueado || juego.pausas || juego.terminado) return;
  if (!gastarYapa(COSTO_CAMBIAR)) {
    aviso(t('faltaYapa'), { tipo: 'alerta' });
    return;
  }
  juego.mano = A.nuevaMano(rnd, juego.telar, HILOS);
  juego.elegida = null;
  sonar.elegir();
  pintarMano();
  if (A.estaTrabado(juego.telar, juego.mano)) finPartida();
});

$('#reiniciar').addEventListener('click', () => {
  if (juego.pausas || juego.bloqueado) return;
  if (juego.puntos > datos.record) {
    datos.record = juego.puntos;
    guardar();
  }
  if (juego.reloj) {
    reloj.detener();
    empezarReloj();
    return;
  }
  empezar();
});

// ---------- Contrarreloj ----------

const barraReloj = montarBarraReloj();
const reloj = crearReloj({
  segundos: SEGUNDOS.aguayo,
  pausado: () => juego.pausas > 0,
  alTic: (resta, total) => pintarReloj(barraReloj, resta, total),
  alTerminar: () => finReloj(),
});

function empezarReloj() {
  juego.reloj = true;
  juego.cerrandoReloj = false;
  $('#contrarreloj').classList.add('activa');
  empezar();
  reloj.empezar();
}

function salirReloj() {
  juego.reloj = false;
  reloj.detener();
  ocultarReloj(barraReloj);
  $('#contrarreloj').classList.remove('activa');
}

/** Se acabó el tiempo (o el juego se trabó): récord, yapa y qué hacer después. */
async function finReloj() {
  if (!juego.reloj || juego.cerrandoReloj) return;
  juego.cerrandoReloj = true;
  reloj.detener();
  juego.terminado = true;
  jugar(false);
  const puntos = juego.puntos;
  const nuevoRecord = puntos > 0 && puntos > (datos.relojRecord || 0);
  if (nuevoRecord) datos.relojRecord = puntos;
  guardar();
  const eleccion = await finContrarreloj({ hecho: t('relojPuntos', { n: puntos }), nuevoRecord, yapa: yapaReloj(puntos, 20, nuevoRecord) });
  if (eleccion === 'otra') return empezarReloj();
  salirReloj();
  if (eleccion === 'mercado') {
    location.href = '../index.html';
    return;
  }
  empezar();
}

$('#contrarreloj').addEventListener('click', async () => {
  if (juego.pausas) return;
  if (juego.reloj) {
    salirReloj();
    empezar();
    return;
  }
  juego.pausas++;
  const si = await preguntarContrarreloj({ segundos: SEGUNDOS.aguayo, que: t('relojQueTelar'), record: datos.relojRecord });
  juego.pausas--;
  if (si) empezarReloj();
});

$('#sonido').addEventListener('click', () => {
  alternar();
  pintarSonido();
});

// ---------- Arranque ----------

function iniciar() {
  window.QHATU_LISTO = true;
  document.body.dataset.textura = TELAR.textura;
  iniciarPlataforma({ esPuesto: true });
  const fiesta = jugarEnFiesta(PAIS);
  if (fiesta) setTimeout(() => aviso(fiesta, { tipo: 'exito' }), 1200);
  aplicarDecoracion();
  aplicarTextos();
  // El nombre del puesto es el del tejido del país (y se mantiene al cambiar de idioma)
  const titulo = $('.barra-puesto');
  titulo.removeAttribute('data-t');
  const ponerNombre = () => {
    titulo.textContent = texto(TELAR.nombre);
    document.title = `${texto(TELAR.nombre)} · Qhatu`;
  };
  ponerNombre();
  document.addEventListener('qhatu:idioma', ponerNombre);
  $('#chip-yapa').innerHTML = chipYapa();
  contadorYapa();
  if (EN_PORTAL) $('#volver').hidden = true;
  $('#cambiar span').textContent = t('cambiarFruta');
  const costo = document.createElement('small');
  costo.className = 'costo';
  costo.textContent = String(COSTO_CAMBIAR);
  $('#cambiar').appendChild(costo);
  pintarSonido();
  document.addEventListener('qhatu:idioma', () => {
    pintarPedido();
    pintarMano();
    pintarSonido();
  });
  new ResizeObserver(medirTelar).observe($('#telar-zona'));
  medirTelar();
  empezar();
  iniciarAnuncios().then(() => {
    anuncios.cargaLista();
    if (juego.jugando) anuncios.inicioPartida();
  });
}

iniciar();

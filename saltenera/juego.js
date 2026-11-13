// La Salteñera: el horno, las mejoras, las ventas mientras no juegas, el caserito, la yapa y los anuncios.

import * as S from './logica.js';
import { obtener, guardar, puesto, sumarYapa, gastarYapa, marcarJuego, visto, marcarVisto } from '../shared/almacen.js';
import { t, aplicarTextos, nombreMejora } from '../shared/i18n.js';
import { sonar, alternar, activo } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios } from '../shared/anuncios.js';
import { EN_PORTAL } from '../shared/config.js';
import { chipYapa, contadorYapa, aviso, flotante, ventana, confeti, celebrarNivel, escapar } from '../shared/ui.js';
import { caserito } from '../shared/marca.js';
import { aplicarDecoracion } from '../shared/decoracion.js';
import { ganarXp } from '../shared/progreso.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { paisActual, pais as datosPais, texto as enIdioma } from '../shared/paises.js';
import { svgComida, PARRILLA } from './comidas.js';

const COSTO_PICO = 15;

const $ = (sel) => document.querySelector(sel);
const datos = puesto('saltenera');
datos.e = { ...S.estadoInicial(), ...(datos.e || {}) };
const e = datos.e;

const juego = { pausas: 0, jugando: false, primerToque: true };

const ICONOS = {
  mano: '<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5m0-1V4.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.9-2.6L4 14.5a1.6 1.6 0 0 1 2.6-1.8L8 14.5"/>',
  horno: '<path d="M4 20V11a8 8 0 0 1 16 0v9z"/><path d="M9 20v-5a3 3 0 0 1 6 0v5"/>',
  ayudante: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  carrito: '<path d="M3 5h3l2 10h10l2-7H7"/><circle cx="9.5" cy="19" r="1.6"/><circle cx="17" cy="19" r="1.6"/>',
  local: '<path d="M4 10l1.5-5h13L20 10M5 10v10h14V10M4 10h16M10 20v-5h4v5"/>',
  receta: '<path d="M3 16c0-6 4-10 9-10s9 4 9 10c0 1.5-2 2-9 2s-9-.5-9-2z"/><path d="M5 11q2-3 3.500 0t3.500 0 3.500 0 3.500 0"/>',
};

// La comida, la moneda y la cocina son las del país donde está el jugador.
const PAIS_DATOS = datosPais(paisActual(obtener()));
const COMIDA = svgComida(PAIS_DATOS.comida.dibujo);

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
    if (!juego.pausas) jugar(true);
  }
}

function bs(n) {
  return `${PAIS_DATOS.moneda} ${S.formato(n)}`;
}

function recordar() {
  e.ultimaVez = Date.now();
  guardar();
}

// ---------- Pintar ----------

function efecto(m) {
  if (m.tipo === 'toque') return t('porToque', { n: S.formato(m.valor * S.multiplicador(e)) });
  if (m.tipo === 'auto') return t('porSegundo', { n: `+${S.formato(m.valor * S.multiplicador(e))}` });
  return '×1,5';
}

function pintarMejoras(comprada = null) {
  $('#mejoras').innerHTML = S.MEJORAS.map((m) => {
    const tope = S.alTope(e, m.id);
    const precio = S.costo(e, m.id);
    const boton = tope
      ? '<span class="sello-tope">MAX</span>'
      : `<button class="boton" type="button" data-mejora="${m.id}" ${e.ventas < precio ? 'disabled' : ''}>${escapar(bs(precio))}</button>`;
    return `<article class="mejora${comprada === m.id ? ' nueva-compra' : ''}" data-id="${m.id}">
      <span class="mejora-icono"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONOS[m.id]}</svg></span>
      <div><h3>${escapar(nombreMejora(m.id === 'horno' && PAIS_DATOS.cocina === 'parrilla' ? 'parrilla' : m.id))}</h3><p>${escapar(efecto(m))} · ${escapar(t('tienes', { n: S.cantidad(e, m.id) }))}</p></div>
      ${boton}
    </article>`;
  }).join('');
}

function pintarBotones() {
  for (const b of document.querySelectorAll('[data-mejora]')) b.disabled = e.ventas < S.costo(e, b.dataset.mejora);
}

function pintarNumeros() {
  $('#ventas').textContent = S.formato(e.ventas);
  $('#ritmo').textContent = t('porSegundo', { n: bs(S.porSegundo(e) * (S.enPico(e, Date.now()) ? 2 : 1)) });
  $('#por-toque').textContent = t('porToque', { n: S.formato(S.porToque(e) * (S.enPico(e, Date.now()) ? 2 : 1)) });
}

function pintarPedido({ nuevo = false } = {}) {
  const p = e.pedido;
  if (!p) return;
  $('#pedido-cara').innerHTML = caserito(p.cara, PAIS_DATOS.sombreros);
  const texto = t('quiereSaltenas', { n: p.cantidad, comida: enIdioma(PAIS_DATOS.comida.plural) });
  $('#pedido-texto').textContent = texto;
  $('#pedido-avance').style.width = `${Math.min(100, (p.hechas / p.cantidad) * 100)}%`;
  const caja = $('#pedido');
  caja.classList.remove('atendido');
  if (nuevo) {
    caja.classList.remove('llega');
    void caja.offsetWidth;
    caja.classList.add('llega');
  }
}

function pintarPico() {
  const ahora = Date.now();
  const enPico = S.enPico(e, ahora);
  document.body.classList.toggle('pico', enPico);
  $('#pico').classList.toggle('activa', enPico);
  $('#pico-texto').textContent = enPico
    ? t('horaPicoActiva', { n: Math.ceil((e.picoHasta - ahora) / 1000) })
    : t('horaPicoBoton', { n: COSTO_PICO });
}

function pintarSonido() {
  const b = $('#sonido');
  b.setAttribute('aria-label', activo() ? t('sonidoSi') : t('sonidoNo'));
  b.innerHTML = activo()
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
}

// ---------- Jugadas ----------

function salteVuela(x, y, monto) {
  if (!document.body.animate) return;
  const s = document.createElement('div');
  s.className = 'saltena-vuela';
  s.innerHTML = COMIDA;
  s.style.left = `${x - 20}px`;
  s.style.top = `${y - 14}px`;
  document.body.appendChild(s);
  const dx = (Math.random() - 0.5) * 160;
  s.animate(
    [
      { transform: 'translate(0,0) scale(0.6) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.6}px,-90px) scale(1) rotate(${dx}deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px,-40px) scale(0.9) rotate(${dx * 2}deg)`, opacity: 0 },
    ],
    { duration: 650, easing: 'ease-out' }
  ).onfinish = () => s.remove();
  const n = document.createElement('div');
  n.className = 'flotante';
  n.textContent = `+${S.formato(monto)}`;
  n.style.left = `${x + dx * 0.3}px`;
  n.style.top = `${y - 50}px`;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 1000);
}

function revisarHitos() {
  for (const h of S.revisarHitos(e)) {
    sumarYapa(h.yapa);
    sonar.servido();
    confeti({ cantidad: 28 });
    aviso(t('hito', { n: bs(h.umbral), yapa: h.yapa }), { tipo: 'exito' });
  }
}

function alTocar(ev) {
  if (juego.pausas) return;
  const monto = S.toque(e, Date.now());
  const r = $('#horno').getBoundingClientRect();
  const x = ev.clientX || r.left + r.width / 2;
  const y = ev.clientY || r.top + r.height * 0.6;
  salteVuela(x, y, monto);
  sonar.caer();
  if (juego.primerToque) {
    juego.primerToque = false;
    if (marcarJuego() && obtener().racha > 1) aviso(t('rachaSube', { n: obtener().racha }), { tipo: 'exito' });
  }
  if (e.pedido) $('#pedido-avance').style.width = `${Math.min(100, (e.pedido.hechas / e.pedido.cantidad) * 100)}%`;
  if (S.pedidoListo(e)) {
    const propina = S.entregarPedido(e);
    sumarYapa(S.YAPA_PEDIDO);
    sonar.servido();
    $('#pedido').classList.add('atendido');
    flotante(`+${S.YAPA_PEDIDO}`, $('#pedido'));
    aviso(`${t('vendido')} +${bs(propina)}`, { tipo: 'exito' });
    celebrarNivel(ganarXp('saltenera', 1));
    setTimeout(() => {
      if (!e.pedido) {
        S.nuevoPedido(e, Math.floor(Math.random() * 1000));
        pintarPedido({ nuevo: true });
      }
    }, 700);
  }
  revisarHitos();
  pintarNumeros();
  pintarBotones();
}

function comprarMejora(id) {
  if (!S.comprar(e, id)) {
    sonar.no();
    return;
  }
  sonar.yapa();
  pintarMejoras(id);
  pintarNumeros();
  recordar();
}

async function horaPico() {
  if (juego.pausas || S.enPico(e, Date.now())) return;
  const botones = [{ texto: t('horaPicoBoton', { n: COSTO_PICO }), valor: 'yapa', deshabilitado: obtener().yapa < COSTO_PICO }];
  if (anuncios.hayRecompensa) botones.push({ texto: t('verAnuncio'), valor: 'anuncio', clase: 'hierbabuena' });
  botones.push({ texto: t('cerrar'), valor: null, clase: 'secundario' });
  const eleccion = await abrir({ titulo: t('horaPico'), texto: t('horaPicoDesc'), botones });
  let ok = false;
  if (eleccion === 'yapa') ok = gastarYapa(COSTO_PICO);
  else if (eleccion === 'anuncio') {
    juego.pausas++;
    ok = await anuncios.verRecompensa();
    juego.pausas--;
    if (!ok) aviso(t('anuncioFallo'), { tipo: 'alerta' });
  }
  if (!ok) return;
  S.empezarPico(e, Date.now());
  sonar.servido();
  pintarPico();
  pintarNumeros();
  pintarMejoras();
  recordar();
}

/** Lo que vendió el puesto mientras el juego estuvo cerrado o en segundo plano. */
async function cobrarLoDeFuera() {
  const monto = S.gananciaFuera(e, Date.now());
  e.ultimaVez = Date.now();
  if (monto <= 0 || juego.pausas) return;
  const botones = [{ texto: t('cobrar'), valor: 'una' }];
  if (anuncios.hayRecompensa) botones.push({ texto: t('cobrarDoble'), valor: 'doble', clase: 'hierbabuena' });
  const eleccion = await abrir({
    titulo: t('mientrasNoEstabas'),
    texto: t('vendisteFuera', { n: bs(monto) }),
    conCasera: true,
    cerrable: false,
    botones,
  });
  let total = monto;
  if (eleccion === 'doble') {
    juego.pausas++;
    const vio = await anuncios.verRecompensa();
    juego.pausas--;
    if (vio) total = monto * 2;
    else aviso(t('anuncioFallo'), { tipo: 'alerta' });
  }
  S.cobrarFuera(e, total);
  sonar.yapa();
  revisarHitos();
  pintarNumeros();
  pintarMejoras();
  recordar();
}

// ---------- Bucle ----------

let ultimo = performance.now();
let reposo = 0;
function bucle(ahora) {
  const dt = Math.min(0.25, (ahora - ultimo) / 1000);
  ultimo = ahora;
  if (!juego.pausas && !document.hidden) {
    S.avanzar(e, dt, Date.now());
    reposo += dt;
    $('#ventas').textContent = S.formato(e.ventas);
    if (reposo >= 0.25) {
      reposo = 0;
      pintarBotones();
      pintarPico();
      revisarHitos();
    }
  }
  requestAnimationFrame(bucle);
}

// ---------- Arranque ----------

function iniciar() {
  window.QHATU_LISTO = true;
  iniciarPlataforma({ esPuesto: true });
  aplicarDecoracion();
  aplicarTextos();
  if (PAIS_DATOS.cocina === 'parrilla') $('#horno').innerHTML = PARRILLA;
  $('#moneda').textContent = PAIS_DATOS.moneda;
  // El nombre del puesto es el de la comida del país (y se mantiene al cambiar de idioma)
  const titulo = $('.barra-puesto');
  titulo.removeAttribute('data-t');
  const ponerNombre = () => {
    titulo.textContent = enIdioma(PAIS_DATOS.comida.puesto);
    document.title = `${enIdioma(PAIS_DATOS.comida.puesto)} · Qhatu`;
  };
  ponerNombre();
  document.addEventListener('qhatu:idioma', ponerNombre);
  $('#chip-yapa').innerHTML = chipYapa();
  contadorYapa();
  if (EN_PORTAL) $('#volver').hidden = true;
  if (!e.pedido) S.nuevoPedido(e, Math.floor(Math.random() * 1000));
  pintarSonido();
  pintarMejoras();
  pintarNumeros();
  pintarPedido();
  pintarPico();

  $('#horno').addEventListener('pointerdown', (ev) => {
    alTocar(ev);
    const h = $('#horno');
    h.classList.add('golpe');
    setTimeout(() => h.classList.remove('golpe'), 90);
  });
  $('#horno').addEventListener('keydown', (ev) => {
    if (ev.key === ' ' || ev.key === 'Enter') {
      ev.preventDefault();
      if (!ev.repeat) alTocar(ev);
    }
  });
  $('#mejoras').addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-mejora]');
    if (b) comprarMejora(b.dataset.mejora);
  });
  $('#pico').addEventListener('click', horaPico);
  $('#sonido').addEventListener('click', () => {
    alternar();
    pintarSonido();
  });
  document.addEventListener('qhatu:idioma', () => {
    pintarMejoras();
    pintarNumeros();
    pintarPedido();
    pintarPico();
    pintarSonido();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) recordar();
    else cobrarLoDeFuera();
  });
  window.addEventListener('pagehide', recordar);
  setInterval(() => {
    if (!document.hidden) recordar();
  }, 5000);

  jugar(true);
  requestAnimationFrame(bucle);
  iniciarAnuncios().then(async () => {
    anuncios.cargaLista();
    if (juego.jugando) anuncios.inicioPartida();
    if (!visto('tuto-saltenera')) {
      e.ultimaVez = Date.now();
      await abrir({ titulo: enIdioma(PAIS_DATOS.comida.puesto), texto: t('tutoSaltenera'), conCasera: true, botones: [{ texto: t('entendido') }] });
      marcarVisto('tuto-saltenera');
    } else {
      cobrarLoDeFuera();
    }
  });
}

iniciar();

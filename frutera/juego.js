// La Frutera: el canasto en pantalla, los controles, el caserito con su pedido, la yapa y los anuncios.

import * as F from './fisica.js';
import { ULTIMA, frutaAlAzar, dibujarFruta, frutasDe, nombreFruta } from './frutas.js';
import { paisActual, pais as datosPais } from '../shared/paises.js';
import { obtener, guardar, puesto, sumarYapa, gastarYapa, marcarJuego, visto, marcarVisto } from '../shared/almacen.js';
import { t, aplicarTextos } from '../shared/i18n.js';
import { sonar, alternar, activo } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios } from '../shared/anuncios.js';
import { EN_PORTAL } from '../shared/config.js';
import { chipYapa, contadorYapa, aviso, flotante, ventana, confeti, celebrarNivel } from '../shared/ui.js';
import { caserito, casera } from '../shared/marca.js';
import { compartir } from '../shared/compartir.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { caseritoConHistoria, htmlCaserito, esCasera, anotarFruta, jugarEnFiesta } from '../shared/album.js';
import { aplicarDecoracion } from '../shared/decoracion.js';
import { ganarXp } from '../shared/progreso.js';

const COSTO_CAMBIAR = 5;
const COSTO_SEGUIR = 20;
const YAPA_PAPAYAS = 10;
const ESPERA_SOLTAR = 0.45;

const $ = (sel) => document.querySelector(sel);
const datos = puesto('frutera');
// Las frutas del canasto son las del país donde está el jugador.
const PAIS = paisActual(obtener());
const FRUTAS = frutasDe(PAIS);
datos.record ??= 0;
datos.partidas ??= 0;

const rnd = Math.random;
const lienzo = $('#canasto');
const ctx = lienzo.getContext('2d');

const juego = {
  mundo: null,
  enMano: 0,
  siguiente: 0,
  x: F.CANASTO.ancho / 2,
  espera: 0,
  pedido: null,
  ventas: 0,
  seguirUsado: false,
  primerSoltar: true,
  pausas: 0,
  jugando: false,
  efectos: [],
  vista: { escala: 1, x: 0, y: 0, dpr: 1 },
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
    if (!juego.pausas && juego.mundo && !juego.mundo.terminado) jugar(true);
  }
}

/** Ventas por fruta: más yapa por frutas más grandes. */
function yapaPorVenta(nivel) {
  return 2 + Math.floor(nivel / 2);
}

function pintarMini(canvas, nivel) {
  const dpr = window.devicePixelRatio || 1;
  const lado = 40;
  canvas.width = lado * dpr;
  canvas.height = lado * dpr;
  const c = canvas.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, lado, lado);
  c.translate(lado / 2, lado / 2 + (FRUTAS[nivel].arriba === 'corona' ? 4 : 2));
  dibujarFruta(c, FRUTAS[nivel], 13);
}

// ---------- Pantalla de datos ----------

function pintarDatos() {
  $('#puntos').textContent = juego.mundo.puntos;
  $('#record').textContent = Math.max(datos.record, juego.mundo.puntos);
  pintarMini($('#sigue'), juego.siguiente);
}

function pintarPedido({ nuevo = false } = {}) {
  const p = juego.pedido;
  $('#pedido-cara').innerHTML = esCasera(p.historia) ? casera(PAIS) : caserito(p.cara, datosPais(PAIS).sombreros);
  pintarMini($('#pedido-fruta'), p.nivel);
  const texto = t('quiereFruta', { fruta: nombreFruta(FRUTAS[p.nivel]) });
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
  const tope = Math.min(ULTIMA - 2, Math.max(4, juego.mundo.mayor + 2));
  const desde = 3;
  let nivel = desde + Math.floor(rnd() * (tope - desde + 1));
  if (juego.pedido && nivel === juego.pedido.nivel) nivel = Math.min(tope, nivel + 1);
  // A veces llega un caserito con nombre que pide su fruta (si ya puede salir en el canasto).
  const esp = caseritoConHistoria(PAIS, 'frutera', rnd);
  const suya = esp ? FRUTAS.findIndex((f) => f.id === esp.fruta) : -1;
  const historia = suya >= desde && suya <= tope ? esp : null;
  if (historia) nivel = suya;
  juego.pedido = { nivel, cara: Math.floor(rnd() * 1000), historia };
  pintarPedido({ nuevo: true });
}

function pintarSonido() {
  const b = $('#sonido');
  b.setAttribute('aria-label', activo() ? t('sonidoSi') : t('sonidoNo'));
  b.innerHTML = activo()
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
}

// ---------- Partida ----------

function empezar() {
  juego.mundo = F.crearMundo();
  juego.enMano = frutaAlAzar(rnd);
  juego.siguiente = frutaAlAzar(rnd);
  juego.x = F.CANASTO.ancho / 2;
  juego.espera = 0;
  juego.ventas = 0;
  juego.seguirUsado = false;
  juego.primerSoltar = true;
  juego.efectos = [];
  juego.pedido = null;
  nuevoPedido();
  pintarDatos();
  jugar(true);
  if (!visto('tuto-frutera')) {
    abrir({ titulo: t('frutera'), texto: t('tutoFrutera'), conCasera: true, botones: [{ texto: t('entendido') }] }).then(() =>
      marcarVisto('tuto-frutera')
    );
  }
}

function avisarLamina(texto) {
  if (texto) aviso(texto, { tipo: 'exito' });
}

function soltarFruta() {
  const m = juego.mundo;
  if (juego.pausas || m.terminado || juego.espera > 0) return;
  F.soltar(m, juego.enMano, juego.x);
  avisarLamina(anotarFruta(PAIS, FRUTAS[juego.enMano].id));
  sonar.soltar();
  juego.enMano = juego.siguiente;
  juego.siguiente = frutaAlAzar(rnd);
  juego.espera = ESPERA_SOLTAR;
  if (juego.primerSoltar) {
    juego.primerSoltar = false;
    if (marcarJuego() && obtener().racha > 1) aviso(t('rachaSube', { n: obtener().racha }), { tipo: 'exito' });
  }
  pintarDatos();
}

function alEvento(e) {
  const m = juego.mundo;
  if (e.tipo === 'papayas') {
    sonar.servido();
    sumarYapa(YAPA_PAPAYAS);
    confeti();
    celebrarNivel(ganarXp('frutera', 3));
    aviso(`${t('papayas')} ${t('masYapa', { n: YAPA_PAPAYAS })}`, { tipo: 'exito' });
    juego.efectos.push({ tipo: 'estallido', x: e.x, y: e.y, color: FRUTAS[ULTIMA].color, r: 80, vida: 0 });
    anuncios.celebrar();
    return;
  }
  sonar.union(e.nivel);
  avisarLamina(anotarFruta(PAIS, FRUTAS[e.nivel].id));
  juego.efectos.push({ tipo: 'estallido', x: e.x, y: e.y, color: FRUTAS[e.nivel].color, r: FRUTAS[e.nivel].r, vida: 0 });
  if (juego.pedido && e.nivel === juego.pedido.nivel) {
    // El caserito se lleva la fruta: deja espacio en el canasto
    F.quitarFruta(m, e.id);
    const yapa = yapaPorVenta(e.nivel);
    sumarYapa(yapa);
    celebrarNivel(ganarXp('frutera', 1));
    juego.ventas++;
    sonar.servido();
    juego.efectos.push({ tipo: 'venta', nivel: e.nivel, x: e.x, y: e.y, vida: 0 });
    $('#pedido').classList.add('atendido');
    flotante(`+${yapa}`, $('#pedido'));
    aviso(t('vendido'), { tipo: 'exito' });
    const anterior = juego.pedido;
    setTimeout(() => {
      if (juego.pedido === anterior) nuevoPedido();
    }, 700);
  }
}

async function finPartida() {
  const m = juego.mundo;
  jugar(false);
  sonar.fin();
  const record = m.puntos > 0 && m.puntos > datos.record;
  datos.record = Math.max(datos.record, m.puntos);
  guardar();
  pintarDatos();
  const botones = [];
  if (!juego.seguirUsado) {
    botones.push({ texto: t('seguirCanasto', { n: COSTO_SEGUIR }), valor: 'yapa', deshabilitado: obtener().yapa < COSTO_SEGUIR });
    if (anuncios.hayRecompensa) botones.push({ texto: t('verAnuncio'), valor: 'anuncio', clase: 'hierbabuena' });
  }
  botones.push({ texto: t('otraVez'), valor: 'otra', clase: juego.seguirUsado ? '' : 'secundario' });
  if (m.puntos > 0) botones.push({ texto: t('retar'), valor: 'retar', clase: 'secundario' });
  botones.push({ texto: t('volverMercado'), valor: 'mercado', clase: 'secundario' });
  const resumen = `${t('hiciste', { n: m.puntos })}${record ? ` ${t('nuevoRecord')}` : ''}${juego.seguirUsado ? '' : ` ${t('seguirTexto')}`}`;
  const eleccion = await abrir({ titulo: t('canastoLleno'), texto: resumen, conCasera: true, cerrable: false, botones });

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
    F.despejarBorde(m);
    jugar(true);
    return;
  }
  if (eleccion === 'retar') {
    const r = await compartir(t('retoFrutera', { n: m.puntos }));
    if (r === 'copiado') aviso(t('copiado'), { tipo: 'exito' });
    
    finPartida();
    return;
  }
  if (eleccion === 'yapa' || eleccion === 'anuncio') {
    // No se pudo seguir: vuelve a mostrar las opciones
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

// ---------- Dibujo ----------

function ajustarLienzo() {
  const dpr = window.devicePixelRatio || 1;
  const ancho = lienzo.clientWidth;
  const alto = lienzo.clientHeight;
  lienzo.width = Math.round(ancho * dpr);
  lienzo.height = Math.round(alto * dpr);
  const escala = Math.min(ancho / F.CANASTO.ancho, alto / F.CANASTO.alto);
  juego.vista = { escala, x: (ancho - F.CANASTO.ancho * escala) / 2, y: (alto - F.CANASTO.alto * escala) / 2, dpr };
}

function dibujarCanasto() {
  const { izq, der, piso, borde } = F.CANASTO;
  // Fondo del canasto
  ctx.fillStyle = '#211a2b';
  ctx.beginPath();
  ctx.roundRect(izq, borde - 24, der - izq, piso - borde + 24, [0, 0, 18, 18]);
  ctx.fill();
}

function dibujarParedes() {
  const { izq, der, piso, borde } = F.CANASTO;
  const grosor = 14;
  const alto = piso - borde + 24 + grosor;
  // Paredes y fondo tejidos
  const tejido = (x, y, w, h) => {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.clip();
    ctx.fillStyle = '#96502a';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#6e3a1d';
    ctx.lineWidth = 3;
    for (let k = -h; k < w + h; k += 10) {
      ctx.beginPath();
      ctx.moveTo(x + k, y);
      ctx.lineTo(x + k + h, y + h);
      ctx.stroke();
    }
    ctx.strokeStyle = '#b8703f';
    ctx.lineWidth = 2;
    for (let k = -h; k < w + h; k += 10) {
      ctx.beginPath();
      ctx.moveTo(x + k + h, y);
      ctx.lineTo(x + k, y + h);
      ctx.stroke();
    }
    ctx.restore();
  };
  tejido(izq - grosor, borde - 24, grosor, alto);
  tejido(der, borde - 24, grosor, alto);
  tejido(izq - grosor, piso, der - izq + grosor * 2, grosor);
  // Franjas de aguayo en el borde de las paredes
  const colores = ['#ef476f', '#ffb520', '#1fb5a5', '#9a48b8', '#a6d63a'];
  colores.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(izq - grosor, borde - 24 + i * 5, grosor, 4);
    ctx.fillRect(der, borde - 24 + i * 5, grosor, 4);
  });
}

function dibujarBorde() {
  const { izq, der, borde } = F.CANASTO;
  const m = juego.mundo;
  const alerta = m.peligro > 0;
  ctx.save();
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  const pulso = alerta ? 0.5 + 0.5 * Math.sin(performance.now() / 120) : 0;
  ctx.strokeStyle = alerta ? `rgba(239,71,111,${0.5 + pulso * 0.5})` : 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.moveTo(izq, borde);
  ctx.lineTo(der, borde);
  ctx.stroke();
  ctx.restore();
}

function dibujarEnMano() {
  if (juego.espera > 0 || juego.mundo.terminado) return;
  const r = F.radio(juego.enMano);
  const x = F.limitarX(juego.enMano, juego.x);
  // Guía de caída
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.setLineDash([3, 7]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, F.CANASTO.soltarY + r);
  ctx.lineTo(x, F.CANASTO.piso);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(x, F.CANASTO.soltarY);
  dibujarFruta(ctx, FRUTAS[juego.enMano], r);
  ctx.restore();
}

function dibujarEfectos(dt) {
  juego.efectos = juego.efectos.filter((e) => (e.vida += dt) < 0.6);
  for (const e of juego.efectos) {
    const k = e.vida / 0.6;
    ctx.save();
    if (e.tipo === 'estallido') {
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 4 * (1 - k) + 1;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * (1 + k * 0.6), 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = e.color;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const d = e.r * (1 + k * 0.9);
        ctx.beginPath();
        ctx.arc(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, 3 * (1 - k) + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (e.tipo === 'venta') {
      // La fruta vendida sube y se va
      ctx.globalAlpha = 1 - k;
      ctx.translate(e.x, e.y - k * 120);
      dibujarFruta(ctx, FRUTAS[e.nivel], FRUTAS[e.nivel].r * (1 - k * 0.4));
    }
    ctx.restore();
  }
}

function dibujar(dt) {
  const { escala, x, y, dpr } = juego.vista;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, lienzo.width, lienzo.height);
  ctx.setTransform(dpr * escala, 0, 0, dpr * escala, dpr * x, dpr * y);
  dibujarCanasto();
  for (const f of juego.mundo.frutas) {
    ctx.save();
    ctx.translate(f.x, f.y);
    dibujarFruta(ctx, FRUTAS[f.nivel], f.r, f.ang);
    ctx.restore();
  }
  dibujarParedes();
  dibujarBorde();
  dibujarEnMano();
  dibujarEfectos(dt);
}

// ---------- Bucle ----------

let ultimo = performance.now();
let acumulado = 0;
const PASO = 1 / 60;

function bucle(ahora) {
  const dt = Math.min(0.1, (ahora - ultimo) / 1000);
  ultimo = ahora;
  const m = juego.mundo;
  const corriendo = !juego.pausas && !document.hidden && !m.terminado;
  if (corriendo) {
    acumulado += dt;
    let cambio = false;
    while (acumulado >= PASO) {
      acumulado -= PASO;
      for (const e of F.paso(m, PASO)) {
        alEvento(e);
        cambio = true;
      }
    }
    if (juego.espera > 0) juego.espera = Math.max(0, juego.espera - dt);
    if (cambio) pintarDatos();
    if (m.terminado) finPartida();
  } else {
    acumulado = 0;
  }
  dibujar(corriendo ? dt : 0);
  requestAnimationFrame(bucle);
}

// ---------- Controles ----------

function xDelPuntero(ev) {
  const r = lienzo.getBoundingClientRect();
  const { escala, x } = juego.vista;
  return (ev.clientX - r.left - x) / escala;
}

let arrastrando = false;
lienzo.addEventListener('pointerdown', (ev) => {
  arrastrando = true;
  lienzo.setPointerCapture(ev.pointerId);
  juego.x = xDelPuntero(ev);
});
lienzo.addEventListener('pointermove', (ev) => {
  if (arrastrando || ev.pointerType === 'mouse') juego.x = xDelPuntero(ev);
});
lienzo.addEventListener('pointerup', (ev) => {
  if (!arrastrando) return;
  arrastrando = false;
  juego.x = xDelPuntero(ev);
  soltarFruta();
});
lienzo.addEventListener('pointercancel', () => {
  arrastrando = false;
});
lienzo.addEventListener('keydown', (ev) => {
  if (ev.key === 'ArrowLeft') juego.x -= 14;
  else if (ev.key === 'ArrowRight') juego.x += 14;
  else if (ev.key === ' ' || ev.key === 'Enter') soltarFruta();
  else return;
  juego.x = Math.max(F.CANASTO.izq, Math.min(F.CANASTO.der, juego.x));
  ev.preventDefault();
});

$('#cambiar').addEventListener('click', () => {
  if (juego.pausas || juego.mundo.terminado) return;
  if (!gastarYapa(COSTO_CAMBIAR)) {
    aviso(t('faltaYapa'), { tipo: 'alerta' });
    return;
  }
  let otra = frutaAlAzar(rnd);
  for (let i = 0; i < 6 && otra === juego.enMano; i++) otra = frutaAlAzar(rnd);
  juego.enMano = otra;
  sonar.elegir();
});
$('#reiniciar').addEventListener('click', () => {
  if (juego.pausas) return;
  if (juego.mundo.puntos > datos.record) {
    datos.record = juego.mundo.puntos;
    guardar();
  }
  empezar();
});
$('#sonido').addEventListener('click', () => {
  alternar();
  pintarSonido();
});

// ---------- Arranque ----------

function iniciar() {
  window.QHATU_LISTO = true;
  iniciarPlataforma({ esPuesto: true });
  setTimeout(() => avisarLamina(jugarEnFiesta(PAIS)), 1200);
  aplicarDecoracion();
  aplicarTextos();
  $('#chip-yapa').innerHTML = chipYapa();
  contadorYapa();
  if (EN_PORTAL) $('#volver').hidden = true;
  const costo = document.createElement('small');
  costo.className = 'costo';
  costo.textContent = String(COSTO_CAMBIAR);
  $('#cambiar').appendChild(costo);
  pintarSonido();
  document.addEventListener('qhatu:idioma', () => {
    pintarPedido();
    pintarSonido();
  });
  new ResizeObserver(ajustarLienzo).observe(lienzo);
  ajustarLienzo();
  empezar();
  requestAnimationFrame(bucle);
  iniciarAnuncios().then(() => {
    anuncios.cargaLista();
    if (juego.jugando) anuncios.inicioPartida();
  });
}

iniciar();

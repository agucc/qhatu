// Portada: el mercado. La Casera entrega la yapa diaria y cada puesto lleva a su juego.

import { obtener, guardar, diaLocal, rachaVigente, regaloDisponible, recibirRegalo, montoRegalo, alCambiar } from './shared/almacen.js';
import { t, aplicarTextos, IDIOMAS, idioma, cambiarIdioma } from './shared/i18n.js';
import { logo, casera, toldo, COLORES } from './shared/marca.js';
import { chipYapa, contadorYapa, flotante, aviso, escapar } from './shared/ui.js';
import { sonar } from './shared/sonido.js';
import { EN_APP } from './shared/config.js';

// Enlaces siempre a un archivo .html: dentro de la app Android, una ruta de carpeta
// ("refresquera/") devuelve la portada en vez del puesto.
const PUESTOS = [
  { id: 'refresquera', url: 'refresquera/index.html', listo: true, color: COLORES.api, dibujo: dibujoRefresquera },
  { id: 'frutera', listo: false, color: COLORES.frutilla, dibujo: dibujoFrutera },
  { id: 'aguayo', listo: false, color: COLORES.hierbabuena, dibujo: dibujoAguayo },
  { id: 'saltenera', listo: false, color: COLORES.tumbo, dibujo: dibujoSaltenera },
];

function dibujoRefresquera() {
  const vasos = [
    [COLORES.api, COLORES.frutilla, COLORES.tumbo, COLORES.api],
    [COLORES.tumbo, COLORES.hierbabuena, COLORES.frutilla, COLORES.frutilla],
    [COLORES.limonada, COLORES.limonada, COLORES.limonada, COLORES.limonada],
  ];
  return `<svg viewBox="0 0 120 80" aria-hidden="true">${vasos
    .map((capas, i) => {
      const x = 14 + i * 34;
      const relleno = capas.map((c, k) => `<rect x="${x + 2}" y="${66 - k * 14}" width="20" height="14" fill="${c}"/>`).join('');
      return `<g><clipPath id="vp${i}"><rect x="${x + 2}" y="8" width="20" height="70" rx="9"/></clipPath><g clip-path="url(#vp${i})">${relleno}</g><rect x="${x}" y="6" width="24" height="74" rx="11" fill="none" stroke="#8a7f9c" stroke-width="2"/></g>`;
    })
    .join('')}</svg>`;
}

function dibujoFrutera() {
  return `<svg viewBox="0 0 120 80" aria-hidden="true">
    <path d="M14 40h92l-10 36H24z" fill="${COLORES.mocochinchi}"/>
    <path d="M18 48h84M21 58h78M24 68h72" stroke="#00000033" stroke-width="2"/>
    <circle cx="42" cy="34" r="13" fill="${COLORES.tumbo}"/>
    <circle cx="70" cy="30" r="17" fill="${COLORES.limonada}"/>
    <circle cx="92" cy="37" r="8" fill="${COLORES.frutilla}"/>
    <circle cx="26" cy="38" r="7" fill="${COLORES.api}"/>
  </svg>`;
}

function dibujoAguayo() {
  const colores = [COLORES.frutilla, COLORES.tumbo, COLORES.hierbabuena, COLORES.api, COLORES.limonada];
  let celdas = '';
  for (let f = 0; f < 4; f++) {
    for (let c = 0; c < 6; c++) {
      if (f === 0 && (c === 1 || c === 4)) continue;
      celdas += `<rect x="${24 + c * 12.5}" y="${12 + f * 15}" width="11" height="13" rx="2" fill="${colores[(f + (f === 3 ? 0 : c)) % 5]}"/>`;
    }
  }
  return `<svg viewBox="0 0 120 80" aria-hidden="true">${celdas}</svg>`;
}

function dibujoSaltenera() {
  const saltena = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 6c0-14 10-22 22-22s22 8 22 22c0 4-4 6-22 6s-22-2-22-6z" fill="#d98a2b"/><path d="M-18-6q4-6 8 0t8 0 8 0 8 0 8 0" stroke="#f2b45a" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  return `<svg viewBox="0 0 120 80" aria-hidden="true">
    <ellipse cx="60" cy="66" rx="48" ry="8" fill="#ffffff22"/>
    ${saltena(40, 52, 0.9)}${saltena(80, 52, 0.9)}${saltena(60, 40, 1)}
  </svg>`;
}

function pintarPuestos() {
  const zona = document.getElementById('puestos');
  zona.innerHTML = PUESTOS.map((p) => {
    const nombre = t(p.id);
    const desc = t(`${p.id}Desc`);
    const accion = p.listo
      ? `<a class="boton" href="${p.url}">${escapar(t('jugar'))}</a>`
      : `<span class="sello-pronto">${escapar(t('pronto'))}</span>`;
    return `<article class="puesto ${p.listo ? '' : 'cerrado'}" style="--acento:${p.color}">
      <div class="puesto-toldo">${toldo({ barra: '#ffffff', alto: 30 })}</div>
      <div class="puesto-dibujo">${p.dibujo()}</div>
      <h3>${escapar(nombre)}</h3>
      <p>${escapar(desc)}</p>
      ${accion}
    </article>`;
  }).join('');
}

function pintarCasera() {
  const e = obtener();
  const hoy = diaLocal();
  const racha = rachaVigente(e, hoy);
  const texto = document.getElementById('regalo-texto');
  const boton = document.getElementById('regalo-boton');
  if (regaloDisponible(e, hoy)) {
    texto.textContent = `${t('regaloHoy', { n: montoRegalo(racha) })} ${t('regaloCrece')}`;
    boton.hidden = false;
  } else {
    texto.textContent = t('regaloListo');
    boton.hidden = true;
  }
  const dias = document.getElementById('racha-dias');
  dias.innerHTML = Array.from({ length: 7 }, (_, i) => `<span class="${i < Math.min(racha, 7) ? 'lleno' : ''}"></span>`).join('');
  document.getElementById('racha-texto').textContent =
    racha === 0 ? t('rachaCero') : racha === 1 ? t('rachaDia') : t('rachaDias', { n: racha });
}

function pintarIdiomas() {
  const sel = document.getElementById('idioma');
  sel.innerHTML = Object.entries(IDIOMAS)
    .map(([codigo, nombre]) => `<option value="${codigo}" ${codigo === idioma() ? 'selected' : ''}>${nombre}</option>`)
    .join('');
  sel.onchange = () => cambiarIdioma(sel.value);
}

function pintarTodo() {
  aplicarTextos();
  pintarCasera();
  pintarPuestos();
}

window.QHATU_LISTO = true;
document.getElementById('logo').innerHTML = logo();
document.getElementById('casera').innerHTML = casera();
document.getElementById('chip-yapa').innerHTML = chipYapa();
contadorYapa();
pintarIdiomas();
pintarTodo();
document.addEventListener('qhatu:idioma', () => {
  pintarCasera();
  pintarPuestos();
});
alCambiar(() => pintarCasera());

document.getElementById('regalo-boton').addEventListener('click', (ev) => {
  const monto = recibirRegalo(obtener(), diaLocal());
  if (!monto) return;
  guardar();
  sonar.yapa();
  flotante(`+${monto}`, ev.currentTarget);
  aviso(t('regaloRecibido', { n: monto }), { tipo: 'exito' });
});

// Instalar como app web.
let pedidoInstalar = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pedidoInstalar = e;
  document.getElementById('instalar').hidden = false;
});
document.getElementById('instalar').addEventListener('click', async () => {
  if (!pedidoInstalar) return;
  pedidoInstalar.prompt();
  await pedidoInstalar.userChoice;
  pedidoInstalar = null;
  document.getElementById('instalar').hidden = true;
});

// En la app Android los archivos ya vienen dentro, no hace falta el service worker.
if (!EN_APP && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

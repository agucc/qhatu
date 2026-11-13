// Portada: el mercado. La Casera entrega la yapa diaria y cada puesto lleva a su juego.

import { obtener, guardar, diaLocal, rachaVigente, regaloDisponible, recibirRegalo, montoRegalo, alCambiar } from './shared/almacen.js';
import { t, aplicarTextos, IDIOMAS, idioma, cambiarIdioma } from './shared/i18n.js';
import { logo, casera, toldo, COLORES } from './shared/marca.js';
import { chipYapa, contadorYapa, flotante, aviso, escapar, ventana } from './shared/ui.js';
import { sonar } from './shared/sonido.js';
import { EN_APP } from './shared/config.js';
import { aplicarDecoracion } from './shared/decoracion.js';
import { exportar, leerCodigo } from './shared/transferir.js';
import { nubeActiva, estadoNube, usarCodigo, cargarPartida } from './shared/nube.js';
import { iniciarPlataforma } from './shared/plataforma.js';
import { progresoPuesto } from './shared/progreso.js';
import { PAISES, pais as datosPais, paisActual, paisesAbiertos, pasajesLibres, proximoPasaje, xpTotal, elegirPaisInicial, viajar, irA, bandera, texto } from './shared/paises.js';
import { frutasDe } from './frutera/frutas.js';
import { svgComida } from './saltenera/comida-portal.js';
import { dibujoTejido } from './shared/tejidos.js';

// Enlaces siempre a un archivo .html: dentro de la app Android, una ruta de carpeta
// ("refresquera/") devuelve la portada en vez del puesto.
const PUESTOS = [
  { id: 'refresquera', url: 'refresquera/index.html', listo: true, color: COLORES.api, dibujo: dibujoRefresquera },
  { id: 'frutera', url: 'frutera/index.html', listo: true, color: COLORES.frutilla, dibujo: dibujoFrutera },
  { id: 'aguayo', url: 'aguayo/index.html', listo: true, color: COLORES.hierbabuena, dibujo: dibujoAguayo },
  { id: 'saltenera', url: 'saltenera/index.html', listo: true, color: COLORES.tumbo, dibujo: dibujoSaltenera },
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

function actual() {
  return datosPais(paisActual(obtener()));
}

function dibujoFrutera() {
  const f = frutasDe(actual().id);
  return `<svg viewBox="0 0 120 80" aria-hidden="true">
    <path d="M14 40h92l-10 36H24z" fill="${COLORES.mocochinchi}"/>
    <path d="M18 48h84M21 58h78M24 68h72" stroke="#00000033" stroke-width="2"/>
    <circle cx="42" cy="34" r="13" fill="${f[4].color}"/>
    <circle cx="70" cy="30" r="17" fill="${f[7].color}"/>
    <circle cx="92" cy="37" r="8" fill="${f[1].color}"/>
    <circle cx="26" cy="38" r="7" fill="${f[2].color}"/>
  </svg>`;
}

function dibujoAguayo() {
  const { textura, paleta } = actual().telar;
  return dibujoTejido(textura, paleta.map(([, c]) => c));
}

function dibujoSaltenera() {
  const comida = actual().comida.dibujo;
  const una = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${svgComida(comida)}</g>`;
  return `<svg viewBox="0 0 120 80" aria-hidden="true">
    <ellipse cx="60" cy="66" rx="48" ry="8" fill="#ffffff22"/>
    ${una(40, 52, 0.9)}${una(80, 52, 0.9)}${una(60, 40, 1)}
  </svg>`;
}

/** Nombre del puesto: el tejido y la comida cambian con el país. */
function nombrePuesto(id) {
  if (id === 'aguayo') return texto(actual().telar.nombre);
  if (id === 'saltenera') return texto(actual().comida.puesto);
  return t(id);
}

function pintarPuestos() {
  const zona = document.getElementById('puestos');
  zona.innerHTML = PUESTOS.map((p) => {
    const nombre = nombrePuesto(p.id);
    const desc = p.id === 'aguayo' ? `${texto(actual().telar.origen)} ${t('aguayoDesc')}` : t(`${p.id}Desc`);
    const accion = p.listo
      ? `<a class="boton" href="${p.url}">${escapar(t('jugar'))}</a>`
      : `<span class="sello-pronto">${escapar(t('pronto'))}</span>`;
    const pr = p.listo ? progresoPuesto(p.id) : null;
    const nivel = pr
      ? `<div class="puesto-nivel"><span>${escapar(t('nivelCorto', { n: pr.nivel }))}</span><div class="barra-xp"><i style="width:${Math.round((pr.resto / pr.falta) * 100)}%"></i></div></div>`
      : '';
    return `<article class="puesto ${p.listo ? '' : 'cerrado'}" style="--acento:${p.color}">
      <div class="puesto-toldo">${toldo({ barra: '#ffffff', alto: 30 })}</div>
      <div class="puesto-dibujo">${p.dibujo()}</div>
      <h3>${escapar(nombre)}</h3>
      ${nivel}
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

// ---------- Países y pasaporte ----------

function pintarPais() {
  const a = actual();
  document.getElementById('pais-chip').innerHTML = `${bandera(a.id, 16)}<span>${escapar(texto(a.corto || a.nombre))}</span>`;
  document.getElementById('pais-chip').setAttribute('aria-label', t('mercadoDe', { pais: texto(a.nombre) }));
}

function pintarPasaporte() {
  const e = obtener();
  const abiertos = paisesAbiertos(e);
  const libres = pasajesLibres(e);
  const meta = proximoPasaje(e);
  const xp = xpTotal(e);
  const estado = document.getElementById('pasaporte-estado');
  if (libres > 0) estado.textContent = libres === 1 ? t('pasajeUno') : t('pasajesTienes', { n: libres });
  else if (meta === null) estado.textContent = t('todosPasajes');
  else estado.textContent = t('sinPasajes', { xp, meta });
  document.getElementById('barra-pasaje').style.width = `${meta === null ? 100 : Math.round((xp / meta) * 100)}%`;
  const aqui = paisActual(e);
  document.getElementById('paises').innerHTML = PAISES.map((p) => {
    const abierto = abiertos.includes(p.id);
    let accion;
    if (p.id === aqui) accion = `<span class="sello">${escapar(t('estasAqui'))}</span>`;
    else if (abierto) accion = `<button class="boton secundario" type="button" data-ir="${p.id}">${escapar(t('ir'))}</button>`;
    else if (libres > 0) accion = `<button class="boton" type="button" data-viajar="${p.id}">${escapar(t('viajar'))}</button>`;
    else accion = `<span class="sello cerrado">${escapar(t('cerrado'))}</span>`;
    const casa = p.id === e.pais ? `<small class="casa">${escapar(t('casa'))}</small>` : '';
    return `<article class="pais${abierto ? ' abierto' : ''}${p.id === aqui ? ' aqui' : ''}">
      ${bandera(p.id, 26)}
      <h3>${escapar(texto(p.nombre))}${casa}</h3>
      ${abierto ? `<p>${escapar(texto(p.dato))}</p>` : ''}
      ${accion}
    </article>`;
  }).join('');
}

document.getElementById('paises').addEventListener('click', async (ev) => {
  const ir = ev.target.closest('[data-ir]');
  const nuevo = ev.target.closest('[data-viajar]');
  const e = obtener();
  if (ir && irA(e, ir.dataset.ir)) {
    guardar();
    sonar.elegir();
    pintarTodo();
    aviso(t('bienvenida', { pais: texto(actual().nombre) }), { tipo: 'exito' });
  } else if (nuevo && viajar(e, nuevo.dataset.viajar)) {
    guardar();
    sonar.servido();
    pintarTodo();
    const p = actual();
    await ventana({
      titulo: t('bienvenida', { pais: texto(p.nombre) }),
      html: `<div class="bandera-grande">${bandera(p.id, 60)}</div>`,
      texto: texto(p.dato),
      conCasera: true,
      botones: [{ texto: t('entendido') }],
    });
  }
});

/** La primera vez: ¿de dónde eres? Ese país será el mercado de casa. */
function elegirPaisSiFalta() {
  if (obtener().pais) return;
  const capa = document.createElement('div');
  capa.className = 'ventana-fondo';
  capa.innerHTML = `<div class="ventana elegir-pais" role="dialog" aria-modal="true" aria-labelledby="t-pais">
    <h2 id="t-pais">${escapar(t('deDondeEres'))}</h2>
    <p>${escapar(t('deDondeTexto'))}</p>
    <div class="paises-elegir">${PAISES.map((p) => `<button type="button" class="pais-opcion" data-pais="${p.id}">${bandera(p.id, 30)}<span>${escapar(texto(p.nombre))}</span></button>`).join('')}</div>
  </div>`;
  document.body.appendChild(capa);
  capa.querySelector('.pais-opcion').focus();
  capa.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-pais]');
    if (!b) return;
    elegirPaisInicial(obtener(), b.dataset.pais);
    guardar();
    sonar.servido();
    capa.remove();
    pintarTodo();
    aviso(t('bienvenida', { pais: texto(actual().nombre) }), { tipo: 'exito' });
  });
}

function pintarTodo() {
  // Al viajar cambian La Casera, el fondo y el toldo del país.
  aplicarDecoracion();
  document.getElementById('casera').innerHTML = casera(paisActual(obtener()));
  aplicarTextos();
  pintarCasera();
  pintarPuestos();
  pintarPais();
  pintarPasaporte();
}

window.QHATU_LISTO = true;
aplicarDecoracion();
iniciarPlataforma();
document.getElementById('logo').innerHTML = logo();
document.getElementById('chip-yapa').innerHTML = chipYapa();
contadorYapa();
pintarIdiomas();
pintarTodo();
document.addEventListener('qhatu:idioma', () => {
  pintarCasera();
  pintarPuestos();
  pintarPais();
  pintarPasaporte();
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

// ---------- Pasar el progreso a otro dispositivo ----------

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
}

async function pedirCodigo({ titulo, placeholder }) {
  const valor = await ventana({
    titulo,
    texto: t('reemplazaProgreso'),
    html: `<textarea class="codigo" id="codigo-entrada" rows="3" autocapitalize="characters" spellcheck="false" placeholder="${escapar(placeholder)}"></textarea>`,
    botones: [
      { texto: t('cargar'), valor: 'cargar' },
      { texto: t('cerrar'), valor: null, clase: 'secundario' },
    ],
  });
  const campo = document.getElementById('codigo-entrada');
  return valor === 'cargar' && campo ? campo.value.trim() : null;
}

/** Carga un código: de la nube (QH-…) o de "Pasar mi progreso" (QHATU1-…). */
async function cargarCodigo(codigo) {
  let resultado = 'malo';
  if (/^QHATU1-/i.test(codigo)) {
    const datos = leerCodigo(codigo);
    if (datos) {
      await cargarPartida(datos);
      resultado = 'ok';
    }
  } else if (nubeActiva) {
    resultado = await usarCodigo(codigo);
  }
  if (resultado === 'ok') {
    aviso(t('progresoCargado'), { tipo: 'exito' });
    setTimeout(() => location.reload(), 900);
  } else {
    aviso(t(resultado === 'sin-red' ? 'sinRed' : 'codigoMalo'), { tipo: 'alerta' });
  }
}

function cuandoSubida(ms) {
  const min = Math.floor((Date.now() - ms) / 60000);
  return min < 1 ? t('recien') : t('hace', { n: min });
}

async function ventanaNube() {
  const nube = estadoNube();
  let html = '';
  if (nube.codigo) {
    html += `<p class="codigo-nube" id="codigo-nube">${escapar(nube.codigo)}</p>`;
    const linea = nube.pendiente ? t('nubePendiente') : nube.subida ? t('nubeGuardada', { cuando: cuandoSubida(nube.subida) }) : '';
    if (linea) html += `<p class="nube-estado">${escapar(linea)}</p>`;
  }
  const botones = [];
  if (nube.codigo) botones.push({ texto: t('copiarCodigoNube'), valor: 'copiar' });
  botones.push({ texto: t('usarCodigo'), valor: 'usar', clase: 'secundario' });
  botones.push({ texto: t('cerrar'), valor: null, clase: 'secundario' });
  const eleccion = await ventana({
    titulo: t('tuPartida'),
    texto: nube.codigo ? t('nubeTexto') : t('nubeSinCuenta'),
    html,
    botones,
  });
  if (eleccion === 'copiar') {
    if (await copiarTexto(nube.codigo)) aviso(t('copiado'), { tipo: 'exito' });
  } else if (eleccion === 'usar') {
    const codigo = await pedirCodigo({ titulo: t('usarCodigo'), placeholder: t('codigoNubeAqui') });
    if (codigo) await cargarCodigo(codigo);
  }
}

async function ventanaPasar() {
  const eleccion = await ventana({
    titulo: t('pasarProgreso'),
    texto: t('pasarTexto'),
    botones: [
      { texto: t('copiarCodigo'), valor: 'copiar' },
      { texto: t('pegarCodigo'), valor: 'pegar', clase: 'secundario' },
      { texto: t('cerrar'), valor: null, clase: 'secundario' },
    ],
  });
  if (eleccion === 'copiar') {
    const codigo = exportar();
    const copiado = await copiarTexto(codigo);
    if (copiado) aviso(t('copiado'), { tipo: 'exito' });
    // También se muestra, por si el portapapeles no está disponible
    await ventana({
      titulo: t('tuCodigo'),
      html: `<textarea class="codigo" readonly rows="5">${escapar(codigo)}</textarea>`,
      botones: [{ texto: t('cerrar') }],
    });
  } else if (eleccion === 'pegar') {
    const codigo = await pedirCodigo({ titulo: t('pegarCodigo'), placeholder: t('codigoAqui') });
    if (codigo) await cargarCodigo(codigo);
  }
}

const botonPasar = document.getElementById('pasar');
if (nubeActiva) {
  botonPasar.dataset.t = 'tuPartida';
  botonPasar.textContent = t('tuPartida');
}
botonPasar.addEventListener('click', () => (nubeActiva ? ventanaNube() : ventanaPasar()));

elegirPaisSiFalta();

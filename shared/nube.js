// Partida en la nube (servidor de Qhatu en Cloudflare, carpeta nube/).
// La primera vez que el juego abre con internet se crea una cuenta anónima, sin pedir nada.
// La partida se sigue guardando en el celular y se sube sola cada tanto y al salir del juego.
// La llave de la cuenta es también el código de recuperación (QH-XXXXX-XXXXX-XXXXX-XXXXX).

import { NUBE_URL } from './compilacion.js';
import { EN_PORTAL } from './config.js';
import { obtener, reemplazar, alCambiar } from './almacen.js';

const META = 'qhatu.nube'; // { llave, version, pendiente, subida }
const SESION = 'qhatu.nube.sesion';
const ESPERA_SUBIDA = 60_000; // como mucho una subida por minuto mientras se juega
const TIEMPO_MAXIMO = 10_000;
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const LARGO_LLAVE = 20;

export const nubeActiva = Boolean(NUBE_URL) && !EN_PORTAL;

// ---------- Funciones puras ----------

/** Acepta el código escrito a mano: con o sin "QH", guiones, espacios o minúsculas. */
export function normalizarLlave(texto) {
  const limpio = String(texto || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^QH/, '');
  if (limpio.length !== LARGO_LLAVE) return null;
  for (const c of limpio) if (!ALFABETO.includes(c)) return null;
  return limpio;
}

export function mostrarLlave(llave) {
  return 'QH-' + llave.match(/.{1,5}/g).join('-');
}

/** Cuánto se avanzó en una partida: experiencia de todos los puestos. */
export function avance(estado) {
  return Object.values(estado?.puestos || {}).reduce((suma, p) => suma + (p?.xp || 0), 0);
}

/** Si el celular y la nube tienen cambios distintos, queda la partida con más progreso. */
export function elegirPartida(local, nube) {
  const a = avance(local);
  const b = avance(nube);
  if (a !== b) return b > a ? 'nube' : 'local';
  const ja = local?.ultimoJuego || '';
  const jb = nube?.ultimoJuego || '';
  if (ja !== jb) return jb > ja ? 'nube' : 'local';
  return (nube?.yapa || 0) > (local?.yapa || 0) ? 'nube' : 'local';
}

// ---------- Estado de la sincronización ----------

function leerMeta() {
  try {
    return JSON.parse(localStorage.getItem(META)) || {};
  } catch {
    return {};
  }
}

let meta = typeof localStorage !== 'undefined' ? leerMeta() : {};
let temporizador = null;
let subiendo = null;
let cambios = 0;
let ignorar = false;
let iniciada = false;

function escribirMeta() {
  try {
    localStorage.setItem(META, JSON.stringify(meta));
  } catch {
    /* sin guardado disponible */
  }
}

async function pedir(metodo, ruta, { llave, cuerpo, keepalive = false } = {}) {
  const cabeceras = {};
  if (llave) cabeceras.Authorization = `Bearer ${llave}`;
  if (cuerpo) cabeceras['Content-Type'] = 'application/json';
  const r = await fetch(NUBE_URL.replace(/\/+$/, '') + ruta, {
    method: metodo,
    headers: cabeceras,
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    keepalive,
    signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(TIEMPO_MAXIMO) : undefined,
  });
  let datos = null;
  try {
    datos = await r.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  return { estado: r.status, datos };
}

function ponerPartida(datos) {
  ignorar = true;
  try {
    reemplazar(datos);
  } finally {
    ignorar = false;
  }
}

async function crearCuenta() {
  const r = await pedir('POST', '/v1/cuenta');
  if (r.estado !== 201 || !r.datos?.llave) return false;
  meta = { llave: r.datos.llave, version: 0, pendiente: true };
  escribirMeta();
  return true;
}

function programar(ms = ESPERA_SUBIDA) {
  if (temporizador) return;
  temporizador = setTimeout(() => {
    temporizador = null;
    subir();
  }, ms);
}

/** Sube la partida. Si otro celular guardó antes, queda la de más progreso. */
export function subir({ keepalive = false } = {}) {
  if (!nubeActiva || !meta.llave) return Promise.resolve(false);
  if (subiendo) return subiendo;
  clearTimeout(temporizador);
  temporizador = null;
  subiendo = (async () => {
    try {
      for (let intento = 0; intento < 3; intento++) {
        const hechos = cambios;
        const r = await pedir('PUT', '/v1/partida', {
          llave: meta.llave,
          cuerpo: { datos: obtener(), base: meta.version || 0 },
          keepalive,
        });
        if (r.estado === 200) {
          meta.version = r.datos.version;
          meta.pendiente = cambios !== hechos;
          meta.subida = Date.now();
          escribirMeta();
          if (meta.pendiente) programar();
          return true;
        }
        if (r.estado === 409 && r.datos) {
          if (elegirPartida(obtener(), r.datos.datos) === 'nube') {
            ponerPartida(r.datos.datos);
            meta.version = r.datos.version;
            meta.pendiente = false;
            meta.subida = Date.now();
            escribirMeta();
            location.reload();
            return true;
          }
          meta.version = r.datos.version; // se vuelve a intentar sobre la versión de la nube
          continue;
        }
        if (r.estado === 401) {
          // La cuenta ya no existe en la nube: se crea otra y se sube lo del celular.
          meta = {};
          escribirMeta();
          if (await crearCuenta()) continue;
        }
        return false;
      }
      return false;
    } catch {
      return false; // sin internet: queda pendiente para la próxima
    } finally {
      subiendo = null;
    }
  })();
  return subiendo;
}

/** Al abrir el juego: crea la cuenta si falta y trae la partida si otro celular la cambió. */
async function sincronizar() {
  if (!meta.llave) {
    if (await crearCuenta()) await subir();
    return;
  }
  let yaEnSesion = false;
  try {
    yaEnSesion = sessionStorage.getItem(SESION) === '1';
  } catch {
    /* sin sessionStorage */
  }
  if (!yaEnSesion) {
    const r = await pedir('GET', '/v1/partida', { llave: meta.llave });
    if (r.estado === 401) {
      meta = {};
      escribirMeta();
      if (await crearCuenta()) await subir();
      return;
    }
    if (r.estado !== 200 || !r.datos) return;
    try {
      sessionStorage.setItem(SESION, '1');
    } catch {
      /* sin sessionStorage */
    }
    const remota = r.datos;
    if (remota.version > (meta.version || 0) && remota.datos) {
      if (!meta.pendiente || elegirPartida(obtener(), remota.datos) === 'nube') {
        const antes = JSON.stringify(obtener());
        ponerPartida(remota.datos);
        meta.version = remota.version;
        meta.pendiente = false;
        meta.subida = Date.now();
        escribirMeta();
        if (JSON.stringify(obtener()) !== antes) location.reload();
        return;
      }
      meta.version = remota.version;
    } else if (remota.version < (meta.version || 0)) {
      meta.version = remota.version;
      meta.pendiente = true;
    }
    escribirMeta();
  }
  if (meta.pendiente) programar(2000);
}

export async function iniciarNube() {
  if (!nubeActiva || iniciada) return;
  iniciada = true;
  alCambiar(() => {
    if (ignorar) return;
    cambios++;
    if (!meta.pendiente) {
      meta.pendiente = true;
      escribirMeta();
    }
    programar();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && meta.pendiente) subir({ keepalive: true });
  });
  try {
    await sincronizar();
  } catch {
    /* sin internet: se intenta en la próxima apertura o al guardar */
  }
}

/** La llave de la cuenta en la nube (para las compras verificadas). Crea la cuenta si hace falta. */
export async function llaveNube() {
  if (!nubeActiva) return null;
  if (!meta.llave) {
    try {
      await crearCuenta();
    } catch {
      return null;
    }
  }
  return meta.llave || null;
}

// ---------- Para la ventana "Tu partida en la nube" ----------

export function estadoNube() {
  return {
    activa: nubeActiva,
    codigo: meta.llave ? mostrarLlave(meta.llave) : null,
    pendiente: Boolean(meta.pendiente),
    subida: meta.subida || null,
  };
}

/**
 * Usa un código de recuperación en este celular: trae esa partida y reemplaza la de aquí.
 * Devuelve 'ok', 'malo' (el código no existe) o 'sin-red'.
 */
export async function usarCodigo(texto) {
  const llave = normalizarLlave(texto);
  if (!llave) return 'malo';
  try {
    const r = await pedir('GET', '/v1/partida', { llave });
    if (r.estado === 401) return 'malo';
    if (r.estado !== 200 || !r.datos) return 'sin-red';
    meta = { llave, version: r.datos.version, pendiente: !r.datos.datos, subida: Date.now() };
    if (r.datos.datos) ponerPartida(r.datos.datos);
    escribirMeta();
    return 'ok';
  } catch {
    return 'sin-red';
  }
}

/** Reemplaza la partida de este celular (código QHATU1 de "Pasar mi progreso") y la sube. */
export async function cargarPartida(datos) {
  reemplazar(datos);
  if (nubeActiva) await subir();
}

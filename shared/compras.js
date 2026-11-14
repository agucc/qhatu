// Compras con dinero real: packs de yapa y el pase sin anuncios.
// Precios claros, sin ofertas que presionan ni premios al azar.
//  - Versión de Google Play (CANAL 'play'): Google Play Billing, verificada en el servidor.
//  - APK directa (CANAL 'directo'): pago con cripto directo a la billetera del dueño (20 % más barato),
//    verificado en la blockchain por el servidor. La tarjeta se suma cuando haya cuenta de pagos.
//  - Versión de prueba: además se puede simular la compra sin cobrar.

import { obtener, guardar, sumarYapa } from './almacen.js';
import { EN_APP } from './config.js';
import { complementoNativo } from './nativo.js';
import { VERSION_DE_PRUEBA, CANAL, NUBE_URL } from './compilacion.js';
import { llaveNube } from './nube.js';
import { aplicarImpulso, darArticulo } from './catalogo.js';
import { activarPase, miTemporada, temporadaActual } from './temporada.js';

const miTemporadaProducto = () => temporadaActual()?.producto;

/** Los identificadores deben existir igual en Google Play Console (productos integrados en la app). */
export const PRODUCTOS = [
  { id: 'yapa_150', tipo: 'yapa', yapa: 150, usd: 0.99 },
  { id: 'yapa_500', tipo: 'yapa', yapa: 500, usd: 2.99 },
  { id: 'yapa_1000', tipo: 'yapa', yapa: 1000, usd: 4.99 },
  { id: 'yapa_3000', tipo: 'yapa', yapa: 3000, usd: 9.99 },
  { id: 'pase_temporada_t1', tipo: 'temporada', usd: 2.99, unaVez: true },
  { id: 'pasaporte_viajero', tipo: 'pasaporte', pasajes: 2, usd: 1.99 },
  { id: 'doble_xp_7d', tipo: 'xp2', horas: 7 * 24, usd: 0.99 },
  { id: 'sin_anuncios', tipo: 'sin_anuncios', usd: 2.99, unaVez: true },
];

const demo = typeof location !== 'undefined' && new URLSearchParams(location.search).get('compras') === 'demo';

let modo = null; // 'play' | 'directo' | 'prueba' | 'no'
let cripto = null; // { red, nombreRed, direccion, tokens, descuento, precios } si el servidor la tiene activa
const preciosPlay = {};

function billing() {
  return complementoNativo('NativePurchases');
}

async function servidor(metodo, ruta, cuerpo) {
  const llave = await llaveNube();
  const r = await fetch(`${NUBE_URL.replace(/\/+$/, '')}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(llave ? { Authorization: `Bearer ${llave}` } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let datos = null;
  try {
    datos = await r.json();
  } catch {
    /* sin cuerpo */
  }
  return { estado: r.status, datos: datos || {} };
}

/** Averigua cómo se puede comprar aquí. */
export async function iniciarCompras() {
  if (modo) return modo;
  if (CANAL === 'play' || EN_APP) {
    const plugin = EN_APP ? billing() : null;
    if (plugin && CANAL === 'play') {
      try {
        const { isBillingSupported } = await plugin.isBillingSupported();
        if (isBillingSupported) {
          const { products } = await plugin.getProducts({ productIdentifiers: PRODUCTOS.map((p) => p.id), productType: 'inapp' });
          for (const p of products || []) preciosPlay[p.identifier] = p.priceString;
          if (Object.keys(preciosPlay).length) {
            modo = 'play';
            await restaurar(plugin);
            return modo;
          }
        }
      } catch {
        /* Play no responde: se decide abajo */
      }
    }
  }
  if (CANAL === 'directo' && NUBE_URL) {
    try {
      const r = await fetch(`${NUBE_URL.replace(/\/+$/, '')}/v1/compras`);
      cripto = (await r.json()).cripto || null;
    } catch {
      cripto = null;
    }
  }
  if (cripto) modo = 'directo';
  else modo = (EN_APP && VERSION_DE_PRUEBA) || demo ? 'prueba' : 'no';
  return modo;
}

/** El pase sin anuncios es para siempre: si ya se compró en Play, se recupera. */
async function restaurar(plugin) {
  try {
    const { purchases } = await plugin.getPurchases({ productType: 'inapp' });
    const pagadas = (purchases || []).filter((c) => String(c.purchaseState ?? '1') === '1').map((c) => c.productIdentifier);
    if (pagadas.includes('sin_anuncios')) obtener().sinAnuncios = true;
    if (pagadas.some((id) => id.startsWith('pase_temporada_') && id === miTemporadaProducto())) activarPase(obtener());
    guardar();
  } catch {
    /* sin conexión: se intenta otro día */
  }
}

/** 'play' (Google Play), 'directo' (cripto), 'prueba' (simulada, no cobra) o 'no'. */
export function modoCompras() {
  return modo || 'no';
}

/** En la APK directa de prueba también se puede simular la compra. */
export function sePuedeSimular() {
  return (EN_APP && VERSION_DE_PRUEBA) || demo;
}

export function datosCripto() {
  return cripto;
}

export function precio(producto) {
  return preciosPlay[producto.id] || `${producto.usd.toFixed(2)} USD`;
}

export function precioCripto(producto) {
  const p = cripto?.precios?.[producto.id];
  return p ? p.toFixed(2) : null;
}

export function sinAnuncios() {
  return Boolean(obtener().sinAnuncios);
}

/** ¿Ya lo tiene? (el pase sin anuncios y el pase de temporada se compran una vez). */
export function yaComprado(producto) {
  if (producto.tipo === 'sin_anuncios') return sinAnuncios();
  if (producto.tipo === 'temporada') return Boolean(miTemporada()?.premium);
  return false;
}

/** Entrega lo comprado. */
export function entregar(producto) {
  const e = obtener();
  if (producto.tipo === 'yapa') {
    sumarYapa(producto.yapa);
    return;
  }
  if (producto.tipo === 'sin_anuncios') e.sinAnuncios = true;
  else if (producto.tipo === 'temporada') activarPase(e);
  else if (producto.tipo === 'xp2') aplicarImpulso('xp2', e, { horas: producto.horas });
  else if (producto.tipo === 'pasaporte') {
    for (let i = 0; i < producto.pasajes; i++) aplicarImpulso('pasaje', e);
    darArticulo('portada:dorada', e);
  }
  guardar();
}

/** Compra con Google Play (o simulada en la versión de prueba). Devuelve true si se entregó. */
export async function comprar(id, { simular = false } = {}) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto) return false;
  if (yaComprado(producto)) return false;
  const m = await iniciarCompras();
  if (simular || m === 'prueba') {
    if (!sePuedeSimular()) return false;
    entregar(producto);
    return true;
  }
  if (m !== 'play') return false;
  let transaccion;
  try {
    transaccion = await billing().purchaseProduct({
      productIdentifier: id,
      productType: 'inapp',
      quantity: 1,
      // La yapa se puede volver a comprar; el pase sin anuncios queda para siempre.
      isConsumable: producto.tipo === 'yapa',
    });
    if (!transaccion || String(transaccion.purchaseState ?? '1') !== '1') return false;
  } catch {
    return false;
  }
  // El servidor confirma con Google que la compra es real. Si el servidor no está configurado
  // o no hay conexión, se confía en lo que dijo Google Play en el celular.
  const token = transaccion.purchaseToken || transaccion.transactionId;
  if (token) {
    try {
      const r = await servidor('POST', '/v1/compras/google', { producto: id, token });
      if (r.estado === 402 || r.estado === 409) return false;
    } catch {
      /* sin conexión: se entrega igual */
    }
  }
  entregar(producto);
  return true;
}

/**
 * Pago con cripto: el jugador envió el monto a la billetera y pega el hash de la transacción.
 * Devuelve { ok } o { error }: 'pendiente' y 'no-encontrada' (esperar y reintentar), 'monto',
 * 'destino', 'fallida', 'usada', 'hash' o 'sin-red'.
 */
export async function comprarConCripto(id, hash) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto || !cripto) return { error: 'sin-red' };
  try {
    const r = await servidor('POST', '/v1/compras/cripto', { producto: id, hash: String(hash || '').trim() });
    if (r.estado === 200 && r.datos.ok) {
      entregar(producto);
      return { ok: true };
    }
    return { error: r.datos.error || 'sin-red' };
  } catch {
    return { error: 'sin-red' };
  }
}

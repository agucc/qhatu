// Compras con dinero real: packs de yapa y el pase sin anuncios.
// Precios claros, sin ofertas que presionan ni premios al azar.
// En la app publicada en Google Play la compra pasa por Google Play Billing.
// En la APK de prueba se simula sin cobrar y la tienda lo dice en pantalla.

import { obtener, guardar, sumarYapa } from './almacen.js';
import { EN_APP } from './config.js';
import { complementoNativo } from './nativo.js';
import { VERSION_DE_PRUEBA } from './compilacion.js';

/** Los identificadores deben existir igual en Google Play Console (productos integrados en la app). */
export const PRODUCTOS = [
  { id: 'yapa_150', tipo: 'yapa', yapa: 150, usd: 0.99 },
  { id: 'yapa_500', tipo: 'yapa', yapa: 500, usd: 2.99 },
  { id: 'yapa_1000', tipo: 'yapa', yapa: 1000, usd: 4.99 },
  { id: 'sin_anuncios', tipo: 'sin_anuncios', usd: 2.99 },
];

const demo = typeof location !== 'undefined' && new URLSearchParams(location.search).get('compras') === 'demo';

let modo = null; // 'play' | 'prueba' | 'no'
const preciosPlay = {};

function billing() {
  return complementoNativo('NativePurchases');
}

/**
 * Averigua cómo se puede comprar aquí. En la app intenta Google Play: si los productos existen
 * en Play Console, se usa la compra real; si no, la APK de prueba simula.
 */
export async function iniciarCompras() {
  if (modo) return modo;
  const plugin = EN_APP ? billing() : null;
  if (plugin) {
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
  modo = (EN_APP && VERSION_DE_PRUEBA) || demo ? 'prueba' : 'no';
  return modo;
}

/** El pase sin anuncios es para siempre: si ya se compró en Play, se recupera. */
async function restaurar(plugin) {
  try {
    const { purchases } = await plugin.getPurchases({ productType: 'inapp' });
    if ((purchases || []).some((c) => c.productIdentifier === 'sin_anuncios' && String(c.purchaseState ?? '1') === '1')) {
      obtener().sinAnuncios = true;
      guardar();
    }
  } catch {
    /* sin conexión: se intenta otro día */
  }
}

/** 'play' (Google Play), 'prueba' (simulada, no cobra) o 'no' (no se puede comprar aquí). */
export function modoCompras() {
  return modo || 'no';
}

export function precio(producto) {
  return preciosPlay[producto.id] || `${producto.usd.toFixed(2)} USD`;
}

export function sinAnuncios() {
  return Boolean(obtener().sinAnuncios);
}

/** Entrega lo comprado. */
export function entregar(producto) {
  if (producto.tipo === 'yapa') sumarYapa(producto.yapa);
  else if (producto.tipo === 'sin_anuncios') {
    obtener().sinAnuncios = true;
    guardar();
  }
}

/** Devuelve true si la compra se completó. */
export async function comprar(id) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto) return false;
  if (producto.tipo === 'sin_anuncios' && sinAnuncios()) return false;
  const m = await iniciarCompras();
  if (m === 'no') return false;
  if (m === 'play') {
    try {
      const transaccion = await billing().purchaseProduct({
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
  }
  entregar(producto);
  return true;
}

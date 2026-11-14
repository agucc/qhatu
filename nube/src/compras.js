// Compras verificadas en el servidor.
//  - Google Play: se pregunta a la API de Google Play si el token de compra es real (cuenta de servicio).
//  - Cripto: pago directo a la billetera del dueño; se verifica la transacción en la blockchain
//    (transferencia del token correcto, a la dirección correcta, por el monto correcto) y que no se use dos veces.
// Todo se activa con variables y secretos de Cloudflare; sin ellos responde 501 y el juego sigue como antes.

export const PAQUETE_ANDROID = 'bo.qhatu.mercado';

/** Lo mismo que shared/compras.js: identificador y precio en dólares. */
export const PRODUCTOS = {
  yapa_150: 0.99,
  yapa_500: 2.99,
  yapa_1000: 4.99,
  yapa_3000: 9.99,
  pase_temporada_t1: 2.99,
  pasaporte_viajero: 1.99,
  doble_xp_7d: 0.99,
  sin_anuncios: 2.99,
};

export const DESCUENTO_CRIPTO = 0.2; // pagar con cripto es 20 % más barato
export const CONFIRMACIONES = 5;

/** Redes y monedas estables aceptadas. DAI no tiene función para congelar direcciones. */
export const REDES = {
  polygon: {
    nombre: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    tokens: [
      { simbolo: 'USDT', contrato: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', decimales: 6 },
      { simbolo: 'USDC', contrato: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359', decimales: 6 },
      { simbolo: 'DAI', contrato: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', decimales: 18 },
    ],
  },
  base: {
    nombre: 'Base',
    rpc: 'https://mainnet.base.org',
    tokens: [
      { simbolo: 'USDC', contrato: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', decimales: 6 },
      { simbolo: 'DAI', contrato: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', decimales: 18 },
    ],
  },
};

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/** Precio con descuento, en centavos de dólar. */
export function centavosCripto(producto) {
  const usd = PRODUCTOS[producto];
  return usd ? Math.round(usd * (1 - DESCUENTO_CRIPTO) * 100) : null;
}

/** Monto mínimo en unidades del token (por ejemplo 790000 para 0.79 USDC con 6 decimales). */
export function montoMinimo(centavos, decimales) {
  return BigInt(centavos) * 10n ** BigInt(decimales - 2);
}

function configCripto(env) {
  const red = REDES[env.CRIPTO_RED];
  const direccion = String(env.CRIPTO_DIRECCION || '').toLowerCase();
  if (!red || !/^0x[0-9a-f]{40}$/.test(direccion)) return null;
  return { id: env.CRIPTO_RED, ...red, rpc: env.CRIPTO_RPC || red.rpc, direccion };
}

/** Lo que la tienda necesita saber para mostrar los métodos de pago. */
export function configCompras(env) {
  const c = configCripto(env);
  return {
    cripto: c
      ? {
          red: c.id,
          nombreRed: c.nombre,
          direccion: c.direccion,
          tokens: c.tokens.map((x) => x.simbolo),
          descuento: DESCUENTO_CRIPTO,
          precios: Object.fromEntries(Object.keys(PRODUCTOS).map((p) => [p, centavosCripto(p) / 100])),
        }
      : null,
    google: Boolean(env.GOOGLE_PLAY_CUENTA),
  };
}

async function rpc(url, metodo, params, pedir = fetch) {
  const r = await pedir(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: metodo, params }) });
  if (!r.ok) throw new Error('rpc');
  const j = await r.json();
  if (j.error) throw new Error('rpc');
  return j.result;
}

/**
 * Revisa una transacción en la blockchain. Devuelve { ok, token, monto } o { error }:
 * 'no-encontrada', 'fallida', 'pendiente', 'destino' (no fue a la billetera), 'monto' (faltó plata).
 */
export async function revisarTransaccion(c, hash, producto, pedir = fetch) {
  const recibo = await rpc(c.rpc, 'eth_getTransactionReceipt', [hash], pedir);
  if (!recibo) return { error: 'no-encontrada' };
  if (recibo.status !== '0x1') return { error: 'fallida' };
  const ultimo = BigInt(await rpc(c.rpc, 'eth_blockNumber', [], pedir));
  if (ultimo - BigInt(recibo.blockNumber) + 1n < BigInt(CONFIRMACIONES)) return { error: 'pendiente' };
  const destino = `0x${c.direccion.slice(2).padStart(64, '0')}`;
  const centavos = centavosCripto(producto);
  let alDestino = false;
  for (const log of recibo.logs || []) {
    const token = c.tokens.find((x) => x.contrato === String(log.address).toLowerCase());
    if (!token || log.topics?.[0] !== TRANSFER || String(log.topics?.[2]).toLowerCase() !== destino) continue;
    alDestino = true;
    const monto = BigInt(log.data);
    if (monto >= montoMinimo(centavos, token.decimales)) return { ok: true, token: token.simbolo, monto: monto.toString() };
  }
  return { error: alDestino ? 'monto' : 'destino' };
}

export async function comprarConCripto(env, jugador, cuerpo, ahora, pedir = fetch) {
  const c = configCripto(env);
  if (!c) return { estado: 501, cuerpo: { error: 'cripto-apagado' } };
  const producto = String(cuerpo?.producto || '');
  const hash = String(cuerpo?.hash || '').trim().toLowerCase();
  if (!PRODUCTOS[producto]) return { estado: 400, cuerpo: { error: 'producto' } };
  if (!/^0x[0-9a-f]{64}$/.test(hash)) return { estado: 400, cuerpo: { error: 'hash' } };
  const usada = await env.DB.prepare('SELECT jugador FROM compras WHERE id = ?').bind(`cripto:${c.id}:${hash}`).first();
  if (usada) return { estado: 409, cuerpo: { error: 'usada' } };
  let r;
  try {
    r = await revisarTransaccion(c, hash, producto, pedir);
  } catch {
    return { estado: 502, cuerpo: { error: 'red-blockchain' } };
  }
  if (r.error) return { estado: r.error === 'pendiente' || r.error === 'no-encontrada' ? 202 : 402, cuerpo: { error: r.error } };
  const ins = await env.DB.prepare('INSERT OR IGNORE INTO compras (id, jugador, producto, metodo, detalle, creada) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(`cripto:${c.id}:${hash}`, jugador, producto, 'cripto', `${r.token} ${r.monto}`, ahora)
    .run();
  if (ins.meta.changes !== 1) return { estado: 409, cuerpo: { error: 'usada' } };
  return { estado: 200, cuerpo: { ok: true, producto } };
}

// ---------- Google Play ----------

function deBase64(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const base64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const texto64 = (s) => base64url(new TextEncoder().encode(s));

/** Token de acceso de la cuenta de servicio de Google (JWT firmado con su llave privada). */
async function tokenGoogle(cuenta, ahora, pedir) {
  const pem = cuenta.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const llave = await crypto.subtle.importKey('pkcs8', deBase64(pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const s = Math.floor(ahora / 1000);
  const cabecera = texto64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const datos = texto64(JSON.stringify({ iss: cuenta.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher', aud: 'https://oauth2.googleapis.com/token', iat: s, exp: s + 3600 }));
  const firma = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', llave, new TextEncoder().encode(`${cabecera}.${datos}`)));
  const r = await pedir('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${cabecera}.${datos}.${base64url(firma)}`,
  });
  if (!r.ok) throw new Error('google-token');
  return (await r.json()).access_token;
}

export async function comprarConGoogle(env, jugador, cuerpo, ahora, pedir = fetch) {
  if (!env.GOOGLE_PLAY_CUENTA) return { estado: 501, cuerpo: { error: 'google-apagado' } };
  const producto = String(cuerpo?.producto || '');
  const token = String(cuerpo?.token || '');
  if (!PRODUCTOS[producto]) return { estado: 400, cuerpo: { error: 'producto' } };
  if (!/^[A-Za-z0-9._-]{20,400}$/.test(token)) return { estado: 400, cuerpo: { error: 'token' } };
  const id = `google:${token}`;
  const usada = await env.DB.prepare('SELECT jugador FROM compras WHERE id = ?').bind(id).first();
  if (usada) return usada.jugador === jugador ? { estado: 200, cuerpo: { ok: true, producto, repetida: true } } : { estado: 409, cuerpo: { error: 'usada' } };
  let compra;
  try {
    const acceso = await tokenGoogle(JSON.parse(env.GOOGLE_PLAY_CUENTA), ahora, pedir);
    const r = await pedir(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PAQUETE_ANDROID}/purchases/products/${producto}/tokens/${token}`, {
      headers: { Authorization: `Bearer ${acceso}` },
    });
    if (r.status === 404 || r.status === 400) return { estado: 402, cuerpo: { error: 'no-valida' } };
    if (!r.ok) throw new Error('google');
    compra = await r.json();
  } catch {
    return { estado: 502, cuerpo: { error: 'red-google' } };
  }
  if (compra.purchaseState !== 0) return { estado: 402, cuerpo: { error: 'no-pagada' } };
  await env.DB.prepare('INSERT OR IGNORE INTO compras (id, jugador, producto, metodo, detalle, creada) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, jugador, producto, 'google', compra.orderId || '', ahora)
    .run();
  return { estado: 200, cuerpo: { ok: true, producto } };
}

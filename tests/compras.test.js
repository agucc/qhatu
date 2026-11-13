// Pruebas de las compras verificadas en el servidor: cripto (blockchain simulada) y Google Play (API simulada).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { crearServidor } from '../nube/src/servidor.js';
import { centavosCripto, montoMinimo, REDES, CONFIRMACIONES } from '../nube/src/compras.js';

function d1() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../nube/esquema.sql', import.meta.url), 'utf8'));
  const preparar = (sql) => ({
    bind: (...args) => ({
      first: async () => db.prepare(sql).get(...args) ?? null,
      run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...args).changes) } }),
      _ejecutar: () => db.prepare(sql).run(...args),
    }),
  });
  return {
    prepare: preparar,
    batch: async (stmts) => {
      for (const s of stmts) s._ejecutar();
    },
  };
}

const DUENO = '0x1111111111111111111111111111111111111111';
const USDT = REDES.polygon.tokens.find((t) => t.simbolo === 'USDT');
const DAI = REDES.polygon.tokens.find((t) => t.simbolo === 'DAI');
const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const pad = (dir) => `0x${dir.slice(2).toLowerCase().padStart(64, '0')}`;
const hex = (n) => `0x${BigInt(n).toString(16)}`;

/** Blockchain simulada: transacciones por hash y un bloque actual. */
function cadena(txs, bloqueActual = 1000) {
  return async (url, opciones) => {
    const { method, params } = JSON.parse(opciones.body);
    if (method === 'eth_blockNumber') return Response.json({ result: hex(bloqueActual) });
    if (method === 'eth_getTransactionReceipt') return Response.json({ result: txs[params[0]] || null });
    return Response.json({ error: 'metodo' });
  };
}

function recibo({ token = USDT, a = DUENO, monto, bloque = 900, estado = '0x1' }) {
  return { status: estado, blockNumber: hex(bloque), logs: [{ address: token.contrato, topics: [TRANSFER, pad('0x2222222222222222222222222222222222222222'), pad(a)], data: hex(monto) }] };
}

async function montar({ env = {}, pedir }) {
  const entorno = { DB: d1(), CRIPTO_RED: 'polygon', CRIPTO_DIRECCION: DUENO, ...env };
  const manejar = crearServidor({ pedir });
  const llamar = async (metodo, ruta, { llave, cuerpo } = {}) => {
    const headers = llave ? { Authorization: `Bearer ${llave}` } : {};
    const r = await manejar(new Request(`https://nube.test${ruta}`, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined }), entorno);
    return { estado: r.status, datos: await r.json() };
  };
  const { llave } = (await llamar('POST', '/v1/cuenta')).datos;
  return { llamar, llave };
}

const H = (n) => `0x${String(n).repeat(64).slice(0, 64)}`;

test('precios con cripto: 20 % menos, en unidades de cada token', () => {
  assert.equal(centavosCripto('yapa_150'), 79);
  assert.equal(centavosCripto('yapa_1000'), 399);
  assert.equal(montoMinimo(79, 6), 790000n);
  assert.equal(montoMinimo(79, 18), 790000000000000000n);
});

test('la tienda recibe la configuración solo si hay red y billetera', async () => {
  const { llamar } = await montar({ pedir: cadena({}) });
  const r = await llamar('GET', '/v1/compras');
  assert.equal(r.datos.cripto.red, 'polygon');
  assert.equal(r.datos.cripto.direccion, DUENO);
  assert.deepEqual(r.datos.cripto.tokens, ['USDT', 'USDC', 'DAI']);
  assert.equal(r.datos.cripto.precios.yapa_150, 0.79);
  const apagado = await montar({ env: { CRIPTO_DIRECCION: '' }, pedir: cadena({}) });
  assert.equal((await apagado.llamar('GET', '/v1/compras')).datos.cripto, null);
  assert.equal((await apagado.llamar('POST', '/v1/compras/cripto', { llave: apagado.llave, cuerpo: { producto: 'yapa_150', hash: H(1) } })).estado, 501);
});

test('pago con cripto correcto: se acepta una sola vez', async () => {
  const txs = { [H(1)]: recibo({ monto: 790000 }) };
  const { llamar, llave } = await montar({ pedir: cadena(txs) });
  const r = await llamar('POST', '/v1/compras/cripto', { llave, cuerpo: { producto: 'yapa_150', hash: H(1).toUpperCase().replace('0X', '0x') } });
  assert.equal(r.estado, 200);
  assert.deepEqual(r.datos, { ok: true, producto: 'yapa_150' });
  const otra = await llamar('POST', '/v1/compras/cripto', { llave, cuerpo: { producto: 'yapa_150', hash: H(1) } });
  assert.equal(otra.estado, 409);
  assert.equal(otra.datos.error, 'usada');
});

test('pago con DAI (18 decimales) también vale', async () => {
  const txs = { [H(2)]: recibo({ token: DAI, monto: 2390000000000000000n }) };
  const { llamar, llave } = await montar({ pedir: cadena(txs) });
  assert.equal((await llamar('POST', '/v1/compras/cripto', { llave, cuerpo: { producto: 'yapa_500', hash: H(2) } })).estado, 200);
});

test('rechaza pagos incompletos, a otra billetera, fallidos o todavía sin confirmar', async () => {
  const txs = {
    [H(3)]: recibo({ monto: 780000 }), // le falta un centavo
    [H(4)]: recibo({ monto: 790000, a: '0x3333333333333333333333333333333333333333' }),
    [H(5)]: recibo({ monto: 790000, estado: '0x0' }),
    [H(6)]: recibo({ monto: 790000, bloque: 1000 - CONFIRMACIONES + 2 }),
    [H(7)]: recibo({ monto: 790000, token: { contrato: '0x9999999999999999999999999999999999999999' } }),
  };
  const { llamar, llave } = await montar({ pedir: cadena(txs) });
  const intento = async (n) => (await llamar('POST', '/v1/compras/cripto', { llave, cuerpo: { producto: 'yapa_150', hash: H(n) } })).datos.error;
  assert.equal(await intento(3), 'monto');
  assert.equal(await intento(4), 'destino');
  assert.equal(await intento(5), 'fallida');
  assert.equal(await intento(6), 'pendiente');
  assert.equal(await intento(7), 'destino', 'otro token no cuenta');
  assert.equal(await intento(8), 'no-encontrada');
  assert.equal((await llamar('POST', '/v1/compras/cripto', { llave, cuerpo: { producto: 'yapa_150', hash: 'abc' } })).datos.error, 'hash');
  assert.equal((await llamar('POST', '/v1/compras/cripto', { cuerpo: { producto: 'yapa_150', hash: H(3) } })).estado, 401);
});

test('Google Play: verifica el token con la API de Google y no deja usarlo en otra cuenta', async () => {
  const par = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const pkcs8 = Buffer.from(await crypto.subtle.exportKey('pkcs8', par.privateKey)).toString('base64');
  const cuenta = JSON.stringify({ client_email: 'qhatu@proyecto.iam.gserviceaccount.com', private_key: `-----BEGIN PRIVATE KEY-----\n${pkcs8}\n-----END PRIVATE KEY-----\n` });
  const TOKEN_OK = 'token-de-compra-valido-1234567890';
  const pedir = async (url, opciones = {}) => {
    if (url.startsWith('https://oauth2.googleapis.com/token')) {
      assert.match(String(opciones.body), /assertion=[\w-]+\.[\w-]+\.[\w-]+/);
      return Response.json({ access_token: 'acceso' });
    }
    if (url.includes('/purchases/products/yapa_500/tokens/')) {
      assert.equal(opciones.headers.Authorization, 'Bearer acceso');
      return url.endsWith(TOKEN_OK) ? Response.json({ purchaseState: 0, orderId: 'GPA.1' }) : new Response('{}', { status: 404 });
    }
    return new Response('?', { status: 500 });
  };
  const a = await montar({ env: { GOOGLE_PLAY_CUENTA: cuenta }, pedir });
  assert.equal((await a.llamar('POST', '/v1/compras/google', { llave: a.llave, cuerpo: { producto: 'yapa_500', token: TOKEN_OK } })).estado, 200);
  assert.equal((await a.llamar('POST', '/v1/compras/google', { llave: a.llave, cuerpo: { producto: 'yapa_500', token: 'token-falso-0000000000000' } })).datos.error, 'no-valida');
  const otra = (await a.llamar('POST', '/v1/cuenta')).datos.llave;
  assert.equal((await a.llamar('POST', '/v1/compras/google', { llave: otra, cuerpo: { producto: 'yapa_500', token: TOKEN_OK } })).datos.error, 'usada');
  const sin = await montar({ pedir });
  assert.equal((await sin.llamar('POST', '/v1/compras/google', { llave: sin.llave, cuerpo: { producto: 'yapa_500', token: TOKEN_OK } })).estado, 501);
});

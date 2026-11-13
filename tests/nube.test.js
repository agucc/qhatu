// Pruebas del servidor de la nube (nube/src/servidor.js) con una base D1 simulada en SQLite,
// y de las reglas del juego para decidir qué partida queda.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { crearServidor, normalizarLlave, mostrarLlave, nuevaLlave, verificarGoogle, MAX_PARTIDA } from '../nube/src/servidor.js';
import { elegirPartida, normalizarLlave as normalizarEnJuego, avance } from '../shared/nube.js';

// ---------- D1 simulada ----------

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
      db.exec('BEGIN');
      try {
        for (const s of stmts) s._ejecutar();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

// ---------- Google simulado ----------

const AUD = 'cliente-web.apps.googleusercontent.com';
const parGoogle = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
const jwkPublica = { ...(await crypto.subtle.exportKey('jwk', parGoogle.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };

const b64url = (bytes) => Buffer.from(bytes).toString('base64url');
async function tokenGoogle(datos, { kid = 'k1', llave = parGoogle.privateKey } = {}) {
  const h = b64url(JSON.stringify({ alg: 'RS256', kid, typ: 'JWT' }));
  const ahora = Math.floor(Date.now() / 1000);
  const p = b64url(JSON.stringify({ iss: 'https://accounts.google.com', aud: AUD, iat: ahora, exp: ahora + 3600, ...datos }));
  const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', llave, new TextEncoder().encode(`${h}.${p}`));
  return `${h}.${p}.${b64url(new Uint8Array(firma))}`;
}

// ---------- Ayudas ----------

function montar({ google = '' } = {}) {
  const env = { DB: d1(), GOOGLE_CLIENT_ID: google };
  const manejar = crearServidor({ clavesGoogle: async () => [jwkPublica] });
  const pedir = async (metodo, ruta, { llave, cuerpo } = {}) => {
    const headers = {};
    if (llave) headers.Authorization = `Bearer ${llave}`;
    const r = await manejar(
      new Request(`https://nube.test${ruta}`, { method: metodo, headers, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) }),
      env,
    );
    return { estado: r.status, datos: r.status === 204 ? null : await r.json(), r };
  };
  return { env, pedir };
}

// ---------- Llaves ----------

test('las llaves usan un alfabeto sin letras confusas y se leen escritas a mano', () => {
  const llave = nuevaLlave();
  assert.equal(llave.length, 20);
  assert.match(llave, /^[2-9A-HJ-NP-Z]{20}$/);
  const mostrada = mostrarLlave(llave);
  assert.match(mostrada, /^QH-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/);
  assert.equal(normalizarLlave(mostrada.toLowerCase().replaceAll('-', ' ')), llave);
  assert.equal(normalizarEnJuego(mostrada), llave);
  assert.equal(normalizarLlave('QH-0000-1111'), null);
  assert.equal(normalizarLlave('QH-OOOOO-IIIII-OOOOO-IIIII'), null); // O e I no existen en el alfabeto
});

// ---------- Cuentas y partidas ----------

test('crea una cuenta anónima y guarda la partida con versiones', async () => {
  const { pedir } = montar();
  const cuenta = await pedir('POST', '/v1/cuenta');
  assert.equal(cuenta.estado, 201);
  const { llave } = cuenta.datos;

  let r = await pedir('GET', '/v1/partida', { llave });
  assert.deepEqual(r.datos, { datos: null, version: 0, actualizada: null });

  r = await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 50 }, base: 0 } });
  assert.equal(r.estado, 200);
  assert.equal(r.datos.version, 1);

  r = await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 70 }, base: 1 } });
  assert.equal(r.datos.version, 2);

  r = await pedir('GET', '/v1/partida', { llave: mostrarLlave(llave) });
  assert.equal(r.datos.version, 2);
  assert.deepEqual(r.datos.datos, { yapa: 70 });
});

test('si otro celular guardó antes, responde 409 con lo que hay en la nube', async () => {
  const { pedir } = montar();
  const { llave } = (await pedir('POST', '/v1/cuenta')).datos;
  await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 1 }, base: 0 } });
  await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 2 }, base: 1 } });

  const viejo = await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 99 }, base: 1 } });
  assert.equal(viejo.estado, 409);
  assert.equal(viejo.datos.version, 2);
  assert.deepEqual(viejo.datos.datos, { yapa: 2 });

  const otraVezCero = await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 99 }, base: 0 } });
  assert.equal(otraVezCero.estado, 409);
});

test('cada cuenta solo ve su propia partida', async () => {
  const { pedir } = montar();
  const a = (await pedir('POST', '/v1/cuenta')).datos.llave;
  const b = (await pedir('POST', '/v1/cuenta')).datos.llave;
  await pedir('PUT', '/v1/partida', { llave: a, cuerpo: { datos: { yapa: 10 }, base: 0 } });
  const r = await pedir('GET', '/v1/partida', { llave: b });
  assert.equal(r.datos.datos, null);
});

test('rechaza llaves falsas, datos raros y partidas demasiado grandes', async () => {
  const { pedir } = montar();
  const { llave } = (await pedir('POST', '/v1/cuenta')).datos;

  assert.equal((await pedir('GET', '/v1/partida')).estado, 401);
  assert.equal((await pedir('GET', '/v1/partida', { llave: 'QH-22222-22222-22222-22222' })).estado, 401);

  assert.equal((await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: [1, 2], base: 0 } })).estado, 400);
  assert.equal((await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: {}, base: -3 } })).estado, 400);
  assert.equal((await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: {} } })).estado, 400);

  const grande = { relleno: 'x'.repeat(MAX_PARTIDA) };
  assert.equal((await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: grande, base: 0 } })).estado, 413);

  assert.equal((await pedir('GET', '/v1/nada')).estado, 404);
});

test('no guarda la llave, solo su huella', async () => {
  const { env, pedir } = montar();
  const { llave } = (await pedir('POST', '/v1/cuenta')).datos;
  const fila = await env.DB.prepare('SELECT hash FROM llaves').bind().first();
  assert.notEqual(fila.hash, llave);
  assert.match(fila.hash, /^[0-9a-f]{64}$/);
});

test('responde a CORS para que la app pueda llamar desde https://localhost', async () => {
  const { pedir } = montar();
  const r = await pedir('OPTIONS', '/v1/partida');
  assert.equal(r.estado, 204);
  assert.equal(r.r.headers.get('Access-Control-Allow-Origin'), '*');
  assert.match(r.r.headers.get('Access-Control-Allow-Headers'), /Authorization/);
});

test('el tope por IP corta la creación masiva de cuentas', async () => {
  const { env, pedir } = montar();
  let usados = 0;
  env.LIMITE = { limit: async () => ({ success: ++usados <= 2 }) };
  assert.equal((await pedir('POST', '/v1/cuenta')).estado, 201);
  assert.equal((await pedir('POST', '/v1/cuenta')).estado, 201);
  assert.equal((await pedir('POST', '/v1/cuenta')).estado, 429);
});

// ---------- Google ----------

test('verifica la firma, la audiencia y el vencimiento del token de Google', async () => {
  const claves = [jwkPublica];
  assert.equal(await verificarGoogle(await tokenGoogle({ sub: '123' }), [AUD], claves), '123');
  assert.equal(await verificarGoogle(await tokenGoogle({ sub: '123', aud: 'otra-app' }), [AUD], claves), null);
  assert.equal(await verificarGoogle(await tokenGoogle({ sub: '123', iss: 'https://malo.example' }), [AUD], claves), null);
  assert.equal(await verificarGoogle(await tokenGoogle({ sub: '123', exp: 1000 }), [AUD], claves), null);
  assert.equal(await verificarGoogle(await tokenGoogle({ sub: '123' }, { kid: 'otra' }), [AUD], claves), null);

  const intruso = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify'],
  );
  assert.equal(await verificarGoogle(await tokenGoogle({ sub: '123' }, { llave: intruso.privateKey }), [AUD], claves), null);
  assert.equal(await verificarGoogle('basura', [AUD], claves), null);
});

test('vincular con Google y entrar desde otro celular con la misma cuenta', async () => {
  const { pedir } = montar({ google: AUD });
  const { llave } = (await pedir('POST', '/v1/cuenta')).datos;
  await pedir('PUT', '/v1/partida', { llave, cuerpo: { datos: { yapa: 321 }, base: 0 } });

  const idToken = await tokenGoogle({ sub: 'google-42' });
  assert.equal((await pedir('POST', '/v1/google/vincular', { llave, cuerpo: { idToken } })).estado, 200);

  // Celular nuevo: entra con Google y recibe una llave nueva de la misma cuenta.
  const entrar = await pedir('POST', '/v1/google/entrar', { cuerpo: { idToken } });
  assert.equal(entrar.estado, 200);
  assert.notEqual(entrar.datos.llave, llave);
  const r = await pedir('GET', '/v1/partida', { llave: entrar.datos.llave });
  assert.deepEqual(r.datos.datos, { yapa: 321 });

  // La llave vieja sigue sirviendo en el primer celular.
  assert.equal((await pedir('GET', '/v1/partida', { llave })).estado, 200);

  // La misma cuenta de Google no se puede vincular a otra partida.
  const otra = (await pedir('POST', '/v1/cuenta')).datos.llave;
  assert.equal((await pedir('POST', '/v1/google/vincular', { llave: otra, cuerpo: { idToken } })).estado, 409);

  // Una cuenta de Google sin partida vinculada no entra.
  const nadie = await tokenGoogle({ sub: 'google-99' });
  assert.equal((await pedir('POST', '/v1/google/entrar', { cuerpo: { idToken: nadie } })).estado, 404);
  assert.equal((await pedir('POST', '/v1/google/entrar', { cuerpo: { idToken: 'x.y.z' } })).estado, 401);
});

test('sin ID de cliente de Google, el inicio con Google está apagado', async () => {
  const { pedir } = montar();
  const idToken = await tokenGoogle({ sub: 'google-42' });
  assert.equal((await pedir('POST', '/v1/google/entrar', { cuerpo: { idToken } })).estado, 501);
});

// ---------- Qué partida queda en el juego ----------

test('queda la partida con más experiencia; si empatan, la jugada más recientemente', () => {
  const poca = { yapa: 900, puestos: { refresquera: { xp: 3 } }, ultimoJuego: '2026-11-13' };
  const mucha = { yapa: 10, puestos: { refresquera: { xp: 5 }, frutera: { xp: 4 } }, ultimoJuego: '2026-11-01' };
  assert.equal(avance(mucha), 9);
  assert.equal(elegirPartida(poca, mucha), 'nube');
  assert.equal(elegirPartida(mucha, poca), 'local');

  const ayer = { yapa: 5, puestos: { frutera: { xp: 2 } }, ultimoJuego: '2026-11-12' };
  const hoy = { yapa: 1, puestos: { frutera: { xp: 2 } }, ultimoJuego: '2026-11-13' };
  assert.equal(elegirPartida(ayer, hoy), 'nube');
  assert.equal(elegirPartida(hoy, ayer), 'local');

  // Celular nuevo (partida vacía) frente a la nube con progreso: queda la nube.
  assert.equal(elegirPartida({ yapa: 30, puestos: {} }, mucha), 'nube');
});

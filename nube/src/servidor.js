// Lógica del servidor de Qhatu en Cloudflare Workers (index.js es la entrada).
// Cada jugador tiene una cuenta anónima que se crea sola; la "llave" es su código de recuperación.
// Guarda la partida completa (el mismo JSON que el juego guarda en el celular) y, si el jugador
// quiere, vincula la cuenta con Google para recuperarla en otro celular.
//
// Rutas:
//   POST /v1/cuenta              → { llave }                       crea una cuenta nueva
//   GET  /v1/partida             → { datos, version, actualizada } (Authorization: Bearer <llave>)
//   PUT  /v1/partida             ← { datos, base }                 base = versión que el celular tenía
//                                → 200 { version } | 409 { datos, version, actualizada }
//   POST /v1/google/vincular     ← { idToken }                     (con llave) une la cuenta a Google
//   POST /v1/google/entrar       ← { idToken }                     → { llave } nueva para esa cuenta
//   POST /v1/salas               ← { puesto }                      → { codigo } crea una sala en vivo
//   GET  /v1/salas/CODIGO        → estado público de la sala
//   GET  /v1/salas/CODIGO/ws     (WebSocket) entra a la sala: ?jugador=&nombre=&pais=
//   GET  /v1/salud               → { ok: true }

import { nuevoCodigo, normalizarCodigo, SEGUNDOS as SEGUNDOS_SALA } from './sala-logica.js';

export const MAX_PARTIDA = 100_000; // bytes del JSON de la partida
const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin 0, 1, I ni O para no confundirse al copiar
const LARGO_LLAVE = 20; // 20 × 5 bits = 100 bits

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

function respuesta(cuerpo, estado = 200) {
  return new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS },
  });
}

const error = (estado, motivo) => respuesta({ error: motivo }, estado);

// ---------- Llaves ----------

export function nuevaLlave() {
  const bytes = crypto.getRandomValues(new Uint8Array(LARGO_LLAVE));
  let llave = '';
  for (const b of bytes) llave += ALFABETO[b & 31];
  return llave;
}

/** Acepta la llave escrita a mano: con o sin "QH", guiones, espacios o minúsculas. */
export function normalizarLlave(texto) {
  const limpio = String(texto || '').toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/^QH/, '');
  if (limpio.length !== LARGO_LLAVE) return null;
  for (const c of limpio) if (!ALFABETO.includes(c)) return null;
  return limpio;
}

/** Cómo se muestra al jugador: QH-XXXXX-XXXXX-XXXXX-XXXXX */
export function mostrarLlave(llave) {
  return 'QH-' + llave.match(/.{1,5}/g).join('-');
}

async function sha256(texto) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function jugadorDe(req, env) {
  const auth = req.headers.get('Authorization') || '';
  const llave = normalizarLlave(auth.replace(/^Bearer\s+/i, ''));
  if (!llave) return null;
  const fila = await env.DB.prepare('SELECT jugador FROM llaves WHERE hash = ?').bind(await sha256(llave)).first();
  return fila ? fila.jugador : null;
}

async function crearLlave(env, jugador, ahora) {
  const llave = nuevaLlave();
  const stmt = env.DB.prepare('INSERT INTO llaves (hash, jugador, creada) VALUES (?, ?, ?)').bind(await sha256(llave), jugador, ahora);
  return { llave, stmt };
}

// ---------- Google ----------

const CERTS_GOOGLE = 'https://www.googleapis.com/oauth2/v3/certs';
const EMISORES_GOOGLE = ['accounts.google.com', 'https://accounts.google.com'];
let cacheCerts = { claves: null, vence: 0 };

async function clavesGoogleReales() {
  if (cacheCerts.claves && Date.now() < cacheCerts.vence) return cacheCerts.claves;
  const r = await fetch(CERTS_GOOGLE);
  if (!r.ok) throw new Error('certs');
  const { keys } = await r.json();
  const edad = Number((r.headers.get('Cache-Control') || '').match(/max-age=(\d+)/)?.[1] || 3600);
  cacheCerts = { claves: keys, vence: Date.now() + edad * 1000 };
  return keys;
}

function deBase64Url(texto) {
  const b64 = texto.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(texto.length / 4) * 4, '=');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Verifica un ID token de Google (firma RS256, emisor, audiencia y vencimiento). Devuelve el "sub" o null. */
export async function verificarGoogle(idToken, audiencias, claves, ahora = Date.now()) {
  try {
    const partes = String(idToken || '').split('.');
    if (partes.length !== 3) return null;
    const [h, p, f] = partes;
    const cabecera = JSON.parse(new TextDecoder().decode(deBase64Url(h)));
    if (cabecera.alg !== 'RS256') return null;
    const jwk = claves.find((k) => k.kid === cabecera.kid);
    if (!jwk) return null;
    const llave = await crypto.subtle.importKey(
      'jwk',
      { kty: 'RSA', n: jwk.n, e: jwk.e },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valida = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', llave, deBase64Url(f), new TextEncoder().encode(`${h}.${p}`));
    if (!valida) return null;
    const datos = JSON.parse(new TextDecoder().decode(deBase64Url(p)));
    if (!EMISORES_GOOGLE.includes(datos.iss)) return null;
    if (!audiencias.includes(datos.aud)) return null;
    const s = Math.floor(ahora / 1000);
    if (!(datos.exp > s - 60) || (datos.iat && datos.iat > s + 300)) return null;
    return typeof datos.sub === 'string' && datos.sub ? datos.sub : null;
  } catch {
    return null;
  }
}

// ---------- Rutas ----------

async function leerJson(req) {
  const texto = await req.text();
  if (texto.length > MAX_PARTIDA + 1000) return { demasiado: true };
  try {
    return { cuerpo: JSON.parse(texto) };
  } catch {
    return { cuerpo: null };
  }
}

async function limitar(env, req, tipo) {
  if (!env.LIMITE) return true;
  const ip = req.headers.get('CF-Connecting-IP') || 'sin-ip';
  const { success } = await env.LIMITE.limit({ key: `${tipo}:${ip}` });
  return success;
}

async function crearCuenta(env, ahora) {
  const id = crypto.randomUUID();
  const { llave, stmt } = await crearLlave(env, id, ahora);
  await env.DB.batch([env.DB.prepare('INSERT INTO jugadores (id, creado) VALUES (?, ?)').bind(id, ahora), stmt]);
  return respuesta({ llave }, 201);
}

async function leerPartida(env, jugador) {
  const fila = await env.DB.prepare('SELECT datos, version, actualizada FROM partidas WHERE jugador = ?').bind(jugador).first();
  if (!fila) return { datos: null, version: 0, actualizada: null };
  return { datos: JSON.parse(fila.datos), version: fila.version, actualizada: fila.actualizada };
}

async function guardarPartida(env, jugador, cuerpo, ahora) {
  if (!cuerpo || typeof cuerpo.datos !== 'object' || cuerpo.datos === null || Array.isArray(cuerpo.datos)) {
    return error(400, 'datos');
  }
  const base = Number.isInteger(cuerpo.base) && cuerpo.base >= 0 ? cuerpo.base : -1;
  if (base < 0) return error(400, 'base');
  const json = JSON.stringify(cuerpo.datos);
  if (json.length > MAX_PARTIDA) return error(413, 'grande');

  let r;
  if (base === 0) {
    r = await env.DB.prepare('INSERT OR IGNORE INTO partidas (jugador, datos, version, actualizada) VALUES (?, ?, 1, ?)')
      .bind(jugador, json, ahora)
      .run();
  } else {
    r = await env.DB.prepare('UPDATE partidas SET datos = ?, version = version + 1, actualizada = ? WHERE jugador = ? AND version = ?')
      .bind(json, ahora, jugador, base)
      .run();
  }
  if (r.meta.changes === 1) return respuesta({ version: base + 1, actualizada: ahora });
  // Otro celular guardó antes: se devuelve lo que hay en la nube para que el juego decida.
  return respuesta(await leerPartida(env, jugador), 409);
}

function audiencias(env) {
  return String(env.GOOGLE_CLIENT_ID || '').split(',').map((s) => s.trim()).filter(Boolean);
}

async function subDeGoogle(env, cuerpo, clavesGoogle) {
  const aud = audiencias(env);
  if (!aud.length) return { falla: error(501, 'google-apagado') };
  const sub = await verificarGoogle(cuerpo?.idToken, aud, await clavesGoogle());
  if (!sub) return { falla: error(401, 'google-token') };
  return { sub };
}

async function vincularGoogle(env, jugador, cuerpo, clavesGoogle) {
  const { sub, falla } = await subDeGoogle(env, cuerpo, clavesGoogle);
  if (falla) return falla;
  const dueno = await env.DB.prepare('SELECT id FROM jugadores WHERE google = ?').bind(sub).first();
  if (dueno && dueno.id !== jugador) return error(409, 'google-otra-cuenta');
  await env.DB.prepare('UPDATE jugadores SET google = ? WHERE id = ?').bind(sub, jugador).run();
  return respuesta({ ok: true });
}

async function entrarConGoogle(env, cuerpo, clavesGoogle, ahora) {
  const { sub, falla } = await subDeGoogle(env, cuerpo, clavesGoogle);
  if (falla) return falla;
  const dueno = await env.DB.prepare('SELECT id FROM jugadores WHERE google = ?').bind(sub).first();
  if (!dueno) return error(404, 'google-sin-cuenta');
  const { llave, stmt } = await crearLlave(env, dueno.id, ahora);
  await stmt.run();
  return respuesta({ llave });
}

// ---------- Salas en vivo ----------

async function crearSala(env, cuerpo) {
  const puesto = String(cuerpo?.puesto || '');
  if (!SEGUNDOS_SALA[puesto]) return error(400, 'puesto');
  for (let intento = 0; intento < 6; intento++) {
    const codigo = nuevoCodigo();
    const sala = env.SALAS.get(env.SALAS.idFromName(codigo));
    const r = await sala.fetch('https://sala/crear', { method: 'POST', body: JSON.stringify({ codigo, puesto }) });
    if (r.status === 200) return respuesta({ codigo }, 201);
    if (r.status !== 409) return error(500, 'sala');
  }
  return error(503, 'sin-codigo');
}

function irASala(req, env, codigo) {
  return env.SALAS.get(env.SALAS.idFromName(codigo)).fetch(req);
}

export function crearServidor({ clavesGoogle = clavesGoogleReales, reloj = () => Date.now() } = {}) {
  return async function manejar(req, env) {
    const url = new URL(req.url);
    const ruta = `${req.method} ${url.pathname.replace(/\/+$/, '')}`;
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    if (ruta === 'GET /v1/salud') return respuesta({ ok: true });

    try {
      const ahora = reloj();

      if (ruta === 'POST /v1/cuenta') {
        if (!(await limitar(env, req, 'cuenta'))) return error(429, 'espera');
        return await crearCuenta(env, ahora);
      }

      if (ruta === 'POST /v1/salas') {
        if (!env.SALAS) return error(501, 'salas-apagadas');
        if (!(await limitar(env, req, 'sala'))) return error(429, 'espera');
        const { cuerpo } = await leerJson(req);
        return await crearSala(env, cuerpo);
      }

      const enSala = url.pathname.match(/^\/v1\/salas\/([0-9A-Za-z]{4})(\/ws)?\/?$/);
      if (enSala && req.method === 'GET') {
        if (!env.SALAS) return error(501, 'salas-apagadas');
        const codigo = normalizarCodigo(enSala[1]);
        if (!codigo) return error(404, 'no-existe');
        const r = await irASala(req, env, codigo);
        if (r.status === 101) return r;
        return new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...CORS } });
      }

      if (ruta === 'POST /v1/google/entrar') {
        if (!(await limitar(env, req, 'google'))) return error(429, 'espera');
        const { cuerpo, demasiado } = await leerJson(req);
        if (demasiado) return error(413, 'grande');
        return await entrarConGoogle(env, cuerpo, clavesGoogle, ahora);
      }

      if (ruta === 'GET /v1/partida' || ruta === 'PUT /v1/partida' || ruta === 'POST /v1/google/vincular') {
        const jugador = await jugadorDe(req, env);
        if (!jugador) {
          if (!(await limitar(env, req, 'llave'))) return error(429, 'espera');
          return error(401, 'llave');
        }
        if (ruta === 'GET /v1/partida') return respuesta(await leerPartida(env, jugador));
        const { cuerpo, demasiado } = await leerJson(req);
        if (demasiado) return error(413, 'grande');
        if (ruta === 'PUT /v1/partida') return await guardarPartida(env, jugador, cuerpo, ahora);
        return await vincularGoogle(env, jugador, cuerpo, clavesGoogle);
      }

      return error(404, 'ruta');
    } catch (e) {
      console.error(e);
      return error(500, 'servidor');
    }
  };
}


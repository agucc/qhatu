// Reglas de una sala en vivo (sin Cloudflare, para poder probarlas):
// hasta 4 jugadores, el anfitrión elige cuándo empezar, todos juegan el mismo contrarreloj
// con la misma semilla y gana quien hace más.

export const MAX_JUGADORES = 4;
export const SEGUNDOS = { refresquera: 90, frutera: 90, aguayo: 90, saltenera: 30 };
export const CUENTA_MS = 4000; // cuenta regresiva antes de empezar
export const GRACIA_MS = 6000; // espera para los puntajes que llegan tarde
export const VIDA_MS = 3 * 60 * 60 * 1000; // una sala dura 3 horas
export const MAX_PUNTOS = 1_000_000;

const ALFABETO = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function nuevoCodigo(rnd = Math.random) {
  let c = '';
  for (let i = 0; i < 4; i++) c += ALFABETO[Math.floor(rnd() * ALFABETO.length)];
  return c;
}

export function normalizarCodigo(texto) {
  const c = String(texto || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (c.length !== 4) return null;
  for (const x of c) if (!ALFABETO.includes(x)) return null;
  return c;
}

export function limpiarNombre(texto) {
  const n = String(texto || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  return n || 'Caserito';
}

export function nuevaSala(codigo, puesto, ahora) {
  if (!SEGUNDOS[puesto]) return null;
  return {
    codigo,
    puesto,
    segundos: SEGUNDOS[puesto],
    estado: 'esperando', // esperando → jugando → terminada → (otra ronda) esperando
    anfitrion: null,
    jugadores: {},
    orden: [],
    creador: null,
    creada: ahora,
    ronda: 0,
    semilla: null,
    inicio: null,
  };
}

const conectados = (sala) => sala.orden.filter((id) => sala.jugadores[id]?.conectado);

export function vencida(sala, ahora) {
  return ahora - sala.creada > VIDA_MS;
}

/** Entra (o vuelve) un jugador. Devuelve null si todo bien, o el motivo del rechazo. */
export function limpiarAvatar(c) {
  const a = String(c || '').toLowerCase();
  return /^[0-9a-z.]{1,60}$/.test(a) ? a : '';
}

export function unirse(sala, id, nombre, pais, ahora, avatar = '') {
  if (vencida(sala, ahora)) return 'vencida';
  const ya = sala.jugadores[id];
  if (!ya) {
    if (sala.estado !== 'esperando') return 'empezada';
    if (conectados(sala).length >= MAX_JUGADORES) return 'llena';
    sala.jugadores[id] = { nombre: limpiarNombre(nombre), pais: String(pais || 'bo').slice(0, 2), avatar: limpiarAvatar(avatar), puntos: 0, fin: false, conectado: true };
    sala.orden.push(id);
  } else {
    ya.conectado = true;
    if (nombre) ya.nombre = limpiarNombre(nombre);
    if (avatar) ya.avatar = limpiarAvatar(avatar);
  }
  sala.creador ??= id;
  // El que creó la sala vuelve a ser anfitrión cuando regresa; si no, el primero conectado.
  if (id === sala.creador || !sala.anfitrion || !sala.jugadores[sala.anfitrion]?.conectado) sala.anfitrion = id;
  return null;
}

export function salir(sala, id) {
  const j = sala.jugadores[id];
  if (!j) return;
  if (sala.estado === 'esperando') {
    delete sala.jugadores[id];
    sala.orden = sala.orden.filter((x) => x !== id);
  } else {
    j.conectado = false;
  }
  if (sala.anfitrion === id) sala.anfitrion = conectados(sala)[0] || null;
}

/** El anfitrión empieza la ronda: misma semilla para todos y cuenta regresiva. */
export function empezar(sala, id, ahora, semilla) {
  if (sala.anfitrion !== id) return 'no-anfitrion';
  if (sala.estado !== 'esperando') return 'empezada';
  if (conectados(sala).length < 2) return 'faltan';
  for (const x of sala.orden) Object.assign(sala.jugadores[x], { puntos: 0, fin: false });
  sala.estado = 'jugando';
  sala.semilla = semilla >>> 0 || 1;
  sala.inicio = ahora + CUENTA_MS;
  sala.ronda++;
  return null;
}

export function finDeRonda(sala) {
  return sala.inicio + sala.segundos * 1000;
}

/** Anota el puntaje de un jugador durante la ronda (solo puede subir). */
export function anotar(sala, id, n, ahora) {
  const j = sala.jugadores[id];
  if (!j || sala.estado !== 'jugando' || ahora < sala.inicio - 1000 || ahora > finDeRonda(sala) + GRACIA_MS) return false;
  const p = Math.max(0, Math.min(MAX_PUNTOS, Math.floor(Number(n) || 0)));
  if (p > j.puntos) j.puntos = p;
  return true;
}

/** ¿Ya terminaron todos los que siguen conectados? */
export function todosTerminaron(sala) {
  const c = conectados(sala);
  return sala.estado === 'jugando' && c.length > 0 && c.every((x) => sala.jugadores[x].fin);
}

/** Un jugador terminó. Devuelve true si ya terminaron todos los conectados. */
export function terminarJugador(sala, id, n, ahora) {
  const j = sala.jugadores[id];
  if (!j || sala.estado !== 'jugando') return false;
  anotar(sala, id, n, ahora);
  j.fin = true;
  return todosTerminaron(sala);
}

export function ranking(sala) {
  return sala.orden
    .map((id) => ({ id, nombre: sala.jugadores[id].nombre, pais: sala.jugadores[id].pais, avatar: sala.jugadores[id].avatar || '', puntos: sala.jugadores[id].puntos }))
    .sort((a, b) => b.puntos - a.puntos);
}

export function cerrarRonda(sala) {
  if (sala.estado !== 'jugando') return false;
  sala.estado = 'terminada';
  return true;
}

/** El anfitrión vuelve a la sala de espera para otra ronda; se van los desconectados. */
export function otraRonda(sala, id) {
  if (sala.anfitrion !== id || sala.estado !== 'terminada') return 'no-anfitrion';
  sala.orden = sala.orden.filter((x) => sala.jugadores[x]?.conectado);
  for (const x of Object.keys(sala.jugadores)) if (!sala.orden.includes(x)) delete sala.jugadores[x];
  sala.estado = 'esperando';
  sala.semilla = null;
  sala.inicio = null;
  return null;
}

/** Lo que ven los jugadores. */
export function publico(sala, ahora) {
  return {
    codigo: sala.codigo,
    puesto: sala.puesto,
    segundos: sala.segundos,
    estado: sala.estado,
    anfitrion: sala.anfitrion,
    ronda: sala.ronda,
    semilla: sala.semilla,
    inicio: sala.inicio,
    ahora,
    jugadores: sala.orden.map((id) => ({ id, ...sala.jugadores[id] })),
    ranking: sala.estado === 'terminada' ? ranking(sala) : null,
  };
}

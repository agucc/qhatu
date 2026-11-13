// Guardado en el dispositivo: yapa, racha, regalo diario y progreso de cada puesto.
// Una sola yapa para todo el mercado. Si el navegador no deja guardar, el juego sigue igual.

const CLAVE = 'qhatu.v1';
export const YAPA_INICIAL = 30;

export function estadoInicial() {
  return {
    yapa: YAPA_INICIAL,
    racha: 0,
    ultimoJuego: null, // 'AAAA-MM-DD' del último día en que se jugó
    ultimoRegalo: null, // 'AAAA-MM-DD' del último regalo recibido
    idioma: null,
    sonido: true,
    vistos: {},
    puestos: {},
    decoracion: { fondo: 'noche', toldo: 'mercado', vaso: 'redondo', mios: [] },
    sinAnuncios: false,
    anunciosYapa: { dia: null, n: 0 }, // anuncios con yapa vistos hoy
  };
}

// ---------- Fechas y racha (puras) ----------

export function diaLocal(fecha = new Date()) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function diasEntre(a, b) {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
}

/** La racha que sigue viva hoy: si el último juego fue hoy o ayer, cuenta; si no, se cortó. */
export function rachaVigente(estado, hoy) {
  if (!estado.ultimoJuego) return 0;
  const d = diasEntre(estado.ultimoJuego, hoy);
  return d === 0 || d === 1 ? estado.racha : 0;
}

/** Marca que hoy se jugó. Devuelve true si la racha subió. */
export function registrarJuego(estado, hoy) {
  if (estado.ultimoJuego === hoy) return false;
  const seguido = estado.ultimoJuego && diasEntre(estado.ultimoJuego, hoy) === 1;
  estado.racha = seguido ? estado.racha + 1 : 1;
  estado.ultimoJuego = hoy;
  return true;
}

/** El regalo crece con cada día seguido, hasta un tope. */
export function montoRegalo(racha) {
  return 10 + 5 * Math.min(Math.max(racha, 0), 6);
}

export function regaloDisponible(estado, hoy) {
  return estado.ultimoRegalo !== hoy;
}

export function recibirRegalo(estado, hoy) {
  if (!regaloDisponible(estado, hoy)) return 0;
  const monto = montoRegalo(rachaVigente(estado, hoy));
  estado.yapa += monto;
  estado.ultimoRegalo = hoy;
  return monto;
}

// ---------- Lectura y escritura ----------

let estado = null;
const oyentes = new Set();

function leer() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return { ...estadoInicial(), ...JSON.parse(crudo) };
  } catch {
    /* sin guardado disponible */
  }
  return estadoInicial();
}

export function obtener() {
  if (!estado) estado = leer();
  return estado;
}

export function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(obtener()));
  } catch {
    /* sin guardado disponible */
  }
  for (const fn of oyentes) fn(estado);
}

export function alCambiar(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

// Si el jugador tiene dos pestañas abiertas, la yapa se mantiene igual en ambas.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== CLAVE) return;
    estado = leer();
    for (const fn of oyentes) fn(estado);
  });
}

export function yapa() {
  return obtener().yapa;
}

export function sumarYapa(n) {
  obtener().yapa += n;
  guardar();
}

export function gastarYapa(n) {
  const e = obtener();
  if (e.yapa < n) return false;
  e.yapa -= n;
  guardar();
  return true;
}

export function marcarJuego() {
  const subio = registrarJuego(obtener(), diaLocal());
  if (subio) guardar();
  return subio;
}

export function puesto(id) {
  const e = obtener();
  if (!e.puestos[id]) e.puestos[id] = {};
  return e.puestos[id];
}

export function visto(clave) {
  return Boolean(obtener().vistos[clave]);
}

export function marcarVisto(clave) {
  obtener().vistos[clave] = true;
  guardar();
}

// ---------- Yapa por ver anuncios (con tope diario) ----------

export const ANUNCIOS_YAPA_POR_DIA = 5;
export const YAPA_POR_ANUNCIO = 15;

export function anunciosYapaRestantes(estado, hoy) {
  const a = estado.anunciosYapa;
  return a && a.dia === hoy ? Math.max(0, ANUNCIOS_YAPA_POR_DIA - a.n) : ANUNCIOS_YAPA_POR_DIA;
}

/** Anota un anuncio visto y da la yapa. Devuelve la yapa entregada (0 si ya no quedan hoy). */
export function cobrarAnuncioYapa(estado, hoy) {
  if (anunciosYapaRestantes(estado, hoy) <= 0) return 0;
  if (!estado.anunciosYapa || estado.anunciosYapa.dia !== hoy) estado.anunciosYapa = { dia: hoy, n: 0 };
  estado.anunciosYapa.n++;
  estado.yapa += YAPA_POR_ANUNCIO;
  return YAPA_POR_ANUNCIO;
}

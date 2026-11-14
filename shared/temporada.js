// Temporadas y desafíos. Cada temporada tiene 20 niveles: se suben con puntos que da la experiencia
// ganada en los puestos y los desafíos de la semana. Hay premios gratis para todos y premios del pase
// premium (vestimentas exclusivas y más yapa). Los desafíos premium solo los ve quien tiene el pase.

import { obtener, guardar, sumarYapa } from './almacen.js';
import { darArticulo } from './catalogo.js';
import { texto } from './paises.js';

export const TEMPORADAS = [
  {
    id: 't1',
    nombre: ['Fiestas de fin de año', 'Year-end festivals', 'Festas de fim de ano'],
    desde: '2026-11-01',
    hasta: '2027-01-31',
    producto: 'pase_temporada_t1',
  },
];

export const NIVELES = 20;
export const PUNTOS_NIVEL = 40;

/** Premios por nivel: gratis (para todos) y premium (con el pase). */
export const PREMIOS = Array.from({ length: NIVELES }, (_, i) => {
  const n = i + 1;
  const gratis = { 2: { articulo: 'accesorio:aretes' }, 5: { articulo: 'marco:madera' }, 8: { articulo: 'portada:andina' }, 12: { articulo: 'accesorio:flor' } }[n] || { yapa: 15 + n * 3 };
  const premium = { 1: { articulo: 'sombrero:fiesta' }, 5: { articulo: 'prenda:dorado' }, 10: { articulo: 'marco:oro' }, 15: { articulo: 'portada:dorada' }, 20: { articulo: 'accesorio:estrellas' } }[n] || { yapa: 30 + n * 4 };
  return { nivel: n, gratis, premium };
});

const dia = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export function temporadaActual(fecha = new Date()) {
  return TEMPORADAS.find((t) => fecha >= dia(t.desde) && fecha < new Date(dia(t.hasta).getTime() + 86400000)) || null;
}

export function nombreTemporada(t) {
  return texto(t.nombre);
}

/** El avance del jugador en la temporada actual (se reinicia al cambiar de temporada). */
export function miTemporada(estado = obtener(), fecha = new Date()) {
  const t = temporadaActual(fecha);
  if (!t) return null;
  if (!estado.temporada || estado.temporada.id !== t.id) estado.temporada = { id: t.id, puntos: 0, premium: false, reclamados: [] };
  return estado.temporada;
}

export function nivelTemporada(puntos) {
  return Math.min(NIVELES, Math.floor(puntos / PUNTOS_NIVEL));
}

/** Suma puntos de temporada (no guarda: lo hace quien llama). */
export function sumarPuntosTemporada(n, estado = obtener(), fecha = new Date()) {
  const m = miTemporada(estado, fecha);
  if (!m || n <= 0) return 0;
  m.puntos += n;
  return n;
}

export function activarPase(estado = obtener(), fecha = new Date()) {
  const m = miTemporada(estado, fecha);
  if (!m) return false;
  m.premium = true;
  return true;
}

/** Reclama el premio de un nivel. `pista`: 'gratis' o 'premium'. Devuelve el premio o null. */
export function reclamar(nivel, pista, estado = obtener(), fecha = new Date()) {
  const m = miTemporada(estado, fecha);
  if (!m || nivel < 1 || nivel > nivelTemporada(m.puntos)) return null;
  if (pista === 'premium' && !m.premium) return null;
  const clave = `${pista === 'premium' ? 'p' : 'g'}${nivel}`;
  if (m.reclamados.includes(clave)) return null;
  const premio = PREMIOS[nivel - 1][pista];
  m.reclamados.push(clave);
  if (premio.yapa) sumarYapa(premio.yapa);
  else {
    darArticulo(premio.articulo, estado);
    guardar();
  }
  return premio;
}

// ---------- Desafíos de la semana ----------

/** tipo: lo que se cuenta; meta: cuánto; puntos: puntos de temporada al cobrarlo. */
export const DESAFIOS = [
  { id: 'tandas', tipo: 'tandas', meta: 6, puntos: 40, texto: ['Completa {n} niveles o tandas en La Refresquera', 'Finish {n} levels or batches in La Refresquera', 'Complete {n} níveis ou rodadas em La Refresquera'] },
  { id: 'frutas', tipo: 'frutas', meta: 40, puntos: 40, texto: ['Junta {n} frutas en La Frutera', 'Merge {n} fruits in La Frutera', 'Junte {n} frutas em La Frutera'] },
  { id: 'franjas', tipo: 'franjas', meta: 15, puntos: 40, texto: ['Teje {n} franjas en el telar', 'Weave {n} stripes on the loom', 'Teça {n} faixas no tear'] },
  { id: 'cocina', tipo: 'cocina', meta: 300, puntos: 40, texto: ['Cocina {n} veces en el puesto de comida', 'Cook {n} times at the food stall', 'Cozinhe {n} vezes na barraca de comida'] },
  { id: 'contrarreloj', tipo: 'contrarreloj', meta: 3, puntos: 50, texto: ['Juega {n} contrarrelojes', 'Play {n} time attacks', 'Jogue {n} contra o relógio'] },
  { id: 'sala', tipo: 'sala', meta: 2, puntos: 60, texto: ['Juega {n} rondas con amigos', 'Play {n} rounds with friends', 'Jogue {n} rodadas com amigos'] },
  { id: 'lamina', tipo: 'lamina', meta: 3, puntos: 50, texto: ['Gana {n} láminas del álbum', 'Win {n} album cards', 'Ganhe {n} figurinhas do álbum'] },
  { id: 'regalo', tipo: 'regalo', meta: 4, puntos: 40, texto: ['Recibe el regalo diario {n} días', 'Collect the daily gift {n} days', 'Receba o presente diário {n} dias'] },
];

/** Semana (lunes a domingo) como "AAAA-Snn". */
export function semana(fecha = new Date()) {
  const d = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const n = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - n + 3);
  const primerJueves = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const s = 1 + Math.round(((d - primerJueves) / 86400000 - 3 + ((primerJueves.getUTCDay() + 6) % 7)) / 7);
  return `${d.getUTCFullYear()}-S${String(s).padStart(2, '0')}`;
}

/** Los desafíos de la semana: 3 para todos y 2 premium, iguales para todos los jugadores esa semana. */
export function desafiosDeSemana(sem = semana()) {
  let h = 2166136261;
  for (const c of sem) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const orden = [...DESAFIOS];
  for (let i = orden.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0;
    const j = h % (i + 1);
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden.slice(0, 5).map((d, i) => ({ ...d, premium: i >= 3 }));
}

function misDesafios(estado = obtener(), fecha = new Date()) {
  const s = semana(fecha);
  if (!estado.desafios || estado.desafios.semana !== s) estado.desafios = { semana: s, progreso: {}, cobrados: [] };
  return estado.desafios;
}

/** Anota algo que hizo el jugador (lo llaman los puestos). No guarda: lo hace quien llama. */
export function registrar(tipo, n = 1, estado = obtener(), fecha = new Date()) {
  const d = misDesafios(estado, fecha);
  d.progreso[tipo] = (d.progreso[tipo] || 0) + n;
}

/** Estado de los desafíos para mostrarlos. */
export function listaDesafios(estado = obtener(), fecha = new Date()) {
  const d = misDesafios(estado, fecha);
  const premium = Boolean(miTemporada(estado, fecha)?.premium);
  return desafiosDeSemana(semana(fecha)).map((x) => ({
    ...x,
    avance: Math.min(x.meta, d.progreso[x.tipo] || 0),
    listo: (d.progreso[x.tipo] || 0) >= x.meta,
    cobrado: d.cobrados.includes(x.id),
    bloqueado: x.premium && !premium,
  }));
}

/** Cobra un desafío cumplido: da sus puntos de temporada. */
export function cobrarDesafio(id, estado = obtener(), fecha = new Date()) {
  const x = listaDesafios(estado, fecha).find((d) => d.id === id);
  if (!x || !x.listo || x.cobrado || x.bloqueado || !miTemporada(estado, fecha)) return 0;
  misDesafios(estado, fecha).cobrados.push(id);
  sumarPuntosTemporada(x.puntos, estado, fecha);
  guardar();
  return x.puntos;
}

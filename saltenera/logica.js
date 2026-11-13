// Reglas de La Salteñera. Funciones puras: el tiempo llega desde afuera.
// Horneas y vendes salteñas, compras mejoras y el puesto sigue vendiendo mientras no juegas.

export const CRECE = 1.15;
export const HORAS_FUERA_MAX = 8;
export const PARTE_FUERA = 0.5; // fuera del juego el puesto vende a la mitad de ritmo
export const PICO_SEGUNDOS = 60;

/** tipo: 'toque' suma a cada toque, 'auto' vende por segundo, 'multi' multiplica todo. */
export const MEJORAS = [
  { id: 'mano', base: 15, tipo: 'toque', valor: 1 },
  { id: 'horno', base: 50, tipo: 'auto', valor: 1 },
  { id: 'ayudante', base: 500, tipo: 'auto', valor: 8 },
  { id: 'carrito', base: 5000, tipo: 'auto', valor: 50 },
  { id: 'local', base: 60000, tipo: 'auto', valor: 400 },
  { id: 'receta', base: 1000, tipo: 'multi', valor: 1.5, crece: 4, max: 12 },
];

export function estadoInicial() {
  return { ventas: 0, total: 0, mejoras: {}, hitos: 0, pedidos: 0, pedido: null, ultimaVez: null, picoHasta: 0 };
}

export function cantidad(estado, id) {
  return estado.mejoras[id] || 0;
}

export function costo(estado, id) {
  const m = MEJORAS.find((x) => x.id === id);
  return Math.ceil(m.base * Math.pow(m.crece || CRECE, cantidad(estado, id)));
}

export function alTope(estado, id) {
  const m = MEJORAS.find((x) => x.id === id);
  return m.max !== undefined && cantidad(estado, id) >= m.max;
}

export function multiplicador(estado) {
  return Math.pow(1.5, cantidad(estado, 'receta'));
}

export function porToque(estado) {
  return (1 + cantidad(estado, 'mano')) * multiplicador(estado);
}

export function porSegundo(estado) {
  let base = 0;
  for (const m of MEJORAS) if (m.tipo === 'auto') base += cantidad(estado, m.id) * m.valor;
  return base * multiplicador(estado);
}

function cobrar(estado, monto) {
  estado.ventas += monto;
  estado.total += monto;
  return monto;
}

export function comprar(estado, id) {
  if (alTope(estado, id)) return false;
  const precio = costo(estado, id);
  if (estado.ventas < precio) return false;
  estado.ventas -= precio;
  estado.mejoras[id] = cantidad(estado, id) + 1;
  return true;
}

export function enPico(estado, ahoraMs) {
  return ahoraMs < estado.picoHasta;
}

export function empezarPico(estado, ahoraMs) {
  estado.picoHasta = Math.max(estado.picoHasta, ahoraMs) + PICO_SEGUNDOS * 1000;
}

/** Un toque en el horno. Devuelve lo vendido. */
export function toque(estado, ahoraMs) {
  const monto = porToque(estado) * (enPico(estado, ahoraMs) ? 2 : 1);
  if (estado.pedido) estado.pedido.hechas++;
  return cobrar(estado, monto);
}

/** Pasa el tiempo con el juego abierto. Devuelve lo vendido. */
export function avanzar(estado, dt, ahoraMs) {
  return cobrar(estado, porSegundo(estado) * dt * (enPico(estado, ahoraMs) ? 2 : 1));
}

/** Lo que vendió el puesto mientras el juego estuvo cerrado. */
export function gananciaFuera(estado, ahoraMs) {
  if (estado.ultimaVez === null || estado.ultimaVez === undefined) return 0;
  const segundos = Math.min(HORAS_FUERA_MAX * 3600, (ahoraMs - estado.ultimaVez) / 1000);
  if (segundos < 60) return 0;
  return Math.floor(porSegundo(estado) * segundos * PARTE_FUERA);
}

export function cobrarFuera(estado, monto) {
  return cobrar(estado, monto);
}

// ---------- Hitos: yapa por ventas totales ----------

export function umbralHito(k) {
  return 100 * Math.pow(10, k);
}

export function yapaHito(k) {
  return 5 + 3 * k;
}

/** Hitos recién alcanzados: [{ umbral, yapa }]. Los marca como entregados. */
export function revisarHitos(estado) {
  const nuevos = [];
  while (estado.total >= umbralHito(estado.hitos)) {
    nuevos.push({ umbral: umbralHito(estado.hitos), yapa: yapaHito(estado.hitos) });
    estado.hitos++;
  }
  return nuevos;
}

// ---------- Pedidos del caserito: salteñas hechas a mano ----------

export const YAPA_PEDIDO = 2;

export function nuevoPedido(estado, cara = 0) {
  estado.pedido = { cantidad: 15 + 5 * Math.min(estado.pedidos, 9), hechas: 0, cara };
  return estado.pedido;
}

export function pedidoListo(estado) {
  return Boolean(estado.pedido) && estado.pedido.hechas >= estado.pedido.cantidad;
}

/** Entrega el pedido: el caserito deja una propina de medio minuto de ventas. */
export function entregarPedido(estado) {
  if (!pedidoListo(estado)) return 0;
  estado.pedido = null;
  estado.pedidos++;
  return cobrar(estado, Math.max(20, Math.floor(porSegundo(estado) * 30)));
}

// ---------- Números grandes ----------

const SUFIJOS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

export function formato(n) {
  if (n < 1000) return String(Math.floor(n));
  let i = 0;
  let v = n;
  while (v >= 1000 && i < SUFIJOS.length - 1) {
    v /= 1000;
    i++;
  }
  return `${v >= 100 ? Math.floor(v) : v.toFixed(1)}${SUFIJOS[i]}`;
}

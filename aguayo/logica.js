// Reglas de El Aguayo. Funciones puras: no tocan el DOM ni el guardado.
// El telar es una matriz TAM×TAM; cada celda es null o el color del hilo que la ocupa.

export const TAM = 8;

/** Colores de hilo: los refrescos del mercado. */
export const HILOS = ['frutilla', 'tumbo', 'hierbabuena', 'api', 'limonada'];

export const COLOR_HILO = {
  frutilla: '#ef476f',
  tumbo: '#ffb520',
  hierbabuena: '#1fb5a5',
  api: '#9a48b8',
  limonada: '#a6d63a',
};

// ---------- Piezas ----------

function desdeDibujo(dibujo) {
  const celdas = [];
  dibujo.split('/').forEach((fila, f) => {
    [...fila].forEach((c, k) => {
      if (c === 'x') celdas.push([f, k]);
    });
  });
  return celdas;
}

/** Cada pieza: celdas [fila, columna] desde la esquina de arriba a la izquierda, y su peso al salir. */
export const PIEZAS = [
  { id: 'uno', celdas: desdeDibujo('x'), peso: 2 },
  { id: 'dos-h', celdas: desdeDibujo('xx'), peso: 3 },
  { id: 'dos-v', celdas: desdeDibujo('x/x'), peso: 3 },
  { id: 'tres-h', celdas: desdeDibujo('xxx'), peso: 3 },
  { id: 'tres-v', celdas: desdeDibujo('x/x/x'), peso: 3 },
  { id: 'cuatro-h', celdas: desdeDibujo('xxxx'), peso: 2 },
  { id: 'cuatro-v', celdas: desdeDibujo('x/x/x/x'), peso: 2 },
  { id: 'cinco-h', celdas: desdeDibujo('xxxxx'), peso: 1 },
  { id: 'cinco-v', celdas: desdeDibujo('x/x/x/x/x'), peso: 1 },
  { id: 'cuadro', celdas: desdeDibujo('xx/xx'), peso: 3 },
  { id: 'cuadro-grande', celdas: desdeDibujo('xxx/xxx/xxx'), peso: 1 },
  { id: 'rect-h', celdas: desdeDibujo('xxx/xxx'), peso: 1 },
  { id: 'rect-v', celdas: desdeDibujo('xx/xx/xx'), peso: 1 },
  { id: 'ele-1', celdas: desdeDibujo('x./xx'), peso: 2 },
  { id: 'ele-2', celdas: desdeDibujo('.x/xx'), peso: 2 },
  { id: 'ele-3', celdas: desdeDibujo('xx/x.'), peso: 2 },
  { id: 'ele-4', celdas: desdeDibujo('xx/.x'), peso: 2 },
  { id: 'ele-grande-1', celdas: desdeDibujo('x../x../xxx'), peso: 1 },
  { id: 'ele-grande-2', celdas: desdeDibujo('..x/..x/xxx'), peso: 1 },
  { id: 'ele-grande-3', celdas: desdeDibujo('xxx/x../x..'), peso: 1 },
  { id: 'ele-grande-4', celdas: desdeDibujo('xxx/..x/..x'), peso: 1 },
  { id: 'te-1', celdas: desdeDibujo('xxx/.x.'), peso: 1 },
  { id: 'te-2', celdas: desdeDibujo('.x./xxx'), peso: 1 },
  { id: 'te-3', celdas: desdeDibujo('x./xx/x.'), peso: 1 },
  { id: 'te-4', celdas: desdeDibujo('.x/xx/.x'), peso: 1 },
  { id: 'ese-1', celdas: desdeDibujo('.xx/xx.'), peso: 1 },
  { id: 'ese-2', celdas: desdeDibujo('xx./.xx'), peso: 1 },
  { id: 'ese-3', celdas: desdeDibujo('x./xx/.x'), peso: 1 },
  { id: 'ese-4', celdas: desdeDibujo('.x/xx/x.'), peso: 1 },
];

export function pieza(id) {
  return PIEZAS.find((p) => p.id === id);
}

export function medida(celdas) {
  let filas = 0;
  let cols = 0;
  for (const [f, c] of celdas) {
    filas = Math.max(filas, f + 1);
    cols = Math.max(cols, c + 1);
  }
  return { filas, cols };
}

// ---------- Telar ----------

export function crearTelar() {
  return Array.from({ length: TAM }, () => Array(TAM).fill(null));
}

export function clonar(telar) {
  return telar.map((fila) => fila.slice());
}

export function cabe(telar, celdas, fila, col) {
  for (const [f, c] of celdas) {
    const y = fila + f;
    const x = col + c;
    if (y < 0 || x < 0 || y >= TAM || x >= TAM) return false;
    if (telar[y][x] !== null) return false;
  }
  return true;
}

export function hayLugar(telar, celdas) {
  const { filas, cols } = medida(celdas);
  for (let f = 0; f <= TAM - filas; f++) {
    for (let c = 0; c <= TAM - cols; c++) if (cabe(telar, celdas, f, c)) return true;
  }
  return false;
}

/** Filas y columnas que quedarían completas con el telar tal como está. */
export function lineasCompletas(telar) {
  const filas = [];
  const columnas = [];
  for (let i = 0; i < TAM; i++) {
    if (telar[i].every((v) => v !== null)) filas.push(i);
    if (telar.every((fila) => fila[i] !== null)) columnas.push(i);
  }
  return { filas, columnas };
}

/** El color que domina una línea: el que ocupa al menos la mitad. Si no hay, null. */
export function colorDominante(colores) {
  const cuenta = {};
  for (const c of colores) cuenta[c] = (cuenta[c] || 0) + 1;
  let mejor = null;
  let max = 0;
  for (const [c, n] of Object.entries(cuenta)) {
    if (n > max) {
      max = n;
      mejor = c;
    }
  }
  return max * 2 >= colores.length ? mejor : null;
}

/** Puntos por tejer varias líneas a la vez: cuantas más juntas, más valen. */
export function puntosLineas(n) {
  return (10 * n * (n + 1)) / 2;
}

/**
 * Pone una pieza y teje las líneas completas.
 * Devuelve { telar, lleno, franjas, puntos } o null si no cabe.
 * `lleno` es el telar con la pieza puesta antes de tejer (para animar);
 * cada franja es { tipo: 'fila' | 'columna', indice, colores, dominante }.
 */
export function colocar(telar, celdas, fila, col, color) {
  if (!cabe(telar, celdas, fila, col)) return null;
  const lleno = clonar(telar);
  for (const [f, c] of celdas) lleno[fila + f][col + c] = color;
  const { filas, columnas } = lineasCompletas(lleno);
  const franjas = [
    ...filas.map((i) => ({ tipo: 'fila', indice: i, colores: lleno[i].slice() })),
    ...columnas.map((i) => ({ tipo: 'columna', indice: i, colores: lleno.map((r) => r[i]) })),
  ].map((fr) => ({ ...fr, dominante: colorDominante(fr.colores) }));
  const nuevo = clonar(lleno);
  for (const i of filas) nuevo[i].fill(null);
  for (const i of columnas) for (const r of nuevo) r[i] = null;
  return { telar: nuevo, lleno, franjas, puntos: celdas.length + puntosLineas(franjas.length) };
}

// ---------- Mano ----------

export function piezaAlAzar(rnd) {
  const total = PIEZAS.reduce((a, p) => a + p.peso, 0);
  let x = rnd() * total;
  for (const p of PIEZAS) {
    x -= p.peso;
    if (x < 0) return p;
  }
  return PIEZAS[0];
}

/**
 * Tres piezas nuevas, cada una con su hilo. Se intenta que al menos una quepa,
 * para que la partida no se trabe por pura mala suerte.
 */
export function nuevaMano(rnd, telar, hilos = HILOS) {
  let mano = null;
  for (let intento = 0; intento < 30; intento++) {
    mano = [0, 1, 2].map(() => ({ pieza: piezaAlAzar(rnd), color: hilos[Math.floor(rnd() * hilos.length)] }));
    if (!telar || mano.some((m) => hayLugar(telar, m.pieza.celdas))) return mano;
  }
  return mano;
}

export function estaTrabado(telar, mano) {
  return mano.every((m) => m === null || !hayLugar(telar, m.pieza.celdas));
}

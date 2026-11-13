// Contrarreloj: modo opcional de cada puesto. Unos segundos para hacer lo máximo posible,
// con récord propio y un poco de yapa. El modo normal de cada puesto no cambia.

import { t } from './i18n.js';
import { ventana, confeti } from './ui.js';
import { sumarYapa } from './almacen.js';
import { sonar } from './sonido.js';

/** Segundos de cada puesto. El puesto de comida es un "pedido relámpago" más corto. */
export const SEGUNDOS = { refresquera: 90, frutera: 90, aguayo: 90, saltenera: 30 };

/** Yapa por partida: según lo hecho, con tope, y un extra si es récord. */
export const YAPA_TOPE = 20;
export const YAPA_RECORD = 10;

export function yapaReloj(puntos, divisor, record) {
  if (puntos <= 0) return 0;
  return Math.min(YAPA_TOPE, Math.max(1, Math.floor(puntos / divisor))) + (record ? YAPA_RECORD : 0);
}

/**
 * Cuenta regresiva que se detiene sola cuando el juego está en pausa (ventanas abiertas)
 * o la pantalla está oculta. `alTic(restante)` en cada cuadro; `alTerminar()` al llegar a cero.
 */
export function crearReloj({ segundos, pausado = () => false, alTic = () => {}, alTerminar = () => {} }) {
  let restante = segundos;
  let activo = false;
  let ultimo = 0;
  let pitado = 0;
  function paso(ahora) {
    if (!activo) return;
    const dt = Math.min(0.25, (ahora - ultimo) / 1000);
    ultimo = ahora;
    if (!pausado() && !document.hidden) restante -= dt;
    // Pitidos los últimos cinco segundos
    const entero = Math.ceil(restante);
    if (entero <= 5 && entero > 0 && entero !== pitado) {
      pitado = entero;
      sonar.elegir?.();
    }
    alTic(Math.max(0, restante), segundos);
    if (restante <= 0) {
      activo = false;
      alTerminar();
      return;
    }
    requestAnimationFrame(paso);
  }
  return {
    empezar() {
      restante = segundos;
      pitado = 0;
      activo = true;
      ultimo = performance.now();
      requestAnimationFrame(paso);
    },
    detener() {
      activo = false;
    },
    get activo() {
      return activo;
    },
    get restante() {
      return restante;
    },
  };
}

/** Pone la barra del reloj debajo de la barra de arriba del puesto (oculta hasta que se use). */
export function montarBarraReloj() {
  let el = document.getElementById('reloj');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'reloj';
  el.className = 'reloj';
  el.hidden = true;
  el.setAttribute('role', 'timer');
  el.innerHTML = '<div class="reloj-barra"><i></i></div><span class="reloj-segundos"></span>';
  document.querySelector('.barra').insertAdjacentElement('afterend', el);
  return el;
}

export function pintarReloj(el, restante, total) {
  el.hidden = false;
  el.querySelector('i').style.width = `${(restante / total) * 100}%`;
  el.querySelector('.reloj-segundos').textContent = `${Math.ceil(restante)} s`;
  el.classList.toggle('apurado', restante <= 10);
}

export function ocultarReloj(el) {
  el.hidden = true;
  el.classList.remove('apurado');
}

/** Pregunta si empezar el contrarreloj. Devuelve true si el jugador acepta. */
export async function preguntarContrarreloj({ segundos, que, record }) {
  const r = await ventana({
    titulo: t('contrarreloj'),
    texto: `${t('contrarrelojDesc', { s: segundos, que })}${record ? ` ${t('relojRecord', { n: record })}` : ''}`,
    conCasera: true,
    botones: [
      { texto: t('empezarReloj'), valor: 'si' },
      { texto: t('cerrar'), valor: null, clase: 'secundario' },
    ],
  });
  return r === 'si';
}

/**
 * Ventana final del contrarreloj: da la yapa y devuelve 'otra', 'normal' o 'mercado'.
 * `hecho`: texto de lo logrado (por ejemplo "12 vasos").
 */
export async function finContrarreloj({ hecho, nuevoRecord, yapa }) {
  if (yapa > 0) sumarYapa(yapa);
  sonar.fin?.();
  if (nuevoRecord) confeti();
  return ventana({
    titulo: t('tiempo'),
    texto: `${t('relojResultado', { hecho })}${nuevoRecord ? ` ${t('nuevoRecord')}` : ''}${yapa > 0 ? ` ${t('masYapa', { n: yapa })}` : ''}`,
    conCasera: true,
    cerrable: false,
    botones: [
      { texto: t('otraVez'), valor: 'otra' },
      { texto: t('modoNormal'), valor: 'normal', clase: 'secundario' },
      { texto: t('volverMercado'), valor: 'mercado', clase: 'secundario' },
    ],
  });
}

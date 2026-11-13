// Piezas de interfaz comunes: aviso flotante, ventana, contador de yapa y burbuja de La Casera.

import { obtener, alCambiar } from './almacen.js';
import { t } from './i18n.js';
import { casera } from './marca.js';

export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

export function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

let zonaAvisos = null;

/** Aviso corto que desaparece solo. */
export function aviso(texto, { tipo = '' } = {}) {
  if (!zonaAvisos) {
    zonaAvisos = el('<div class="avisos" role="status" aria-live="polite"></div>');
    document.body.appendChild(zonaAvisos);
  }
  const a = el(`<div class="aviso ${tipo}">${escapar(texto)}</div>`);
  zonaAvisos.appendChild(a);
  setTimeout(() => a.classList.add('sale'), 1600);
  setTimeout(() => a.remove(), 2000);
}

/** "+2" que sube desde un elemento. */
export function flotante(texto, desde) {
  const r = desde.getBoundingClientRect();
  const f = el(`<div class="flotante">${escapar(texto)}</div>`);
  f.style.left = `${r.left + r.width / 2}px`;
  f.style.top = `${r.top}px`;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1000);
}

/**
 * Ventana con título, texto y botones. Devuelve una promesa con el `valor` del botón elegido.
 * botones: [{ texto, valor, clase, deshabilitado }]
 */
export function ventana({ titulo, texto = '', html = '', botones = [], conCasera = false, cerrable = true }) {
  return new Promise((resolver) => {
    const fondo = el(`<div class="ventana-fondo">
      <div class="ventana" role="dialog" aria-modal="true" aria-labelledby="ventana-titulo">
        ${conCasera ? `<div class="ventana-casera">${casera()}</div>` : ''}
        <h2 id="ventana-titulo">${escapar(titulo)}</h2>
        ${texto ? `<p>${escapar(texto)}</p>` : ''}
        ${html}
        <div class="ventana-botones"></div>
      </div>
    </div>`);
    const zona = fondo.querySelector('.ventana-botones');
    const cerrar = (valor) => {
      fondo.classList.add('sale');
      document.removeEventListener('keydown', tecla);
      setTimeout(() => fondo.remove(), 160);
      resolver(valor);
    };
    const tecla = (e) => {
      if (e.key === 'Escape' && cerrable) cerrar(null);
    };
    for (const b of botones) {
      const boton = el(`<button class="boton ${b.clase || ''}" ${b.deshabilitado ? 'disabled' : ''}>${escapar(b.texto)}</button>`);
      boton.addEventListener('click', () => cerrar(b.valor));
      zona.appendChild(boton);
    }
    if (cerrable) {
      fondo.addEventListener('click', (e) => {
        if (e.target === fondo) cerrar(null);
      });
    }
    document.addEventListener('keydown', tecla);
    document.body.appendChild(fondo);
    zona.querySelector('button:not([disabled])')?.focus();
  });
}

/** Mantiene al día todos los elementos [data-yapa] con la yapa guardada. */
export function contadorYapa() {
  const pintar = () => {
    for (const n of document.querySelectorAll('[data-yapa]')) {
      const anterior = Number(n.textContent) || 0;
      const actual = obtener().yapa;
      n.textContent = String(actual);
      if (actual > anterior && anterior !== 0) {
        n.closest('.yapa-chip')?.classList.remove('brilla');
        void n.offsetWidth;
        n.closest('.yapa-chip')?.classList.add('brilla');
      }
    }
  };
  pintar();
  alCambiar(pintar);
}

export function chipYapa() {
  return `<span class="yapa-chip" title="${escapar(t('tuYapa'))}"><span class="yapa-icono" aria-hidden="true"></span><span data-yapa>${obtener().yapa}</span><span class="solo-lector"> ${escapar(t('yapa'))}</span></span>`;
}

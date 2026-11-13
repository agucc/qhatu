// Piezas de interfaz comunes: aviso flotante, ventana, contador de yapa y burbuja de La Casera.

import { obtener, alCambiar } from './almacen.js';
import { t } from './i18n.js';
import { casera } from './marca.js';
import { paisActual } from './paises.js';

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
        ${conCasera ? `<div class="ventana-casera">${casera(paisActual(obtener()))}</div>` : ''}
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

/** Mantiene al día todos los elementos [data-yapa] con la yapa guardada; al ganar, el número sube contando. */
export function contadorYapa() {
  let mostrado = obtener().yapa;
  let reloj = null;
  const poner = (n) => {
    for (const el of document.querySelectorAll('[data-yapa]')) el.textContent = String(n);
  };
  const pintar = () => {
    const meta = obtener().yapa;
    if (meta === mostrado) return poner(meta);
    if (meta > mostrado) {
      for (const el of document.querySelectorAll('.yapa-chip')) {
        el.classList.remove('brilla');
        void el.offsetWidth;
        el.classList.add('brilla');
      }
    }
    cancelAnimationFrame(reloj);
    const desde = mostrado;
    const t0 = performance.now();
    const paso = (ahora) => {
      const k = Math.min(1, (ahora - t0) / 450);
      mostrado = Math.round(desde + (meta - desde) * k);
      poner(mostrado);
      if (k < 1) reloj = requestAnimationFrame(paso);
    };
    reloj = requestAnimationFrame(paso);
  };
  poner(mostrado);
  alCambiar(pintar);
}

const COLORES_CONFETI = ['#ef476f', '#ffb520', '#1fb5a5', '#9a48b8', '#a6d63a', '#f3ead2'];

/** Papel picado que salta desde un punto (por defecto, el centro de la pantalla). */
export function confeti({ x = window.innerWidth / 2, y = window.innerHeight * 0.4, cantidad = 40 } = {}) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const capa = el('<div class="confeti" aria-hidden="true"></div>');
  document.body.appendChild(capa);
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('i');
    p.style.background = COLORES_CONFETI[i % COLORES_CONFETI.length];
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    if (i % 3 === 0) p.style.borderRadius = '50%';
    capa.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const fuerza = 80 + Math.random() * 220;
    const dx = Math.cos(ang) * fuerza;
    const dy = Math.sin(ang) * fuerza - 120;
    p.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.7}px, ${dy}px) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy + 380}px) rotate(${Math.random() * 720}deg)`, opacity: 0 },
      ],
      { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' }
    );
  }
  setTimeout(() => capa.remove(), 1800);
}

/** Si el puesto subió de nivel, lo celebra. Recibe lo que devuelve ganarXp(). */
export function celebrarNivel(r) {
  if (!r || !r.subio) return;
  confeti();
  aviso(t('puestoSube', { n: r.nivel, yapa: r.yapa }), { tipo: 'exito' });
}

export function chipYapa() {
  return `<span class="yapa-chip" title="${escapar(t('tuYapa'))}"><span class="yapa-icono" aria-hidden="true"></span><span data-yapa>${obtener().yapa}</span><span class="solo-lector"> ${escapar(t('yapa'))}</span></span>`;
}

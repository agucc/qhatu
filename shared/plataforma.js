// Ajustes según dónde corre el juego. En Telegram (mini app): colores, pantalla completa y botón atrás.
// También arranca la partida en la nube en todas las pantallas.

import { EN_TELEGRAM } from './config.js';
import { iniciarNube } from './nube.js';

const SDK_TELEGRAM = 'https://telegram.org/js/telegram-web-app.js';

function cargarScript(src) {
  return new Promise((ok, mal) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ok;
    s.onerror = mal;
    document.head.appendChild(s);
  });
}

/**
 * Ajusta el tamaño del nombre del puesto en la barra de arriba para que entre completo
 * (hasta dos líneas) en pantallas angostas: achica la letra y, si no alcanza, lo pasa a su propia fila.
 */
export function ajustarTitulos() {
  for (const el of document.querySelectorAll('.barra-puesto')) {
    const barra = el.closest('.barra');
    const cabe = () => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
    const probar = (minimo) => {
      for (let tam = 20; tam >= minimo; tam--) {
        el.style.setProperty('--tam-titulo', `${tam}px`);
        if (cabe()) return true;
      }
      return false;
    };
    // Primero en la misma fila que los botones; si no entra ni con letra de 15 px,
    // el nombre baja a su propia fila, a todo el ancho.
    barra?.classList.remove('dos-filas');
    if (probar(15)) continue;
    barra?.classList.add('dos-filas');
    probar(13);
  }
}

function vigilarTitulos() {
  if (typeof document === 'undefined' || !document.querySelector('.barra-puesto')) return;
  let pendiente = false;
  const ajustar = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      pendiente = false;
      ajustarTitulos();
    });
  };
  ajustar();
  if (document.fonts?.ready) document.fonts.ready.then(ajustar);
  window.addEventListener('resize', ajustar);
  document.addEventListener('qhatu:idioma', ajustar);
  for (const el of document.querySelectorAll('.barra-puesto')) {
    new MutationObserver(ajustar).observe(el, { childList: true, characterData: true, subtree: true });
  }
}

/** `esPuesto`: true en las pantallas de juego, donde el botón atrás de Telegram vuelve al mercado. */
export async function iniciarPlataforma({ esPuesto = false } = {}) {
  iniciarNube();
  vigilarTitulos();
  if (!EN_TELEGRAM) return;
  try {
    if (!window.Telegram?.WebApp) await cargarScript(SDK_TELEGRAM);
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#17131f');
    tg.setBackgroundColor?.('#17131f');
    document.body.classList.add('en-telegram');
    if (esPuesto && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        location.href = '../index.html';
      });
    } else {
      tg.BackButton?.hide();
    }
  } catch {
    /* sin Telegram, el juego sigue igual */
  }
}

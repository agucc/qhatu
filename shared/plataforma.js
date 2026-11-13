// Ajustes según dónde corre el juego. En Telegram (mini app): colores, pantalla completa y botón atrás.

import { EN_TELEGRAM } from './config.js';

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

/** `esPuesto`: true en las pantallas de juego, donde el botón atrás de Telegram vuelve al mercado. */
export async function iniciarPlataforma({ esPuesto = false } = {}) {
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

// Retar a un amigo: comparte un texto con el enlace del juego.
// Usa lo que haya: Telegram, el menú de compartir de Android, el del navegador o el portapapeles.

import { ENLACE_JUEGO } from './config.js';
import { complementoNativo } from './nativo.js';

/** Devuelve 'compartido', 'copiado' o 'no'. */
export async function compartir(texto, url = ENLACE_JUEGO) {
  const tg = window.Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`);
    return 'compartido';
  }
  const nativo = complementoNativo('Share');
  if (nativo) {
    try {
      await nativo.share({ title: 'Qhatu', text: texto, url });
      return 'compartido';
    } catch {
      /* el jugador cerró el menú */
      return 'no';
    }
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Qhatu', text: texto, url });
      return 'compartido';
    } catch {
      return 'no';
    }
  }
  try {
    await navigator.clipboard.writeText(`${texto} ${url}`);
    return 'copiado';
  } catch {
    return 'no';
  }
}

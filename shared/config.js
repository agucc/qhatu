// Dónde corre el juego: sitio propio, CrazyGames o Poki.
// El script de empaquetado fija window.QHATU_PORTAL; en desarrollo se puede usar ?portal=crazygames.

const parametros = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

const enApp = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

// Telegram abre la mini app con datos en el #; se recuerda para las demás páginas de la visita.
function detectarTelegram() {
  if (typeof location === 'undefined') return false;
  try {
    if (location.hash.includes('tgWebApp') || parametros.get('tg') === '1') sessionStorage.setItem('qhatu.tg', '1');
    return sessionStorage.getItem('qhatu.tg') === '1';
  } catch {
    return false;
  }
}
const enTelegram = detectarTelegram();

/** 'propio' (sitio web), 'app' (Android), 'telegram', 'crazygames' o 'poki'. */
export const PORTAL =
  (typeof window !== 'undefined' && window.QHATU_PORTAL) || parametros.get('portal') || (enApp ? 'app' : enTelegram ? 'telegram' : 'propio');

/** En el sitio propio todavía no hay red de anuncios. ?anuncios=demo simula uno para probar. */
export const ANUNCIOS_DEMO = parametros.get('anuncios') === 'demo';

/** Dentro de un portal de juegos no se enlaza al resto del sitio. */
export const EN_PORTAL = PORTAL === 'crazygames' || PORTAL === 'poki';

export const EN_APP = PORTAL === 'app';

export const EN_TELEGRAM = PORTAL === 'telegram';

/** Enlace que se comparte al retar a un amigo. Cuando el sitio esté en línea, poner aquí su dirección. */
export const ENLACE_JUEGO = 'https://github.com/agucc/qhatu/releases/tag/apk-prueba';

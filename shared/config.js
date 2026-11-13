// Dónde corre el juego: sitio propio, CrazyGames o Poki.
// El script de empaquetado fija window.QHATU_PORTAL; en desarrollo se puede usar ?portal=crazygames.

const parametros = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

const enApp = typeof window !== 'undefined' && Boolean(window.Capacitor?.isNativePlatform?.());

/** 'propio' (sitio web), 'app' (Android), 'crazygames' o 'poki'. */
export const PORTAL = (typeof window !== 'undefined' && window.QHATU_PORTAL) || parametros.get('portal') || (enApp ? 'app' : 'propio');

/** En el sitio propio todavía no hay red de anuncios. ?anuncios=demo simula uno para probar. */
export const ANUNCIOS_DEMO = parametros.get('anuncios') === 'demo';

/** Dentro de un portal de juegos no se enlaza al resto del sitio. */
export const EN_PORTAL = PORTAL === 'crazygames' || PORTAL === 'poki';

export const EN_APP = PORTAL === 'app';

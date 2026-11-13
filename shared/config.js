// Dónde corre el juego: sitio propio, CrazyGames o Poki.
// El script de empaquetado fija window.QHATU_PORTAL; en desarrollo se puede usar ?portal=crazygames.

const parametros = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();

export const PORTAL = (typeof window !== 'undefined' && window.QHATU_PORTAL) || parametros.get('portal') || 'propio';

/** En el sitio propio todavía no hay red de anuncios. ?anuncios=demo simula uno para probar. */
export const ANUNCIOS_DEMO = parametros.get('anuncios') === 'demo';

export const EN_PORTAL = PORTAL !== 'propio';

// Anuncios con una sola interfaz para todos los puestos.
// Reglas de Qhatu: los anuncios solo sirven para ganar yapa y siempre los elige el jugador.
// No hay anuncios obligatorios. Quien compra el pase sin anuncios recibe la recompensa sin verlos.

import { PORTAL, ANUNCIOS_DEMO, EN_APP } from './config.js';
import { obtener } from './almacen.js';
import { pausar } from './sonido.js';
import { complementoNativo } from './nativo.js';
import { VERSION_DE_PRUEBA, UNITY_GAME_ID, UNITY_RECOMPENSA } from './compilacion.js';

const SDK_CRAZYGAMES = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';
const SDK_POKI = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';

let proveedor = null;

function cargarScript(src) {
  return new Promise((ok, mal) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = ok;
    s.onerror = mal;
    document.head.appendChild(s);
  });
}

const sinAnuncios = {
  recompensa: false,
  async verRecompensa() {
    return false;
  },
  inicioPartida() {},
  finPartida() {},
  celebrar() {},
  cargaLista() {},
};

/** Simula un anuncio de dos segundos para probar el flujo sin red de anuncios. */
const demo = {
  ...sinAnuncios,
  recompensa: true,
  verRecompensa() {
    return new Promise((ok) => {
      const capa = document.createElement('div');
      capa.className = 'anuncio-demo';
      capa.innerHTML = '<div><strong>Anuncio de prueba · Test ad</strong><span>2</span></div>';
      document.body.appendChild(capa);
      pausar(true);
      let s = 2;
      const reloj = setInterval(() => {
        s--;
        capa.querySelector('span').textContent = String(s);
        if (s <= 0) {
          clearInterval(reloj);
          capa.remove();
          pausar(false);
          ok(true);
        }
      }, 1000);
    });
  },
};

/** Unity Ads en la app Android: anuncios con recompensa (complemento propio AnunciosUnity). */
async function unity(plugin) {
  await plugin.iniciar({ gameId: UNITY_GAME_ID, prueba: VERSION_DE_PRUEBA });
  return {
    ...sinAnuncios,
    recompensa: true,
    async verRecompensa() {
      pausar(true);
      try {
        const r = await plugin.mostrar({ lugar: UNITY_RECOMPENSA });
        return Boolean(r?.completo);
      } catch {
        return false;
      } finally {
        pausar(false);
      }
    },
  };
}

function crazygames() {
  const sdk = window.CrazyGames.SDK;
  return {
    recompensa: true,
    verRecompensa: () =>
      new Promise((ok) => {
        sdk.ad.requestAd('rewarded', {
          adStarted: () => pausar(true),
          adFinished: () => {
            pausar(false);
            ok(true);
          },
          adError: () => {
            pausar(false);
            ok(false);
          },
        });
      }),
    inicioPartida: () => sdk.game.gameplayStart(),
    finPartida: () => sdk.game.gameplayStop(),
    celebrar: () => sdk.game.happytime(),
    cargaLista: () => sdk.game.loadingStop(),
  };
}

function poki() {
  const sdk = window.PokiSDK;
  return {
    recompensa: true,
    async verRecompensa() {
      pausar(true);
      const vio = await sdk.rewardedBreak().catch(() => false);
      pausar(false);
      return Boolean(vio);
    },
    inicioPartida: () => sdk.gameplayStart(),
    finPartida: () => sdk.gameplayStop(),
    celebrar() {},
    cargaLista: () => sdk.gameLoadingFinished(),
  };
}

export async function iniciarAnuncios() {
  if (proveedor) return proveedor;
  try {
    if (PORTAL === 'crazygames') {
      await cargarScript(SDK_CRAZYGAMES);
      await window.CrazyGames.SDK.init();
      window.CrazyGames.SDK.game.loadingStart();
      proveedor = crazygames();
    } else if (PORTAL === 'poki') {
      await cargarScript(SDK_POKI);
      await window.PokiSDK.init();
      proveedor = poki();
    } else if (EN_APP && UNITY_GAME_ID && complementoNativo('AnunciosUnity')) {
      proveedor = await unity(complementoNativo('AnunciosUnity'));
    } else {
      proveedor = ANUNCIOS_DEMO || (EN_APP && VERSION_DE_PRUEBA) ? demo : sinAnuncios;
    }
  } catch {
    proveedor = EN_APP && VERSION_DE_PRUEBA ? demo : sinAnuncios;
  }
  return proveedor;
}

function p() {
  return proveedor || sinAnuncios;
}

function tienePase() {
  return Boolean(obtener().sinAnuncios);
}

export const anuncios = {
  /** Hay recompensa si hay anuncios, o si el jugador tiene el pase sin anuncios. */
  get hayRecompensa() {
    return tienePase() || p().recompensa;
  },
  /** Con el pase sin anuncios la recompensa llega sin ver el anuncio. */
  verRecompensa: () => (tienePase() ? Promise.resolve(true) : p().verRecompensa()),
  /** Ya no hay anuncios obligatorios: se deja para no romper a quien la llame. */
  pausaEntreNiveles: () => Promise.resolve(),
  inicioPartida: () => p().inicioPartida(),
  finPartida: () => p().finPartida(),
  celebrar: () => p().celebrar(),
  cargaLista: () => p().cargaLista(),
};

/** Antes marcaba dónde cabía un anuncio obligatorio. Ya no hay: siempre false. */
export function tocaAnuncio() {
  return false;
}

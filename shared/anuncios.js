// Anuncios con una sola interfaz para todos los puestos.
// Reglas: nunca en medio de una partida, uno obligatorio como máximo cada tres niveles,
// y el anuncio con recompensa siempre lo elige el jugador.

import { PORTAL, ANUNCIOS_DEMO } from './config.js';
import { pausar } from './sonido.js';

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
  async pausaEntreNiveles() {},
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
      capa.innerHTML = '<div><strong>Ad</strong><span>2</span></div>';
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

function crazygames() {
  const sdk = window.CrazyGames.SDK;
  const pedir = (tipo) =>
    new Promise((ok) => {
      sdk.ad.requestAd(tipo, {
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
    });
  return {
    recompensa: true,
    verRecompensa: () => pedir('rewarded'),
    pausaEntreNiveles: () => pedir('midgame').then(() => {}),
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
    async pausaEntreNiveles() {
      pausar(true);
      await sdk.commercialBreak().catch(() => {});
      pausar(false);
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
    } else {
      proveedor = ANUNCIOS_DEMO ? demo : sinAnuncios;
    }
  } catch {
    proveedor = sinAnuncios;
  }
  return proveedor;
}

function p() {
  return proveedor || sinAnuncios;
}

export const anuncios = {
  get hayRecompensa() {
    return p().recompensa;
  },
  verRecompensa: () => p().verRecompensa(),
  pausaEntreNiveles: () => p().pausaEntreNiveles(),
  inicioPartida: () => p().inicioPartida(),
  finPartida: () => p().finPartida(),
  celebrar: () => p().celebrar(),
  cargaLista: () => p().cargaLista(),
};

/** Después de qué niveles cabe un anuncio obligatorio: nunca en los cinco primeros, y uno cada tres. */
export function tocaAnuncio(nivelTerminado) {
  return nivelTerminado >= 6 && nivelTerminado % 3 === 0;
}

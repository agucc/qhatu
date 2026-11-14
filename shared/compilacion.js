// Ajustes de la compilación.
// VERSION_DE_PRUEBA: en la APK de prueba las compras se simulan sin cobrar y los anuncios son de prueba.
// Para la versión de Google Play se pone en false (ver README).
export const VERSION_DE_PRUEBA = true;

// Por dónde se distribuye esta compilación:
//  'directo' → la APK que se descarga de GitHub/tu sitio: se paga con cripto (y tarjeta cuando esté).
//  'play'    → la versión de Google Play: se paga con Google Play (obligatorio en la tienda).
// La compilación para Play lo cambia sola (QHATU_CANAL=play en scripts/web.mjs).
export const CANAL = 'directo';

// Unity Ads (anuncios con recompensa en la app Android, sin AdMob). En el panel de Unity
// (Monetization → Ad Units) se crea el proyecto y se copian aquí el Game ID de Android y el
// nombre del bloque con recompensa. Vacío = sin Unity (en la versión de prueba se simula).
export const UNITY_GAME_ID = '';
export const UNITY_RECOMPENSA = 'Rewarded_Android';

// AppLovin MAX (anuncios con recompensa; si está puesto, se usa antes que Unity). En el panel de
// AppLovin: Account → Keys → "SDK Key", y MAX → Ad Units → un bloque "Rewarded" de Android (su ID).
// Ambos son identificadores públicos, no contraseñas. Vacío = sin MAX.
export const APPLOVIN_SDK_KEY = '';
export const APPLOVIN_RECOMPENSA = '';

// Partida en la nube: dirección del servidor de Qhatu en Cloudflare (carpeta nube/), por ejemplo
// 'https://qhatu-nube.TU-SUBDOMINIO.workers.dev'. Vacío = sin nube (todo queda solo en el celular).
export const NUBE_URL = 'https://qhatu-nube.kreno.workers.dev';

// Ajustes de la compilación.
// VERSION_DE_PRUEBA: en la APK de prueba las compras se simulan sin cobrar y los anuncios son de prueba.
// Para la versión de Google Play se pone en false (ver README).
export const VERSION_DE_PRUEBA = true;

// AdMob: identificadores de PRUEBA de Google (muestran "Test Ad"). Al publicar, cambiar por los tuyos
// y también el APPLICATION_ID en android/app/src/main/res/values/strings.xml.
export const ADMOB_RECOMPENSA = 'ca-app-pub-3940256099942544/5224354917';

// Partida en la nube: dirección del servidor de Qhatu en Cloudflare (carpeta nube/), por ejemplo
// 'https://qhatu-nube.TU-SUBDOMINIO.workers.dev'. Vacío = sin nube (todo queda solo en el celular).
export const NUBE_URL = '';

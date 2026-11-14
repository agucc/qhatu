// Copia el sitio a www/, la carpeta que Capacitor mete dentro de la app Android.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(raiz, 'www');
const ARCHIVOS = ['index.html', 'portal.js', 'portal.css', 'icono.svg', 'manifest.webmanifest', 'shared', 'refresquera', 'frutera', 'aguayo', 'saltenera', 'tienda', 'album', 'salas', 'perfil', 'temporada'];

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const a of ARCHIVOS) cpSync(join(raiz, a), join(www, a), { recursive: true });
// Compilación para Google Play: compras reales con Google Play y sin la versión de prueba.
if (process.env.QHATU_CANAL === 'play') {
  const archivo = join(www, 'shared', 'compilacion.js');
  const original = readFileSync(archivo, 'utf8');
  const cambiado = original.replace("export const CANAL = 'directo';", "export const CANAL = 'play';").replace('export const VERSION_DE_PRUEBA = true;', 'export const VERSION_DE_PRUEBA = false;');
  if (cambiado === original) throw new Error('No encontré CANAL o VERSION_DE_PRUEBA en shared/compilacion.js');
  writeFileSync(archivo, cambiado);
  console.log('canal: play (compras con Google Play, sin versión de prueba)');
}
console.log('listo: www/');

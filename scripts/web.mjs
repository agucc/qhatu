// Copia el sitio a www/, la carpeta que Capacitor mete dentro de la app Android.
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(raiz, 'www');
const ARCHIVOS = ['index.html', 'portal.js', 'portal.css', 'icono.svg', 'manifest.webmanifest', 'shared', 'refresquera', 'frutera', 'aguayo', 'saltenera', 'tienda', 'album'];

rmSync(www, { recursive: true, force: true });
mkdirSync(www);
for (const a of ARCHIVOS) cpSync(join(raiz, a), join(www, a), { recursive: true });
console.log('listo: www/');

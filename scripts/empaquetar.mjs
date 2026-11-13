// Arma un zip por juego y por portal, con index.html en la raíz como piden CrazyGames y Poki.
// Uso: node scripts/empaquetar.mjs [refresquera] [crazygames|poki]
// Sin argumentos arma todos los juegos listos para todos los portales.

import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const JUEGOS = ['refresquera', 'frutera'];
const PORTALES = ['crazygames', 'poki'];

const [juegoPedido, portalPedido] = process.argv.slice(2);
const juegos = juegoPedido ? [juegoPedido] : JUEGOS;
const portales = portalPedido ? [portalPedido] : PORTALES;

for (const juego of juegos) {
  if (!existsSync(join(raiz, juego, 'index.html'))) throw new Error(`No existe el juego "${juego}"`);
  for (const portal of portales) {
    const destino = join(raiz, 'dist', portal, juego);
    rmSync(destino, { recursive: true, force: true });
    mkdirSync(destino, { recursive: true });
    cpSync(join(raiz, juego), destino, { recursive: true });
    cpSync(join(raiz, 'shared'), join(destino, 'shared'), { recursive: true });
    cpSync(join(raiz, 'icono.svg'), join(destino, 'icono.svg'));

    const archivoHtml = join(destino, 'index.html');
    let html = readFileSync(archivoHtml, 'utf8');
    html = html
      .replaceAll('../shared/', 'shared/')
      .replaceAll('../icono.svg', 'icono.svg')
      .replace(/\s*<link rel="manifest"[^>]*>/, '')
      .replace('<script type="module"', `<script>window.QHATU_PORTAL = '${portal}';</script>\n  <script type="module"`);
    writeFileSync(archivoHtml, html);

    // Los módulos del juego importan ../shared/; en el zip, shared/ queda al lado.
    for (const archivo of readdirSync(destino).filter((a) => a.endsWith('.js'))) {
      const ruta = join(destino, archivo);
      writeFileSync(ruta, readFileSync(ruta, 'utf8').replaceAll("'../shared/", "'./shared/"));
    }

    const zip = join(raiz, 'dist', `${juego}-${portal}.zip`);
    rmSync(zip, { force: true });
    execFileSync('zip', ['-qr', zip, '.'], { cwd: destino });
    console.log(`listo: dist/${juego}-${portal}.zip`);
  }
}

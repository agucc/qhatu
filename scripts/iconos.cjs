// Genera los íconos de Android y la pantalla de carga a partir de icono.svg (el logo sin letras).
// Uso: node scripts/iconos.cjs   (necesita Playwright con Chromium)

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const res = path.join(raiz, 'android/app/src/main/res');
const svg = fs.readFileSync(path.join(raiz, 'icono.svg'), 'utf8');
const FONDO = '<rect width="100" height="100" rx="22" fill="#f3ead2"/>';
const marca = svg.slice(svg.indexOf(FONDO) + FONDO.length, svg.lastIndexOf('</svg>'));

const DENSIDADES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

// Ícono cuadrado (Android viejo), redondo y la capa de adelante del ícono adaptable
// (108 dp; Android muestra el círculo central de 72 dp: el dibujo va al 56 % del lado para que entre entero).
const cuadrado = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${FONDO}${marca}</svg>`;
const redondo = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#f3ead2"/><g transform="translate(50 50) scale(.8) translate(-50 -50)">${marca}</g></svg>`;
const adelante = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g transform="translate(50 50) scale(.56) translate(-50 -50)">${marca}</g></svg>`;

async function foto(pagina, contenido, ancho, alto, salida, fondo = 'transparent') {
  await pagina.setViewportSize({ width: ancho, height: alto });
  await pagina.setContent(`<html><body style="margin:0;background:${fondo}">${contenido}</body></html>`);
  await pagina.screenshot({ path: salida, omitBackground: fondo === 'transparent' });
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const img = (s, w, h) => s.replace('<svg ', `<svg width="${w}" height="${h}" style="display:block" `);
  for (const [d, k] of Object.entries(DENSIDADES)) {
    const dir = path.join(res, `mipmap-${d}`);
    await foto(p, img(cuadrado(), 48 * k, 48 * k), 48 * k, 48 * k, path.join(dir, 'ic_launcher.png'));
    await foto(p, img(redondo(), 48 * k, 48 * k), 48 * k, 48 * k, path.join(dir, 'ic_launcher_round.png'));
    await foto(p, img(adelante(), 108 * k, 108 * k), 108 * k, 108 * k, path.join(dir, 'ic_launcher_foreground.png'));
  }
  // Pantalla de carga: el logo al centro sobre la noche del mercado, sin letras.
  for (const carpeta of fs.readdirSync(res).filter((c) => c.startsWith('drawable'))) {
    const archivo = path.join(res, carpeta, 'splash.png');
    if (!fs.existsSync(archivo)) continue;
    const buf = fs.readFileSync(archivo);
    const ancho = buf.readUInt32BE(16);
    const alto = buf.readUInt32BE(20);
    const lado = Math.round(Math.min(ancho, alto) * 0.3);
    const logo = img(cuadrado(), lado, lado).replace('style="display:block"', 'style="display:block;border-radius:18%;box-shadow:0 8px 30px #0008"');
    await foto(p, `<div style="width:${ancho}px;height:${alto}px;display:grid;place-items:center">${logo}</div>`, ancho, alto, archivo, '#17131f');
  }
  await b.close();
  console.log('Íconos y pantallas de carga listos.');
})();

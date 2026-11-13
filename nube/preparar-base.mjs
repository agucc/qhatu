// Antes de publicar: busca la base D1 "qhatu" en tu cuenta de Cloudflare (o la crea),
// pone su ID en wrangler.toml y aplica esquema.sql. Se puede ejecutar todas las veces que haga falta.
// Necesita CLOUDFLARE_API_TOKEN y CLOUDFLARE_ACCOUNT_ID en el entorno.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const NOMBRE = 'qhatu';

// El registro de GitHub Actions es público: nunca se muestra el correo de la cuenta de Cloudflare.
const sinCorreos = (texto) => String(texto || '').replace(/[\w.%+-]+@[\w.-]+/g, '<correo>');

function wrangler(...args) {
  try {
    return execFileSync('npx', ['wrangler', ...args], {
      cwd: aqui,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    console.error(sinCorreos(e.stderr));
    if (/Authentication error|code: 10000/.test(e.stderr || '')) {
      console.error('El token de Cloudflare no tiene permiso para D1: agrégale "Account · D1 · Edit".');
    }
    console.error(`Falló: wrangler ${args.join(' ')}`);
    process.exit(1);
  }
}

function buscar() {
  const salida = wrangler('d1', 'list', '--json');
  const lista = JSON.parse(salida.slice(salida.indexOf('[')));
  return lista.find((b) => b.name === NOMBRE);
}

let base = buscar();
if (!base) {
  console.log(`Creando la base "${NOMBRE}"…`);
  wrangler('d1', 'create', NOMBRE);
  base = buscar();
}
if (!base?.uuid) throw new Error(`No encontré la base "${NOMBRE}" después de crearla.`);
console.log(`Base "${NOMBRE}": ${base.uuid}`);

const ruta = join(aqui, 'wrangler.toml');
const toml = readFileSync(ruta, 'utf8').replace(/database_id = "[^"]*"/, `database_id = "${base.uuid}"`);
writeFileSync(ruta, toml);

wrangler('d1', 'execute', NOMBRE, '--remote', '--file', 'esquema.sql', '--yes');
console.log('Esquema aplicado.');

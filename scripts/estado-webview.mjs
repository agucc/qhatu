// Lee el estado de la página dentro de la app (por las herramientas de depuración de la WebView).
// Uso: node scripts/estado-webview.mjs http://localhost:9222 ["js a ejecutar antes de leer"]
const base = process.argv[2] || 'http://localhost:9222';

// Nunca quedarse esperando: si la app no responde en 20 segundos, se avisa y se sigue.
setTimeout(() => {
  console.log('sin respuesta de la página en 20 s');
  process.exit(2);
}, 20000).unref();
const accion = process.argv[3];

async function conectar() {
  const paginas = await (await fetch(`${base}/json`)).json();
  // AdMob abre su propia WebView en la app: se elige la página del juego.
  const delJuego = paginas.filter((p) => p.type === 'page' && p.url.startsWith('https://localhost'));
  const pagina = delJuego[delJuego.length - 1] || paginas.find((p) => p.type === 'page') || paginas[0];
  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok) => ws.addEventListener('open', ok));
  let id = 0;
  const evaluar = (expression) =>
    new Promise((ok) => {
      const mio = ++id;
      const oir = (m) => {
        const r = JSON.parse(m.data);
        if (r.id !== mio) return;
        ws.removeEventListener('message', oir);
        ok(r.result?.result?.value);
      };
      ws.addEventListener('message', oir);
      ws.send(JSON.stringify({ id: mio, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
    });
  return { ws, evaluar };
}

const ESTADO = `JSON.stringify({
  url: location.href,
  listo: !!window.QHATU_LISTO,
  titulo: document.title,
  puestos: document.querySelectorAll('.puesto').length,
  vasos: document.querySelectorAll('.vaso').length,
  canasto: !!document.querySelector('#canasto'),
  celdasTelar: document.querySelectorAll('#telar .celda').length,
  piezas: document.querySelectorAll('.ranura[data-i]').length,
  mejoras: document.querySelectorAll('.mejora').length,
  productos: document.querySelectorAll('.producto').length,
  decoraciones: document.querySelectorAll('.deco').length,
  laminas: document.querySelectorAll('.lamina').length,
  pedido: document.querySelector('#pedido-texto')?.textContent || null,
  colorTexto: getComputedStyle(document.body).color,
  hojas: [...document.styleSheets].map(s => { try { return s.href + ' ' + s.cssRules.length } catch (e) { return s.href + ' bloqueada' } }),
  diagnostico: document.querySelector('pre')?.textContent || null,
  nube: (() => { try { const m = JSON.parse(localStorage.getItem('qhatu.nube') || '{}'); return { cuenta: !!m.llave, version: m.version ?? null, pendiente: !!m.pendiente }; } catch (e) { return null } })()
}, null, 2)`;

let { ws, evaluar } = await conectar();
if (accion) {
  console.log('Acción:', accion);
  await evaluar(accion);
  ws.close();
  await new Promise((ok) => setTimeout(ok, 6000));
  ({ ws, evaluar } = await conectar());
}
console.log(await evaluar(ESTADO));
ws.close();

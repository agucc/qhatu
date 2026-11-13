// Lee el estado de la página dentro de la app (por las herramientas de depuración de la WebView).
// Uso: node scripts/estado-webview.mjs http://localhost:9222
const base = process.argv[2] || 'http://localhost:9222';
const paginas = await (await fetch(`${base}/json`)).json();
const pagina = paginas.find((p) => p.type === 'page') || paginas[0];
console.log('URL:', pagina?.url);
const ws = new WebSocket(pagina.webSocketDebuggerUrl);
await new Promise((ok) => ws.addEventListener('open', ok));
const expr = `JSON.stringify({
  listo: !!window.QHATU_LISTO,
  puestos: document.querySelectorAll('.puesto').length,
  colorTexto: getComputedStyle(document.body).color,
  hojas: [...document.styleSheets].map(s => { try { return s.href + ' ' + s.cssRules.length } catch (e) { return s.href + ' bloqueada' } }),
  diagnostico: document.querySelector('pre')?.textContent || null,
  ua: navigator.userAgent
}, null, 2)`;
ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true } }));
const r = await new Promise((ok) => ws.addEventListener('message', (m) => ok(JSON.parse(m.data))));
console.log(r.result?.result?.value ?? JSON.stringify(r));
ws.close();

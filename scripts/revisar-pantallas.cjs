// Revisión de pantallas (QA-01, QA-02, QA-10): 7 países × 6 pantallas × 3 anchos de celular.
// Uso: npm run dev (en otra terminal) y luego: node scripts/revisar-pantallas.cjs
// Necesita Playwright con Chromium instalado.
const { chromium } = require('playwright');
const PAISES = ['bo', 'pe', 'mx', 'co', 'ar', 'br', 'us'];
const PANTALLAS = ['index.html', 'refresquera/index.html', 'frutera/index.html', 'aguayo/index.html', 'saltenera/index.html', 'tienda/index.html'];
const ANCHOS = [320, 360, 412];
(async () => {
  const b = await chromium.launch();
  const fallas = [];
  let revisadas = 0;
  for (const pais of PAISES) for (const ancho of ANCHOS) {
    const c = await b.newContext({ viewport: { width: ancho, height: 740 }, locale: 'es-BO' });
    await c.addInitScript((pa) => {
      if (sessionStorage.getItem('qa')) return; sessionStorage.setItem('qa', '1');
      const vistos = {}; for (const k of ['tuto-niveles', 'tuto-pedidos', 'tuto-frutera', 'tuto-aguayo', 'tuto-saltenera']) vistos[k] = true;
      localStorage.setItem('qhatu.v1', JSON.stringify({ pais: 'bo', paises: ['bo', pa], paisActual: pa, vistos, yapa: 500, decoracion: { fondo: 'lago', toldo: 'kantuta', vaso: 'redondo', mios: ['fondo:lago', 'toldo:kantuta'] } }));
    }, pais);
    const p = await c.newPage();
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    for (const url of PANTALLAS) {
      await p.goto('http://localhost:8080/' + url);
      await p.waitForFunction(() => window.QHATU_LISTO === true, null, { timeout: 8000 }).catch(() => errores.push('no quedó listo'));
      await p.waitForTimeout(500);
      const r = await p.evaluate((pa) => {
        const malos = [];
        for (const el of document.querySelectorAll('.barra-puesto, h1, h2, h3, .boton, .chip-yapa, .pais-chip')) {
          if (!el.offsetParent) continue;
          const cs = getComputedStyle(el);
          if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') malos.push(`cortado: ${el.className || el.tagName} "${el.textContent.trim().slice(0, 30)}"`);
          if (el.classList.contains('barra-puesto') && el.scrollHeight > el.clientHeight + 2) malos.push(`título cortado: "${el.textContent.trim()}"`);
          const rc = el.getBoundingClientRect();
          if (rc.right > innerWidth + 1 || rc.left < -1) malos.push(`fuera de pantalla: "${el.textContent.trim().slice(0, 30)}"`);
        }
        if (document.documentElement.scrollWidth > innerWidth + 1) malos.push('scroll horizontal');
        // Residuos: fondo de Bolivia (lago) no debe verse fuera de Bolivia
        const noche = getComputedStyle(document.documentElement).getPropertyValue('--noche').trim();
        if (pa !== 'bo' && noche === '#0f1b2d') malos.push('se ve el fondo Lago Titicaca fuera de Bolivia');
        return malos;
      }, pais);
      const datos = await p.evaluate(async (pa) => {
        const { pais } = await import('/shared/paises.js');
        const d = pais(pa);
        const titulo = document.querySelector('.barra-puesto')?.textContent.trim();
        const malos = [];
        if (location.pathname.includes('/aguayo/') && titulo !== d.telar.nombre[0]) malos.push(`telar dice "${titulo}"`);
        if (location.pathname.includes('/saltenera/')) {
          if (titulo !== d.comida.puesto[0]) malos.push(`comida dice "${titulo}"`);
          const m = document.querySelector('#moneda')?.textContent.trim();
          if (m !== d.moneda) malos.push(`moneda "${m}" en vez de "${d.moneda}"`);
        }
        if (location.pathname.endsWith('/index.html') && !location.pathname.includes('/', 1)) {
          const casera = document.querySelector('#casera svg')?.outerHTML || '';
          const { casera: dibujo } = await import('/shared/marca.js');
          const div = document.createElement('div'); div.innerHTML = dibujo(pa);
          if (casera !== div.querySelector('svg').outerHTML) malos.push('La Casera no es la del país');
        }
        return malos;
      }, pais);
      for (const m of datos) fallas.push(`${pais} ${ancho}px ${url}: ${m}`);
      for (const m of r) fallas.push(`${pais} ${ancho}px ${url}: ${m}`);
      revisadas++;
    }
    for (const e of errores) fallas.push(`${pais} ${ancho}px: error ${e}`);
    await c.close();
  }
  console.log(`Pantallas revisadas: ${revisadas}`);
  console.log(fallas.length ? [...new Set(fallas)].join('\n') : 'Sin fallas');
  await b.close();
})();

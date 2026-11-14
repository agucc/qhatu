// La tienda: yapa por ver anuncios, packs de yapa, quitar anuncios y decoración.

import { obtener, guardar, diaLocal, anunciosYapaRestantes, cobrarAnuncioYapa, YAPA_POR_ANUNCIO } from '../shared/almacen.js';
import { t, aplicarTextos, nombreDeco } from '../shared/i18n.js';
import { sonar } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios } from '../shared/anuncios.js';
import { PRODUCTOS, modoCompras, comprar, precio, iniciarCompras, datosCripto, precioCripto, comprarConCripto, sePuedeSimular, yaComprado } from '../shared/compras.js';
import { articulo, comprarArticulo } from '../shared/catalogo.js';
import { texto } from '../shared/paises.js';
import { GRUPOS, aplicarDecoracion, enUso, esMio, usar, disponibles } from '../shared/decoracion.js';
import { chipYapa, contadorYapa, aviso, confeti, escapar, ventana } from '../shared/ui.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { svgVaso, definiciones } from '../refresquera/botella.js';

const $ = (sel) => document.querySelector(sel);

// ---------- Yapa gratis ----------

function pintarGratis() {
  const quedan = anunciosYapaRestantes(obtener(), diaLocal());
  const boton = $('#anuncio-yapa');
  const nota = $('#anuncio-nota');
  boton.textContent = t('verAnuncioYapa', { n: YAPA_POR_ANUNCIO });
  if (!anuncios.hayRecompensa) {
    boton.hidden = true;
    nota.textContent = t('sinAnunciosAqui');
    return;
  }
  boton.hidden = false;
  boton.disabled = quedan <= 0;
  nota.textContent = quedan > 0 ? t('anunciosQuedan', { n: quedan }) : t('anunciosManana');
}

$('#anuncio-yapa').addEventListener('click', async (ev) => {
  const boton = ev.currentTarget;
  boton.disabled = true;
  const vio = await anuncios.verRecompensa();
  if (!vio) {
    aviso(t('anuncioFallo'), { tipo: 'alerta' });
  } else {
    const yapa = cobrarAnuncioYapa(obtener(), diaLocal());
    if (yapa) {
      guardar();
      sonar.yapa();
      aviso(t('masYapa', { n: yapa }), { tipo: 'exito' });
    }
  }
  pintarGratis();
});

// ---------- Compras ----------

const ICONOS_PRODUCTO = {
  temporada: '<svg viewBox="0 0 40 40"><path d="M20 4l4.7 9.6 10.6 1.5-7.7 7.5 1.8 10.5L20 28.1l-9.4 5 1.8-10.5-7.7-7.5 10.6-1.5z" fill="#ffd23f"/></svg>',
  pasaporte: '<svg viewBox="0 0 40 40"><rect x="8" y="4" width="24" height="32" rx="3" fill="#b07a10"/><rect x="11" y="7" width="18" height="26" rx="2" fill="#ffd23f"/><circle cx="20" cy="17" r="5" fill="none" stroke="#b07a10" stroke-width="2"/><path d="M14 27h12" stroke="#b07a10" stroke-width="2"/></svg>',
  xp2: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#1fb5a5"/><path d="M12 24l8-10 8 10M12 30l8-10 8 10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

function textosProducto(p) {
  if (p.tipo === 'yapa') return { titulo: t('packYapa', { n: p.yapa }), detalle: '' };
  if (p.tipo === 'temporada') return { titulo: t('paseTemporada'), detalle: t('paseTemporadaDesc') };
  if (p.tipo === 'pasaporte') return { titulo: t('pasaporteViajero'), detalle: t('pasaporteViajeroDesc', { n: p.pasajes }) };
  if (p.tipo === 'xp2') return { titulo: t('dobleXpSemana'), detalle: t('dobleXpSemanaDesc') };
  return { titulo: t('quitarAnuncios'), detalle: t('quitarAnunciosDesc') };
}

// ---------- Impulsos con yapa ----------

function pintarImpulsos() {
  const e = obtener();
  const quedan = Math.max(0, (e.impulsos?.xp2Hasta || 0) - Date.now());
  $('#impulsos').innerHTML = ['impulso:xp2', 'impulso:pasaje']
    .map((id) => {
      const a = articulo(id);
      const activo = a.pieza === 'xp2' && quedan > 0 ? `<p class="nota">${escapar(t('xpActiva', { h: Math.ceil(quedan / 3600_000) }))}</p>` : '';
      const desc = a.pieza === 'xp2' ? t('dobleXpDesc') : t('pasajeExtraDesc');
      return `<article class="producto"><span class="icono-producto" aria-hidden="true">${a.pieza === 'xp2' ? ICONOS_PRODUCTO.xp2 : ICONOS_PRODUCTO.pasaporte}</span>
        <div class="producto-texto"><h3>${escapar(texto(a.nombre))}</h3><p>${escapar(desc)}</p>${activo}</div>
        <button class="boton" type="button" data-impulso="${id}"><span class="yapa-icono" aria-hidden="true"></span>${a.precio}</button></article>`;
    })
    .join('');
}

$('#impulsos').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-impulso]');
  if (!b) return;
  const r = comprarArticulo(b.dataset.impulso);
  if (r === 'ok') {
    sonar.yapa();
    aviso(t('impulsoListo'), { tipo: 'exito' });
  } else aviso(t('faltaYapa'), { tipo: 'alerta' });
  pintarImpulsos();
});

function pintarProductos() {
  const modo = modoCompras();
  $('#productos').innerHTML = PRODUCTOS.map((p) => {
    const esYapa = p.tipo === 'yapa';
    const comprado = yaComprado(p);
    const { titulo, detalle } = textosProducto(p);
    const dibujo = esYapa
      ? `<span class="pila pila-${Math.min(p.yapa, 1000)}" aria-hidden="true"><i></i><i></i><i></i></span>`
      : p.tipo === 'sin_anuncios'
        ? '<span class="sin-anuncios" aria-hidden="true"></span>'
        : `<span class="icono-producto" aria-hidden="true">${ICONOS_PRODUCTO[p.tipo] || ''}</span>`;
    const conCripto = modo === 'directo' ? precioCripto(p) : null;
    const boton = comprado
      ? `<span class="sello">${escapar(t('comprado'))}</span>`
      : `<button class="boton" type="button" data-producto="${p.id}" ${modo === 'no' ? 'disabled' : ''}>${escapar(conCripto ? `${conCripto} USD` : precio(p))}</button>`;
    return `<article class="producto">${dibujo}<div class="producto-texto"><h3>${escapar(titulo)}</h3>${detalle ? `<p>${escapar(detalle)}</p>` : ''}</div>${boton}</article>`;
  }).join('');
  const c = datosCripto();
  $('#compras-nota').textContent =
    modo === 'directo' ? t('criptoNota', { red: c.nombreRed, tokens: c.tokens.join(', '), n: Math.round(c.descuento * 100) }) : modo === 'prueba' ? t('modoPrueba') : modo === 'no' ? t('comprasPronto') : '';
}

// Pago con cripto: el jugador envía a la billetera y pega el hash de la transacción para verificarlo.
const HASH_GUARDADO = 'qhatu.cripto.hash';

async function pagarConCripto(id) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  const c = datosCripto();
  const monto = precioCripto(producto);
  let anterior = '';
  try {
    anterior = sessionStorage.getItem(`${HASH_GUARDADO}.${id}`) || '';
  } catch {
    /* sin sessionStorage */
  }
  const botones = [{ texto: t('verificarPago'), valor: 'verificar' }];
  if (sePuedeSimular()) botones.push({ texto: t('simularCompra'), valor: 'simular', clase: 'secundario' });
  botones.push({ texto: t('cerrar'), valor: null, clase: 'secundario' });
  const eleccion = await ventana({
    titulo: t('pagarCripto'),
    html: `<div class="cripto">
      <p>${escapar(t('criptoPaso1', { red: c.nombreRed }))}</p>
      <p class="cripto-monto">${escapar(monto)} <small>${escapar(c.tokens.join(' · '))}</small></p>
      <p class="cripto-direccion" id="cripto-direccion">${escapar(c.direccion)}</p>
      <button class="boton secundario" type="button" id="copiar-direccion">${escapar(t('copiarDireccion'))}</button>
      <p class="cripto-aviso">${escapar(t('criptoAviso', { red: c.nombreRed }))}</p>
      <label class="cripto-hash"><span>${escapar(t('criptoPaso2'))}</span>
        <input id="cripto-hash" value="${escapar(anterior)}" placeholder="0x…" autocomplete="off" spellcheck="false"></label>
    </div>`,
    botones,
  });
  const hash = document.getElementById('cripto-hash')?.value.trim() || '';
  if (eleccion === 'simular') return comprar(id, { simular: true });
  if (eleccion !== 'verificar') return false;
  try {
    sessionStorage.setItem(`${HASH_GUARDADO}.${id}`, hash);
  } catch {
    /* sin sessionStorage */
  }
  aviso(t('verificando'));
  const r = await comprarConCripto(id, hash);
  if (r.ok) {
    try {
      sessionStorage.removeItem(`${HASH_GUARDADO}.${id}`);
    } catch {
      /* sin sessionStorage */
    }
    return true;
  }
  aviso(t(`cripto-${r.error}`) === `cripto-${r.error}` ? t('cripto-sin-red') : t(`cripto-${r.error}`), { tipo: 'alerta' });
  return false;
}

document.addEventListener('click', async (ev) => {
  if (!ev.target.closest('#copiar-direccion')) return;
  try {
    await navigator.clipboard.writeText(datosCripto().direccion);
    aviso(t('copiado'), { tipo: 'exito' });
  } catch {
    /* el usuario puede copiarla a mano: está en pantalla */
  }
});

$('#productos').addEventListener('click', async (ev) => {
  const boton = ev.target.closest('[data-producto]');
  if (!boton) return;
  boton.disabled = true;
  const ok = modoCompras() === 'directo' ? await pagarConCripto(boton.dataset.producto) : await comprar(boton.dataset.producto);
  if (ok) {
    sonar.servido();
    confeti();
    aviso(t('gracias'), { tipo: 'exito' });
  }
  pintarProductos();
});

// ---------- Decoración ----------

function muestra(grupo, item) {
  if (grupo === 'fondo') {
    const v = item.vars;
    return `<span class="muestra muestra-fondo" style="background:${v['--noche']}"><i style="background:${v['--puesto']};box-shadow:inset 0 0 0 2px ${v['--borde']}"></i></span>`;
  }
  if (grupo === 'toldo') {
    return `<span class="muestra muestra-toldo">${item.colores.map((c) => `<i style="background:${c}"></i>`).join('')}</span>`;
  }
  const capa = (color) => ({ color, simbolo: '' });
  return `<span class="muestra muestra-vaso">${svgVaso([capa('#9a48b8'), capa('#ffb520'), capa('#ef476f')], { id: 700 + item.precio + item.id.length, forma: item.id, burbujas: false })}</span>`;
}

function pintarDecoracion() {
  for (const grupo of Object.keys(GRUPOS)) {
    $(`#deco-${grupo}`).innerHTML = disponibles(grupo)
      .map((item) => {
        const puesto = enUso(grupo) === item.id;
        const mio = esMio(grupo, item.id);
        let boton;
        if (puesto) boton = `<span class="sello">${escapar(t('enUso'))}</span>`;
        else if (mio) boton = `<button class="boton secundario" type="button" data-grupo="${grupo}" data-id="${item.id}">${escapar(t('usar'))}</button>`;
        else boton = `<button class="boton" type="button" data-grupo="${grupo}" data-id="${item.id}"><span class="yapa-icono" aria-hidden="true"></span>${item.precio}</button>`;
        return `<article class="deco${puesto ? ' puesta' : ''}">${muestra(grupo, item)}<h4>${escapar(nombreDeco(item.id))}</h4>${boton}</article>`;
      })
      .join('');
  }
}

document.querySelector('.tienda-cuerpo').addEventListener('click', (ev) => {
  const boton = ev.target.closest('[data-grupo]');
  if (!boton) return;
  const { grupo, id } = boton.dataset;
  const eraMio = esMio(grupo, id);
  if (!usar(grupo, id)) {
    sonar.no();
    aviso(t('faltaYapa'), { tipo: 'alerta' });
    return;
  }
  if (eraMio) sonar.elegir();
  else {
    sonar.servido();
    confeti();
  }
  pintarDecoracion();
});

// ---------- Arranque ----------

window.QHATU_LISTO = true;
document.body.insertAdjacentHTML('afterbegin', definiciones());
iniciarPlataforma({ esPuesto: true });
aplicarDecoracion();
aplicarTextos();
$('#chip-yapa').innerHTML = chipYapa();
contadorYapa();
pintarGratis();
pintarProductos();
pintarImpulsos();
pintarDecoracion();
document.addEventListener('qhatu:idioma', () => {
  pintarGratis();
  pintarProductos();
  pintarImpulsos();
  pintarDecoracion();
});
iniciarCompras().then(pintarProductos);
iniciarAnuncios().then(() => {
  anuncios.cargaLista();
  pintarGratis();
});

// La tienda: yapa por ver anuncios, packs de yapa, quitar anuncios y decoración.

import { obtener, guardar, diaLocal, anunciosYapaRestantes, cobrarAnuncioYapa, YAPA_POR_ANUNCIO } from '../shared/almacen.js';
import { t, aplicarTextos, nombreDeco } from '../shared/i18n.js';
import { sonar } from '../shared/sonido.js';
import { iniciarAnuncios, anuncios } from '../shared/anuncios.js';
import { PRODUCTOS, modoCompras, comprar, precio, sinAnuncios, iniciarCompras } from '../shared/compras.js';
import { GRUPOS, aplicarDecoracion, enUso, esMio, usar, disponibles } from '../shared/decoracion.js';
import { chipYapa, contadorYapa, aviso, confeti, escapar } from '../shared/ui.js';
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

function pintarProductos() {
  const modo = modoCompras();
  $('#productos').innerHTML = PRODUCTOS.map((p) => {
    const esYapa = p.tipo === 'yapa';
    const yaComprado = !esYapa && sinAnuncios();
    const titulo = esYapa ? t('packYapa', { n: p.yapa }) : t('quitarAnuncios');
    const detalle = esYapa ? '' : `<p>${escapar(t('quitarAnunciosDesc'))}</p>`;
    const dibujo = esYapa
      ? `<span class="pila pila-${p.yapa}" aria-hidden="true"><i></i><i></i><i></i></span>`
      : '<span class="sin-anuncios" aria-hidden="true"></span>';
    const boton = yaComprado
      ? `<span class="sello">${escapar(t('comprado'))}</span>`
      : `<button class="boton" type="button" data-producto="${p.id}" ${modo === 'no' ? 'disabled' : ''}>${escapar(precio(p))}</button>`;
    return `<article class="producto">${dibujo}<div class="producto-texto"><h3>${escapar(titulo)}</h3>${detalle}</div>${boton}</article>`;
  }).join('');
  $('#compras-nota').textContent = modo === 'prueba' ? t('modoPrueba') : modo === 'no' ? t('comprasPronto') : '';
}

$('#productos').addEventListener('click', async (ev) => {
  const boton = ev.target.closest('[data-producto]');
  if (!boton) return;
  boton.disabled = true;
  const ok = await comprar(boton.dataset.producto);
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
pintarDecoracion();
document.addEventListener('qhatu:idioma', () => {
  pintarGratis();
  pintarProductos();
  pintarDecoracion();
});
iniciarCompras().then(pintarProductos);
iniciarAnuncios().then(() => {
  anuncios.cargaLista();
  pintarGratis();
});

// Tu caserito: el personaje del jugador. Se viste con vestimentas de cada país (se desbloquean al
// visitarlo), se personaliza y se elige la portada del pasaporte. Todo se paga con yapa o se gana jugando.

import { obtener, guardar } from '../shared/almacen.js';
import { t, aplicarTextos } from '../shared/i18n.js';
import { sonar } from '../shared/sonido.js';
import { aplicarDecoracion } from '../shared/decoracion.js';
import { chipYapa, contadorYapa, aviso, escapar } from '../shared/ui.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { pais as datosPais, texto } from '../shared/paises.js';
import { avatar, PIELES_AVATAR } from '../shared/marca.js';
import { ARTICULOS, PORTADAS, miAvatar, loTengo, bloqueo, comprarArticulo, ponerse, puesto } from '../shared/catalogo.js';

const $ = (sel) => document.querySelector(sel);
const PESTANAS = ['sombrero', 'prenda', 'peinado', 'accesorio', 'marco', 'portada'];
let pestana = 'sombrero';
const COLORES_CAMISA = ['#2a9d63', '#ef476f', '#9a48b8', '#ffb520', '#3657a8'];

function portada(id, ancho = 64) {
  const [a, b] = PORTADAS[id] || PORTADAS.clasica;
  return `<svg viewBox="0 0 48 64" width="${ancho}" aria-hidden="true"><rect width="48" height="64" rx="5" fill="${a}"/><rect x="4" y="4" width="40" height="56" rx="3" fill="none" stroke="${b}" stroke-width="2"/><circle cx="24" cy="26" r="9" fill="none" stroke="${b}" stroke-width="2.5"/><path d="M15 26h18M24 17q-5 9 0 18q5-9 0-18" stroke="${b}" stroke-width="1.6" fill="none"/><path d="M14 46h20M17 51h14" stroke="${b}" stroke-width="2"/></svg>`;
}

function pintarVista() {
  $('#avatar').innerHTML = avatar(miAvatar(), { id: 'av-grande' });
  const av = miAvatar();
  $('#pieles').innerHTML = PIELES_AVATAR.map((c, i) => `<button type="button" class="muestra-color${av.piel === i ? ' elegida' : ''}" data-piel="${i}" style="background:${c}" aria-label="${escapar(t('piel'))} ${i + 1}"></button>`).join('');
  $('#colores').innerHTML = av.prenda === 'camisa'
    ? COLORES_CAMISA.map((c, i) => `<button type="button" class="muestra-color${av.color === i ? ' elegida' : ''}" data-color="${i}" style="background:${c}" aria-label="${escapar(t('colorCamisa'))} ${i + 1}"></button>`).join('')
    : '';
}

function pintarPestanas() {
  $('#pestanas').innerHTML = PESTANAS.map((p) => `<button type="button" data-pestana="${p}" aria-pressed="${p === pestana}">${escapar(t(`grupo-${p}`))}</button>`).join('');
}

function pintarArmario() {
  const e = obtener();
  const lista = ARTICULOS.filter((a) => a.grupo === pestana);
  $('#perfil-nota').textContent = pestana === 'portada' ? t('portadaDesc') : pestana === 'sombrero' || pestana === 'prenda' ? t('vestimentasDesc') : '';
  $('#armario').innerHTML = lista
    .map((a, n) => {
      const vista = a.grupo === 'portada' ? portada(a.pieza) : avatar({ ...miAvatar(), [a.grupo]: a.pieza }, { id: `av-${n}`, conMarco: a.grupo === 'marco' });
      const tengo = loTengo(a.id, e);
      const b = bloqueo(a.id, e);
      let accion;
      if (puesto(a.id, e)) accion = `<span class="sello">${escapar(t('enUso'))}</span>`;
      else if (tengo) accion = `<button class="boton secundario" type="button" data-poner="${a.id}">${escapar(t('usar'))}</button>`;
      else if (b === 'temporada') accion = `<span class="sello cerrado">${escapar(t('premioTemporada'))}</span>`;
      else if (b === 'pais') accion = `<span class="sello cerrado">${escapar(t('visitaPais', { pais: texto(datosPais(a.pais).nombre) }))}</span>`;
      else accion = `<button class="boton" type="button" data-comprar="${a.id}"><span class="yapa-icono" aria-hidden="true"></span>${a.precio}</button>`;
      const origen = a.pais ? `<small>${escapar(texto(datosPais(a.pais).nombre))}</small>` : '';
      return `<article class="articulo${tengo ? '' : ' ajeno'}"><span class="articulo-vista">${vista}</span><h3>${escapar(texto(a.nombre))}</h3>${origen}${accion}</article>`;
    })
    .join('');
}

function pintarTodo() {
  pintarVista();
  pintarPestanas();
  pintarArmario();
}

document.addEventListener('click', (ev) => {
  const p = ev.target.closest('[data-pestana]');
  if (p) {
    pestana = p.dataset.pestana;
    pintarPestanas();
    pintarArmario();
    return;
  }
  const piel = ev.target.closest('[data-piel]');
  if (piel) {
    miAvatar().piel = Number(piel.dataset.piel);
    guardar();
    pintarTodo();
    return;
  }
  const color = ev.target.closest('[data-color]');
  if (color) {
    miAvatar().color = Number(color.dataset.color);
    guardar();
    pintarTodo();
    return;
  }
  const poner = ev.target.closest('[data-poner]');
  if (poner) {
    ponerse(poner.dataset.poner);
    sonar.elegir?.();
    pintarTodo();
    return;
  }
  const comprar = ev.target.closest('[data-comprar]');
  if (comprar) {
    const r = comprarArticulo(comprar.dataset.comprar);
    if (r === 'ok') {
      ponerse(comprar.dataset.comprar);
      sonar.yapa();
      aviso(t('compradoPuesto'), { tipo: 'exito' });
    } else aviso(t('faltaYapa'), { tipo: 'alerta' });
    pintarTodo();
  }
});

window.QHATU_LISTO = true;
aplicarDecoracion();
iniciarPlataforma({ esPuesto: true });
aplicarTextos();
$('#chip-yapa').innerHTML = chipYapa();
contadorYapa();
pintarTodo();
document.addEventListener('qhatu:idioma', pintarTodo);

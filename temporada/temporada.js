// Temporada: niveles con premios gratis y del pase premium, y los desafíos de la semana.

import { t, aplicarTextos, idioma } from '../shared/i18n.js';
import { sonar } from '../shared/sonido.js';
import { aplicarDecoracion } from '../shared/decoracion.js';
import { chipYapa, contadorYapa, aviso, escapar, confeti } from '../shared/ui.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { texto } from '../shared/paises.js';
import { articulo, miAvatar } from '../shared/catalogo.js';
import { avatar } from '../shared/marca.js';
import { temporadaActual, miTemporada, nivelTemporada, PREMIOS, NIVELES, PUNTOS_NIVEL, reclamar, listaDesafios, cobrarDesafio, nombreTemporada } from '../shared/temporada.js';
import { PRODUCTOS, comprar, iniciarCompras, modoCompras, precio, precioCripto } from '../shared/compras.js';

const $ = (sel) => document.querySelector(sel);

function premioHtml(premio, n) {
  if (premio.yapa) return `<span class="premio-yapa"><span class="yapa-icono" aria-hidden="true"></span>${premio.yapa}</span>`;
  const a = articulo(premio.articulo);
  const vista = a.grupo === 'portada'
    ? '<svg viewBox="0 0 48 64" width="34"><rect width="48" height="64" rx="5" fill="#b07a10"/><rect x="5" y="5" width="38" height="54" rx="3" fill="none" stroke="#ffd23f" stroke-width="3"/></svg>'
    : avatar({ ...miAvatar(), [a.grupo]: a.pieza }, { id: `pr-${n}`, conMarco: a.grupo === 'marco' });
  return `<span class="premio-articulo">${vista}<small>${escapar(texto(a.nombre))}</small></span>`;
}

function pintar() {
  const tmp = temporadaActual();
  if (!tmp) {
    $('#temporada-nombre').textContent = t('sinTemporada');
    return;
  }
  const m = miTemporada();
  const nivel = nivelTemporada(m.puntos);
  const f = (s) => new Date(`${s}T12:00:00`).toLocaleDateString(idioma(), { day: 'numeric', month: 'short' });
  $('#temporada-nombre').textContent = nombreTemporada(tmp);
  $('#temporada-fechas').textContent = `${f(tmp.desde)} – ${f(tmp.hasta)}`;
  $('#temporada-nivel').textContent = t('nivelTemporada', { n: nivel, total: NIVELES });
  const resto = nivel >= NIVELES ? PUNTOS_NIVEL : m.puntos % PUNTOS_NIVEL;
  $('#temporada-barra').style.width = `${Math.round((resto / PUNTOS_NIVEL) * 100)}%`;
  $('#temporada-puntos').textContent = nivel >= NIVELES ? t('temporadaCompleta') : t('puntosTemporada', { n: resto, total: PUNTOS_NIVEL });

  const producto = PRODUCTOS.find((p) => p.id === tmp.producto);
  const modo = modoCompras();
  const etiqueta = modo === 'directo' && precioCripto(producto) ? `${precioCripto(producto)} USD` : precio(producto);
  $('#temporada-pase').innerHTML = m.premium
    ? `<p class="pase-activo">${escapar(t('paseActivo'))}</p>`
    : `<div class="pase-oferta"><p>${escapar(t('paseTemporadaDesc'))}</p><button class="boton" type="button" id="comprar-pase" ${modo === 'no' ? 'disabled' : ''}>${escapar(t('comprarPase'))} · ${escapar(etiqueta)}</button></div>`;

  $('#desafios').innerHTML = listaDesafios()
    .map((d) => {
      const txt = texto(d.texto).replace('{n}', d.meta);
      let accion;
      if (d.bloqueado) accion = `<span class="sello cerrado">${escapar(t('soloPase'))}</span>`;
      else if (d.cobrado) accion = `<span class="sello">${escapar(t('cobrado'))}</span>`;
      else if (d.listo) accion = `<button class="boton" type="button" data-desafio="${d.id}">+${d.puntos}</button>`;
      else accion = `<span class="desafio-puntos">+${d.puntos}</span>`;
      return `<article class="desafio${d.premium ? ' premium' : ''}"><div><h3>${escapar(txt)}</h3>
        <div class="barra-pasaje"><i style="width:${Math.round((d.avance / d.meta) * 100)}%"></i></div>
        <small>${d.avance} / ${d.meta}${d.premium ? ` · ${escapar(t('premium'))}` : ''}</small></div>${accion}</article>`;
    })
    .join('');

  $('#premios').innerHTML = PREMIOS.map((p) => {
    const alcanzado = nivel >= p.nivel;
    const celda = (pista) => {
      const clave = `${pista === 'premium' ? 'p' : 'g'}${p.nivel}`;
      const hecho = m.reclamados.includes(clave);
      const puede = alcanzado && !hecho && (pista === 'gratis' || m.premium);
      const boton = hecho ? `<span class="sello">✓</span>` : puede ? `<button class="boton" type="button" data-reclamar="${p.nivel}" data-pista="${pista}">${escapar(t('reclamar'))}</button>` : '';
      return `<div class="premio ${pista}${hecho ? ' hecho' : ''}${pista === 'premium' && !m.premium ? ' cerrado' : ''}">${premioHtml(p[pista], `${pista}${p.nivel}`)}${boton}</div>`;
    };
    return `<div class="fila-premio${alcanzado ? ' alcanzado' : ''}"><span class="numero-nivel">${p.nivel}</span>${celda('gratis')}${celda('premium')}</div>`;
  }).join('');
}

document.addEventListener('click', async (ev) => {
  const r = ev.target.closest('[data-reclamar]');
  if (r) {
    const premio = reclamar(Number(r.dataset.reclamar), r.dataset.pista);
    if (premio) {
      sonar.yapa();
      aviso(premio.yapa ? t('masYapa', { n: premio.yapa }) : t('premioNuevo', { nombre: texto(articulo(premio.articulo).nombre) }), { tipo: 'exito' });
    }
    pintar();
    return;
  }
  const d = ev.target.closest('[data-desafio]');
  if (d) {
    const puntos = cobrarDesafio(d.dataset.desafio);
    if (puntos) {
      sonar.servido();
      aviso(t('puntosGanados', { n: puntos }), { tipo: 'exito' });
    }
    pintar();
    return;
  }
  if (ev.target.closest('#comprar-pase')) {
    const tmp = temporadaActual();
    // En la APK directa se paga con cripto desde la tienda; aquí la compra de Google Play o la de prueba.
    if (modoCompras() === 'directo') {
      location.href = '../tienda/index.html#t-packs';
      return;
    }
    const ok = await comprar(tmp.producto);
    if (ok) {
      confeti();
      aviso(t('paseActivo'), { tipo: 'exito' });
    }
    pintar();
  }
});

window.QHATU_LISTO = true;
aplicarDecoracion();
iniciarPlataforma({ esPuesto: true });
aplicarTextos();
$('#chip-yapa').innerHTML = chipYapa();
contadorYapa();
pintar();
iniciarCompras().then(pintar);
document.addEventListener('qhatu:idioma', pintar);

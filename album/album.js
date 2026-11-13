// Álbum del Mercado: las láminas de cada país, su dato y el sello del pasaporte.

import { obtener } from '../shared/almacen.js';
import { t, aplicarTextos, idioma } from '../shared/i18n.js';
import { sonar } from '../shared/sonido.js';
import { aplicarDecoracion, enUso } from '../shared/decoracion.js';
import { chipYapa, contadorYapa, ventana, aviso, confeti, escapar } from '../shared/ui.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { PAISES, pais as datosPais, paisActual, paisesAbiertos, bandera, texto } from '../shared/paises.js';
import { casera } from '../shared/marca.js';
import { dibujoTejido } from '../shared/tejidos.js';
import { dibujoFiesta } from '../shared/dibujos-fiesta.js';
import { laminasDe, progresoAlbum, sellado, puedeSellar, preguntasSello, responderSello, LAMINAS_PARA_SELLAR, YAPA_SELLO, PREGUNTAS_SELLO } from '../shared/album.js';
import { botellaReceta } from '../refresquera/recetario.js';
import { definiciones } from '../refresquera/botella.js';
import { dibujarFruta } from '../frutera/frutas.js';
import { svgComida } from '../saltenera/comidas.js';

const $ = (sel) => document.querySelector(sel);
let elegido = paisActual(obtener());

const TIPOS = {
  palabra: ['Palabra', 'Word', 'Palavra'],
  bebida: ['Bebida', 'Drink', 'Bebida'],
  fruta: ['Fruta', 'Fruit', 'Fruta'],
  tejido: ['Tejido', 'Weaving', 'Tecido'],
  comida: ['Comida', 'Food', 'Comida'],
  fiesta: ['Fiesta', 'Festival', 'Festa'],
};

function fruta(f, tam) {
  const c = document.createElement('canvas');
  c.width = c.height = tam * 2;
  const ctx = c.getContext('2d');
  ctx.translate(tam, tam * 1.04);
  dibujarFruta(ctx, f, tam * 0.66);
  return `<img src="${c.toDataURL()}" width="${tam}" height="${tam}" alt="">`;
}

function dibujo(l, n, grande = false) {
  const p = datosPais(elegido);
  switch (l.tipo) {
    case 'palabra':
      return casera(elegido);
    case 'bebida':
      return botellaReceta(l.ref, enUso('vaso'), n + (grande ? 50 : 0));
    case 'fruta':
      return fruta(l.ref, grande ? 140 : 80);
    case 'tejido':
      return dibujoTejido(p.telar.textura, p.telar.paleta.map(([, c]) => c));
    case 'comida':
      return svgComida(p.comida.dibujo);
    default:
      return dibujoFiesta(l.ref);
  }
}

function pintarPaises() {
  const abiertos = paisesAbiertos(obtener());
  $('#paises').innerHTML = PAISES.map((p) => {
    const abierto = abiertos.includes(p.id);
    const { ganadas, total } = progresoAlbum(p.id);
    return `<button type="button" data-pais="${p.id}" aria-pressed="${p.id === elegido}" ${abierto ? '' : 'disabled'}>
      ${bandera(p.id, 22)}<span>${escapar(texto(p.corto || p.nombre))}</span>
      <span class="${sellado(p.id) ? 'sello-mini' : ''}">${sellado(p.id) ? '✓' : `${ganadas}/${total}`}</span>
    </button>`;
  }).join('');
}

function pintarAlbum() {
  const p = datosPais(elegido);
  const laminas = laminasDe(elegido);
  const { ganadas, total } = progresoAlbum(elegido);
  $('#album-pais').textContent = texto(p.nombre);
  $('#album-progreso').textContent = t('laminas', { n: ganadas, total });
  $('#album-barra').style.width = `${Math.round((ganadas / total) * 100)}%`;

  const sello = $('#album-sello');
  if (sellado(elegido)) sello.innerHTML = `<span class="sello-hecho">${escapar(t('sellado'))}<br>${bandera(elegido, 18)}</span>`;
  else if (puedeSellar(elegido)) sello.innerHTML = `<button class="boton" type="button" id="sellar">${escapar(t('sellar'))}</button>`;
  else sello.innerHTML = `<p class="falta">${escapar(t('sellarFalta', { n: LAMINAS_PARA_SELLAR }))}</p>`;

  $('#laminas').innerHTML = laminas.map((l, n) => `
    <button type="button" class="lamina${l.ganada ? ' ganada' : ''}" data-lamina="${n}" aria-label="${escapar(l.ganada ? l.nombre : t('laminaPorGanar'))}">
      <span class="lamina-dibujo">${dibujo(l, n)}</span>
      <span class="tipo">${escapar(texto(TIPOS[l.tipo]))}</span>
      <h3>${escapar(l.ganada ? l.nombre : t('laminaPorGanar'))}</h3>
      ${l.ganada ? '' : `<p>${escapar(l.como)}</p>`}
    </button>`).join('');
}

function pintarTodo() {
  aplicarTextos();
  pintarPaises();
  pintarAlbum();
}

async function verLamina(n) {
  const l = laminasDe(elegido)[n];
  if (!l) return;
  sonar.toque?.();
  await ventana({
    titulo: l.ganada ? l.nombre : t('laminaPorGanar'),
    texto: l.ganada ? l.dato : l.como,
    html: `<div class="lamina-grande${l.ganada ? '' : ' cerrada'}">${l.ganada ? dibujo(l, n, true) : ''}</div>`,
    botones: [{ texto: t('cerrar') }],
  });
}

async function sellar() {
  const pais = elegido;
  const nombre = texto(datosPais(pais).nombre);
  const empezar = await ventana({
    titulo: `${t('sellar')} · ${nombre}`,
    texto: t('sellarTexto', { n: YAPA_SELLO }),
    conCasera: true,
    botones: [
      { texto: t('sellar'), valor: 'si' },
      { texto: t('cerrar'), valor: null, clase: 'secundario' },
    ],
  });
  if (empezar !== 'si') return;
  const preguntas = preguntasSello(pais);
  const respuestas = [];
  for (const [i, q] of preguntas.entries()) {
    const r = await ventana({
      titulo: t('preguntaTitulo', { i: i + 1, total: PREGUNTAS_SELLO }),
      texto: `${t('preguntaTexto')} “${q.dato}”`,
      cerrable: false,
      botones: q.opciones.map((o, k) => ({ texto: o, valor: k, clase: 'secundario' })),
    });
    respuestas.push(r);
    if (r === q.correcta) sonar.servido?.();
  }
  const { aciertos, sellado: ok } = responderSello(pais, preguntas, respuestas);
  if (ok) {
    confeti();
    aviso(t('selloGanado', { pais: nombre, n: YAPA_SELLO }), { tipo: 'exito' });
  } else {
    await ventana({ titulo: t('sellar'), texto: t('selloCasi', { n: aciertos, total: PREGUNTAS_SELLO }), conCasera: true, botones: [{ texto: t('entendido') }] });
  }
  pintarTodo();
}

document.addEventListener('click', (ev) => {
  const p = ev.target.closest('[data-pais]');
  if (p && !p.disabled) {
    elegido = p.dataset.pais;
    pintarTodo();
    return;
  }
  const l = ev.target.closest('[data-lamina]');
  if (l) {
    verLamina(Number(l.dataset.lamina));
    return;
  }
  if (ev.target.closest('#sellar')) sellar();
});

window.QHATU_LISTO = true;
document.documentElement.lang = idioma();
aplicarDecoracion();
iniciarPlataforma({ esPuesto: true });
document.body.insertAdjacentHTML('afterbegin', definiciones());
$('#chip-yapa').innerHTML = chipYapa();
contadorYapa();
pintarTodo();
// aplicarTextos() avisa 'qhatu:idioma': aquí solo se vuelve a dibujar, sin aplicar textos otra vez.
document.addEventListener('qhatu:idioma', () => {
  pintarPaises();
  pintarAlbum();
});

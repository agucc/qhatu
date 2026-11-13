// Jugar con amigos: crear una sala, entrar con código y esperar al anfitrión.

import { obtener } from '../shared/almacen.js';
import { t, aplicarTextos } from '../shared/i18n.js';
import { aplicarDecoracion } from '../shared/decoracion.js';
import { chipYapa, contadorYapa, aviso, escapar } from '../shared/ui.js';
import { iniciarPlataforma } from '../shared/plataforma.js';
import { pais as datosPais, paisActual, bandera, texto } from '../shared/paises.js';
import { compartir } from '../shared/compartir.js';
import { dibujoTejido } from '../shared/tejidos.js';
import { svgComida } from '../saltenera/comidas.js';
import { salasActivas, miJugador, guardarNombre, crearSala, conectarSala, PAGINA } from '../shared/sala.js';
import { SEGUNDOS } from '../shared/reloj.js';

const $ = (sel) => document.querySelector(sel);
const PAIS = datosPais(paisActual(obtener()));
let conexion = null;
let sala = null;

function nombrePuesto(id) {
  if (id === 'aguayo') return texto(PAIS.telar.nombre);
  if (id === 'saltenera') return texto(PAIS.comida.puesto);
  return t(id);
}

const DIBUJOS = {
  refresquera: () => '<svg viewBox="0 0 60 60"><rect x="24" y="6" width="12" height="8" rx="2" fill="#17131f"/><path d="M24 14h12v6q8 5 8 14v16a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5V34q0-9 8-14z" fill="#fff" fill-opacity=".9"/><path d="M16 38h28v12a5 5 0 0 1-5 5H21a5 5 0 0 1-5-5z" fill="#9a48b8"/><path d="M16 30h28v8H16z" fill="#ef476f"/></svg>',
  frutera: () => '<svg viewBox="0 0 60 60"><circle cx="30" cy="34" r="20" fill="#ef476f"/><path d="M30 14q2-8 9-10" stroke="#3d6b4f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M32 14q10-6 15 0q-8 3-15 0" fill="#a6d63a"/><circle cx="22" cy="27" r="5" fill="#fff" opacity=".45"/></svg>',
  aguayo: () => dibujoTejido(PAIS.telar.textura, PAIS.telar.paleta.map(([, c]) => c)),
  saltenera: () => svgComida(PAIS.comida.dibujo),
};

function pintarPuestos() {
  $('#puestos-sala').innerHTML = Object.keys(PAGINA)
    .map((id) => `<button type="button" class="puesto-sala" data-crear="${id}">${DIBUJOS[id]()}<span>${escapar(nombrePuesto(id))}</span><small>${SEGUNDOS[id]} s</small></button>`)
    .join('');
}

function pintarEspera() {
  if (!sala) return;
  const yo = miJugador().id;
  $('#codigo-grande').textContent = sala.codigo;
  $('#sala-puesto').textContent = `${nombrePuesto(sala.puesto)} · ${t('contrarreloj')} ${sala.segundos} s`;
  $('#jugadores').innerHTML = sala.jugadores
    .filter((j) => j.conectado)
    .map((j) => `<li class="${j.id === yo ? 'yo' : ''}">${bandera(j.pais, 20)}<span>${escapar(j.nombre)}</span>${j.id === sala.anfitrion ? `<small>${escapar(t('anfitrion'))}</small>` : ''}</li>`)
    .join('');
  const soyAnfitrion = sala.anfitrion === yo;
  const conectados = sala.jugadores.filter((j) => j.conectado).length;
  $('#empezar').hidden = !soyAnfitrion;
  $('#empezar').disabled = conectados < 2 || sala.estado !== 'esperando';
  $('#sala-estado').textContent = conectados < 2 ? t('salaFaltan') : soyAnfitrion ? '' : t('salaEsperaAnfitrion');
}

function mostrar(espera) {
  $('#inicio').hidden = espera;
  $('#espera').hidden = !espera;
}

function entrar(codigo) {
  conexion?.cerrar();
  mostrar(true);
  $('#codigo-grande').textContent = codigo;
  conexion = conectarSala(codigo, {
    alEstado: (s) => {
      sala = s;
      if (s.estado === 'jugando') {
        conexion.cerrar();
        location.href = `../${PAGINA[s.puesto]}/index.html?sala=${s.codigo}`;
        return;
      }
      pintarEspera();
    },
    alError: (motivo) => {
      const clave = `salaError-${motivo}`;
      aviso(t(clave) === clave ? t('sinRed') : t(clave), { tipo: 'alerta' });
      sala = null;
      mostrar(false);
      history.replaceState(null, '', 'index.html');
    },
  });
  history.replaceState(null, '', `index.html?codigo=${codigo}`);
}

$('#puestos-sala').addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-crear]');
  if (!b) return;
  guardarNombre($('#nombre').value);
  b.disabled = true;
  try {
    entrar(await crearSala(b.dataset.crear));
  } catch (e) {
    aviso(t(e.message === 'espera' ? 'salaError-espera' : 'sinRed'), { tipo: 'alerta' });
  } finally {
    b.disabled = false;
  }
});

$('#unirse').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const codigo = $('#codigo').value.toUpperCase().replace(/[^0-9A-Z]/g, '');
  if (codigo.length !== 4) {
    aviso(t('salaError-no-existe'), { tipo: 'alerta' });
    return;
  }
  guardarNombre($('#nombre').value);
  entrar(codigo);
});

$('#nombre').addEventListener('change', () => guardarNombre($('#nombre').value));
$('#empezar').addEventListener('click', () => conexion?.enviar({ tipo: 'empezar' }));
$('#salir').addEventListener('click', () => {
  conexion?.cerrar();
  conexion = null;
  sala = null;
  mostrar(false);
  history.replaceState(null, '', 'index.html');
});
$('#compartir').addEventListener('click', async () => {
  if (!sala) return;
  const r = await compartir(t('salaInvita', { codigo: sala.codigo }));
  if (r === 'copiado') aviso(t('copiado'), { tipo: 'exito' });
});

window.QHATU_LISTO = true;
aplicarDecoracion();
iniciarPlataforma({ esPuesto: true });
aplicarTextos();
$('#chip-yapa').innerHTML = chipYapa();
contadorYapa();
$('#nombre').value = miJugador().nombre;
$('#nombre').placeholder = t('tuNombre');
pintarPuestos();
document.addEventListener('qhatu:idioma', () => {
  pintarPuestos();
  pintarEspera();
});

if (!salasActivas) {
  $('#sin-red').hidden = false;
  $('#inicio').hidden = true;
} else {
  const codigo = new URLSearchParams(location.search).get('codigo');
  if (codigo && /^[0-9A-Za-z]{4}$/.test(codigo)) entrar(codigo.toUpperCase());
}

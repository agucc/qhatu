// Salas en vivo para jugar con amigos (servidor: nube/src/sala.js).
// Todos juegan el mismo contrarreloj al mismo tiempo, con la misma semilla, y ven los puntajes en vivo.

import { NUBE_URL } from './compilacion.js';
import { EN_PORTAL } from './config.js';
import { obtener, sumarYapa, guardar } from './almacen.js';
import { paisActual, bandera } from './paises.js';
import { t } from './i18n.js';
import { ventana, confeti, aviso, escapar, el } from './ui.js';
import { sonar } from './sonido.js';
import { registrar } from './temporada.js';
import { avatar, codigoAvatar, leerCodigoAvatar } from './marca.js';
import { miAvatar } from './catalogo.js';

export const salasActivas = Boolean(NUBE_URL) && !EN_PORTAL;
export const YAPA_GANADOR = 15;
export const YAPA_JUGAR = 5;

/** Página de cada puesto (la carpeta del telar es aguayo/ y la de la comida, saltenera/). */
export const PAGINA = { refresquera: 'refresquera', frutera: 'frutera', aguayo: 'aguayo', saltenera: 'saltenera' };

const base = () => NUBE_URL.replace(/\/+$/, '');

// ---------- Quién soy ----------

export function miJugador() {
  let id = null;
  let nombre = '';
  try {
    id = localStorage.getItem('qhatu.jugador');
    nombre = localStorage.getItem('qhatu.nombre') || '';
    if (!id) {
      id = `j-${crypto.randomUUID()}`;
      localStorage.setItem('qhatu.jugador', id);
    }
  } catch {
    id ||= `j-${Math.random().toString(36).slice(2, 12)}`;
  }
  return { id, nombre };
}

export function guardarNombre(nombre) {
  try {
    localStorage.setItem('qhatu.nombre', String(nombre || '').slice(0, 16));
  } catch {
    /* sin guardado */
  }
}

/** Generador con semilla (el mismo de La Refresquera): igual secuencia para todos los de la sala. */
export function azar(semilla) {
  let a = semilla >>> 0 || 1;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function codigoDeUrl() {
  try {
    const c = new URLSearchParams(location.search).get('sala');
    return c && /^[0-9A-Za-z]{4}$/.test(c) ? c.toUpperCase() : null;
  } catch {
    return null;
  }
}

// ---------- Servidor ----------

export async function crearSala(puesto) {
  const r = await fetch(`${base()}/v1/salas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ puesto }) });
  if (r.status !== 201) throw new Error(r.status === 429 ? 'espera' : 'sin-red');
  return (await r.json()).codigo;
}

/**
 * Conecta a una sala. `alEstado(sala)` con cada cambio; `alError(motivo)` si no se puede entrar.
 * Si se corta la conexión, reintenta unas veces.
 */
export function conectarSala(codigo, { alEstado, alError = () => {} }) {
  const yo = miJugador();
  let ws = null;
  let cerrada = false;
  let intentos = 0;
  let desfase = 0; // hora del servidor menos la del celular
  const conexion = {
    yo: yo.id,
    get desfase() {
      return desfase;
    },
    ahora: () => Date.now() + desfase,
    enviar(m) {
      if (ws?.readyState === 1) ws.send(JSON.stringify(m));
    },
    cerrar() {
      cerrada = true;
      ws?.close();
    },
  };
  function abrir() {
    const q = new URLSearchParams({ jugador: yo.id, nombre: yo.nombre || '', pais: paisActual(obtener()), avatar: codigoAvatar(miAvatar()) });
    ws = new WebSocket(`${base().replace(/^http/, 'ws')}/v1/salas/${codigo}/ws?${q}`);
    ws.onmessage = (e) => {
      let m;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      if (m.tipo === 'error') {
        cerrada = true;
        alError(m.motivo);
      } else if (m.tipo === 'sala') {
        intentos = 0;
        desfase = m.sala.ahora - Date.now();
        alEstado(m.sala);
      }
    };
    ws.onclose = () => {
      if (cerrada) return;
      if (++intentos > 6) {
        alError('sin-red');
        return;
      }
      setTimeout(abrir, 1200 * intentos);
    };
  }
  abrir();
  return conexion;
}

// ---------- Piezas de pantalla ----------

const MEDALLAS = ['🥇', '🥈', '🥉', '4'];

/** Marcador en vivo (debajo de la barra del reloj). */
export function montarMarcador() {
  let m = document.getElementById('marcador');
  if (m) return m;
  m = el('<ol class="marcador" id="marcador" aria-live="polite"></ol>');
  (document.getElementById('reloj') || document.querySelector('.barra')).insertAdjacentElement('afterend', m);
  return m;
}

export function pintarMarcador(m, sala, yo) {
  const lista = [...sala.jugadores].sort((a, b) => b.puntos - a.puntos);
  m.innerHTML = lista
    .map((j) => `<li class="${j.id === yo ? 'yo' : ''}${j.conectado ? '' : ' fuera'}">${bandera(j.pais, 14)}<span>${escapar(j.nombre)}</span><b>${j.puntos}</b></li>`)
    .join('');
}

/** Cuenta regresiva grande en pantalla hasta `hasta` (hora del celular). */
export function cuentaRegresiva(hasta) {
  return new Promise((listo) => {
    const capa = el('<div class="cuenta-sala" aria-live="assertive"><span></span></div>');
    document.body.appendChild(capa);
    const num = capa.querySelector('span');
    let ultimo = null;
    (function paso() {
      const falta = hasta - Date.now();
      const n = Math.ceil(falta / 1000);
      if (falta <= 0) {
        num.textContent = t('ya');
        sonar.servido?.();
        setTimeout(() => capa.remove(), 500);
        listo();
        return;
      }
      if (n !== ultimo) {
        ultimo = n;
        num.textContent = String(n);
        num.classList.remove('late');
        void num.offsetWidth;
        num.classList.add('late');
        sonar.elegir?.();
      }
      requestAnimationFrame(paso);
    })();
  });
}

/** Ventana con el ranking final. Da la yapa y devuelve 'sala' o 'mercado'. */
export async function resultadoSala(sala, yo) {
  const r = sala.ranking || [];
  const mio = r.findIndex((x) => x.id === yo);
  const gane = mio === 0 && r.length > 1 && r[0].puntos > (r[1]?.puntos ?? -1);
  const yapa = gane ? YAPA_GANADOR : (r[mio]?.puntos || 0) > 0 ? YAPA_JUGAR : 0;
  registrar('sala');
  registrar('contrarreloj');
  if (yapa) sumarYapa(yapa);
  else guardar();
  if (gane) confeti();
  const filas = r
    .map((x, i) => `<li class="${x.id === yo ? 'yo' : ''}"><span class="puesto-num">${MEDALLAS[i] || i + 1}</span><span class="cara-sala">${avatar(leerCodigoAvatar(x.avatar), { id: `rk-${i}`, conMarco: false })}</span>${bandera(x.pais, 16)}<span>${escapar(x.nombre)}</span><b>${x.puntos}</b></li>`)
    .join('');
  return ventana({
    titulo: gane ? t('salaGanaste') : t('salaResultado'),
    texto: yapa ? t('masYapa', { n: yapa }) : '',
    html: `<ol class="ranking-sala">${filas}</ol>`,
    conCasera: gane,
    cerrable: false,
    botones: [
      { texto: t('volverSala'), valor: 'sala' },
      { texto: t('volverMercado'), valor: 'mercado', clase: 'secundario' },
    ],
  });
}

/**
 * Juega una ronda de sala dentro de un puesto. El puesto da:
 *  - empezarRonda(segundosQueQuedan, semilla): arranca su contrarreloj con esa semilla
 *  - puntos(): lo que lleva
 * Devuelve { terminar(puntos) } para avisar cuando se le acabó el tiempo (o se trabó).
 */
export function jugarEnSala({ codigo, empezarRonda, puntos }) {
  const marcador = montarMarcador();
  let ronda = null;
  let enviado = -1;
  let terminado = false;
  let mostrado = false;
  const conexion = conectarSala(codigo, {
    alEstado: async (sala) => {
      pintarMarcador(marcador, sala, conexion.yo);
      if (sala.estado === 'jugando' && ronda !== sala.ronda) {
        ronda = sala.ronda;
        terminado = false;
        mostrado = false;
        const inicioLocal = sala.inicio - conexion.desfase;
        await cuentaRegresiva(inicioLocal);
        const queda = Math.max(1, (inicioLocal + sala.segundos * 1000 - Date.now()) / 1000);
        empezarRonda(queda, sala.semilla);
      } else if (sala.estado === 'terminada' && !mostrado && ronda === sala.ronda) {
        mostrado = true;
        const eleccion = await resultadoSala(sala, conexion.yo);
        conexion.cerrar();
        location.href = eleccion === 'mercado' ? '../index.html' : `../salas/index.html?codigo=${codigo}`;
      } else if (sala.estado === 'esperando' && ronda !== null) {
        // El anfitrión pidió otra ronda: todos vuelven a la sala de espera.
        conexion.cerrar();
        location.href = `../salas/index.html?codigo=${codigo}`;
      }
    },
    alError: (motivo) => {
      aviso(t(`salaError-${motivo}`) === `salaError-${motivo}` ? t('sinRed') : t(`salaError-${motivo}`), { tipo: 'alerta' });
      setTimeout(() => {
        location.href = '../salas/index.html';
      }, 1800);
    },
  });
  // Puntajes en vivo, como mucho uno por segundo.
  const cada = setInterval(() => {
    if (ronda === null || terminado) return;
    const n = puntos();
    if (n !== enviado) {
      enviado = n;
      conexion.enviar({ tipo: 'puntos', n });
    }
  }, 1000);
  return {
    terminar(n) {
      if (terminado) return;
      terminado = true;
      clearInterval(cada);
      conexion.enviar({ tipo: 'fin', n });
      aviso(t('salaEsperando'));
    },
  };
}

// Pruebas de las reglas de las salas en vivo (nube/src/sala-logica.js) y del azar compartido.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../nube/src/sala-logica.js';
import { azar } from '../shared/sala.js';

const T0 = 1_000_000;

function salaCon(n) {
  const sala = S.nuevaSala('K7MQ', 'frutera', T0);
  for (let i = 0; i < n; i++) assert.equal(S.unirse(sala, `jugador-${i}aaaaaa`, `J${i}`, 'bo', T0), null);
  return sala;
}

test('códigos de sala: cuatro letras sin confusiones, escritos a mano', () => {
  const c = S.nuevoCodigo();
  assert.match(c, /^[2-9A-HJ-NP-Z]{4}$/);
  assert.equal(S.normalizarCodigo(' k7mq '), 'K7MQ');
  assert.equal(S.normalizarCodigo('K7M'), null);
  assert.equal(S.normalizarCodigo('OIOI'), null);
});

test('una sala: el primero es anfitrión, máximo 4, nombres limpios', () => {
  const sala = salaCon(4);
  assert.equal(sala.anfitrion, 'jugador-0aaaaaa');
  assert.equal(S.unirse(sala, 'jugador-9zzzzzz', 'Otro', 'pe', T0), 'llena');
  assert.equal(S.limpiarNombre('  <b>Ana</b>   la   grande que tiene un nombre largo '), 'bAna/b la grande');
  assert.equal(S.limpiarNombre(''), 'Caserito');
  assert.equal(S.nuevaSala('X', 'no-existe', T0), null);
});

test('solo el anfitrión empieza, con al menos dos jugadores, y nadie entra después', () => {
  const uno = salaCon(1);
  assert.equal(S.empezar(uno, 'jugador-0aaaaaa', T0, 7), 'faltan');
  const sala = salaCon(2);
  assert.equal(S.empezar(sala, 'jugador-1aaaaaa', T0, 7), 'no-anfitrion');
  assert.equal(S.empezar(sala, 'jugador-0aaaaaa', T0, 7), null);
  assert.equal(sala.estado, 'jugando');
  assert.equal(sala.inicio, T0 + S.CUENTA_MS);
  assert.equal(S.unirse(sala, 'jugador-5xxxxxx', 'Tarde', 'bo', T0), 'empezada');
  // Quien ya estaba puede volver (al pasar de la sala de espera al puesto)
  S.salir(sala, 'jugador-1aaaaaa');
  assert.equal(S.unirse(sala, 'jugador-1aaaaaa', '', 'bo', T0), null);
});

test('puntajes: solo suben, solo durante la ronda, y la ronda cierra cuando todos terminan', () => {
  const sala = salaCon(2);
  S.empezar(sala, 'jugador-0aaaaaa', T0, 7);
  const durante = sala.inicio + 1000;
  assert.equal(S.anotar(sala, 'jugador-0aaaaaa', 30, T0 - 5000), false, 'antes de la cuenta regresiva');
  assert.equal(S.anotar(sala, 'jugador-0aaaaaa', 30, durante), true);
  S.anotar(sala, 'jugador-0aaaaaa', 10, durante);
  assert.equal(sala.jugadores['jugador-0aaaaaa'].puntos, 30, 'no baja');
  assert.equal(S.anotar(sala, 'jugador-1aaaaaa', 9e9, durante), true);
  assert.equal(sala.jugadores['jugador-1aaaaaa'].puntos, S.MAX_PUNTOS, 'con tope');
  assert.equal(S.anotar(sala, 'jugador-0aaaaaa', 99, S.finDeRonda(sala) + S.GRACIA_MS + 1), false, 'muy tarde');
  assert.equal(S.terminarJugador(sala, 'jugador-0aaaaaa', 40, durante), false);
  assert.equal(S.terminarJugador(sala, 'jugador-1aaaaaa', 20, durante), true);
  assert.equal(S.cerrarRonda(sala), true);
  assert.deepEqual(S.ranking(sala).map((r) => r.id), ['jugador-1aaaaaa', 'jugador-0aaaaaa']);
});

test('si un jugador se va durante la ronda, cuentan los que quedan', () => {
  const sala = salaCon(3);
  S.empezar(sala, 'jugador-0aaaaaa', T0, 7);
  S.terminarJugador(sala, 'jugador-0aaaaaa', 5, sala.inicio + 10);
  S.terminarJugador(sala, 'jugador-1aaaaaa', 6, sala.inicio + 10);
  assert.equal(S.todosTerminaron(sala), false);
  S.salir(sala, 'jugador-2aaaaaa');
  assert.equal(S.todosTerminaron(sala), true);
});

test('otra ronda: vuelve a la espera, se van los desconectados y el anfitrión sigue', () => {
  const sala = salaCon(3);
  S.empezar(sala, 'jugador-0aaaaaa', T0, 7);
  S.salir(sala, 'jugador-2aaaaaa');
  S.cerrarRonda(sala);
  assert.equal(S.otraRonda(sala, 'jugador-1aaaaaa'), 'no-anfitrion');
  assert.equal(S.otraRonda(sala, 'jugador-0aaaaaa'), null);
  assert.equal(sala.estado, 'esperando');
  assert.deepEqual(sala.orden, ['jugador-0aaaaaa', 'jugador-1aaaaaa']);
  // El creador recupera el papel de anfitrión al volver
  S.salir(sala, 'jugador-0aaaaaa');
  assert.equal(sala.anfitrion, 'jugador-1aaaaaa');
  S.unirse(sala, 'jugador-0aaaaaa', 'J0', 'bo', T0);
  assert.equal(sala.anfitrion, 'jugador-0aaaaaa');
});

test('la sala vence a las 3 horas', () => {
  const sala = salaCon(1);
  assert.equal(S.unirse(sala, 'jugador-8yyyyyy', 'X', 'bo', T0 + S.VIDA_MS + 1), 'vencida');
});

test('misma semilla, misma secuencia de piezas para todos', () => {
  const a = azar(12345);
  const b = azar(12345);
  const sa = Array.from({ length: 20 }, a);
  assert.deepEqual(sa, Array.from({ length: 20 }, b));
  assert.notDeepEqual(sa, Array.from({ length: 20 }, azar(54321)));
  assert.ok(sa.every((x) => x >= 0 && x < 1));
});

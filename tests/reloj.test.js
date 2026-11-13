// Pruebas del contrarreloj (la parte que no depende de la pantalla).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { yapaReloj, SEGUNDOS, YAPA_TOPE, YAPA_RECORD } from '../shared/reloj.js';
import { PAISES } from '../shared/paises.js';

test('cada puesto tiene su tiempo de contrarreloj', () => {
  assert.deepEqual(Object.keys(SEGUNDOS).sort(), ['aguayo', 'frutera', 'refresquera', 'saltenera']);
  for (const s of Object.values(SEGUNDOS)) assert.ok(s >= 20 && s <= 120);
});

test('la yapa del contrarreloj: nada sin jugar, crece con lo hecho, con tope y extra por récord', () => {
  assert.equal(yapaReloj(0, 20, false), 0);
  assert.equal(yapaReloj(5, 20, false), 1);
  assert.equal(yapaReloj(200, 20, false), 10);
  assert.equal(yapaReloj(100000, 20, false), YAPA_TOPE);
  assert.equal(yapaReloj(200, 20, true), 10 + YAPA_RECORD);
  assert.equal(yapaReloj(4, 0.5, false), 8); // La Refresquera: 2 por tanda
});

test('hay textos del contrarreloj en los tres idiomas', async () => {
  const { t } = await import('../shared/i18n.js');
  const { obtener } = await import('../shared/almacen.js');
  for (const idioma of ['es', 'en', 'pt']) {
    obtener().idioma = idioma;
    for (const clave of ['contrarreloj', 'contrarrelojDesc', 'tiempo', 'relojResultado', 'modoNormal', 'relojQueRefresquera', 'relojQueFrutera', 'relojQueTelar', 'relojQueComida', 'relojTandas', 'relojPuntos', 'relojTanda', 'empezarReloj', 'relojRecord']) {
      assert.notEqual(t(clave), clave, `${idioma}: falta ${clave}`);
    }
  }
  obtener().idioma = 'es';
  assert.ok(PAISES.length);
});

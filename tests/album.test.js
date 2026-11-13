// Pruebas del Álbum del Mercado, el sello del pasaporte, las fiestas y los caseritos con nombre.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../shared/album.js';
import { FRUTAS_ALBUM, COMIDA_ALBUM, TEJIDO_ALBUM, PALABRA_ALBUM, FIESTAS, CASERITOS } from '../shared/cultura.js';
import { PAISES, pais as datosPais } from '../shared/paises.js';
import { BEBIDAS } from '../refresquera/bebidas.js';
import { frutasDe } from '../frutera/frutas.js';
import { obtener } from '../shared/almacen.js';

const IDS = PAISES.map((p) => p.id);
const fijo = (valores) => {
  let i = 0;
  return () => valores[i++ % valores.length];
};

test('cada país tiene su contenido completo y en tres idiomas', () => {
  for (const id of IDS) {
    for (const trio of [COMIDA_ALBUM[id], TEJIDO_ALBUM[id], PALABRA_ALBUM[id].nombre, PALABRA_ALBUM[id].dato, FIESTAS[id].nombre, FIESTAS[id].dato]) {
      assert.equal(trio.length, 3, id);
      assert.ok(trio.every((x) => typeof x === 'string' && x.length > 1), id);
    }
    assert.equal(Object.keys(FRUTAS_ALBUM[id]).length, 3, `${id}: tres frutas en el álbum`);
    const frutas = frutasDe(id).map((f) => f.id);
    for (const f of Object.keys(FRUTAS_ALBUM[id])) assert.ok(frutas.includes(f), `${id}: fruta ${f} no existe`);
  }
});

test('las láminas: palabra, bebidas, tres frutas, tejido, comida y fiesta', () => {
  const estado = { puestos: {} };
  for (const id of IDS) {
    const l = A.laminasDe(id, estado);
    const bebidas = l.filter((x) => x.tipo === 'bebida').length;
    assert.equal(l.length, 1 + bebidas + 3 + 1 + 1 + 1, id);
    assert.equal(new Set(l.map((x) => x.id)).size, l.length, `${id}: ids únicos`);
    assert.ok(l.every((x) => x.nombre && x.dato && x.como), id);
    assert.equal(A.progresoAlbum(id, estado).ganadas, 0);
  }
  assert.equal(A.laminasDe('bo', estado).length, 19); // Bolivia suma las 4 bebidas extra del recetario
});

test('las bebidas del álbum salen del recetario: se ganan con los niveles del país', () => {
  const estado = { puestos: { refresquera: { nivel: 1, nivelesPais: { pe: 3 } } } };
  const ganadas = A.laminasDe('pe', estado).filter((l) => l.tipo === 'bebida' && l.ganada);
  assert.equal(ganadas.length, 3); // umbrales 1, 2 y 3
});

test('fiestas: semana de la fiesta y Thanksgiving el cuarto jueves de noviembre', () => {
  const [ini, fin] = A.diasFiesta(FIESTAS.us, 2026);
  assert.equal(ini.getDate(), 23);
  assert.equal(fin.getDate(), 29);
  assert.equal(new Date(2026, 10, 26).getDay(), 4); // jueves
  assert.equal(A.fiestaActiva('us', new Date(2026, 10, 26))?.id, 'thanksgiving');
  assert.equal(A.fiestaActiva('us', new Date(2026, 10, 13)), null);
  assert.equal(A.diasFiesta(FIESTAS.us, 2027)[0].getDate() + 3, 25); // 2027: jueves 25
  assert.equal(A.fiestaActiva('bo', new Date(2027, 0, 24))?.id, 'alasitas');
  assert.equal(A.fiestaActiva('ar', new Date(2026, 10, 10))?.id, 'tradicion');
  assert.equal(A.fiestaActiva('mx', new Date(2026, 10, 2))?.id, 'muertos');
  assert.equal(A.fiestaActiva('pe', new Date(2026, 5, 24))?.id, 'intiraymi');
  assert.equal(A.fiestaActiva('br', new Date(2026, 5, 15))?.id, 'junina');
  assert.equal(A.fiestaActiva('co', new Date(2026, 7, 7))?.id, 'flores');
});

test('ganar láminas jugando: frutas, franjas del telar, cocinar y visitar', () => {
  const e = obtener();
  e.album = undefined;
  const yapa = e.yapa;
  assert.match(A.anotarFruta('bo', 'achachairu'), /achachairú/i);
  assert.equal(A.anotarFruta('bo', 'achachairu'), null, 'no se gana dos veces');
  assert.equal(A.anotarFruta('bo', 'papaya'), null, 'papaya no es lámina de Bolivia');
  assert.equal(e.yapa, yapa + A.YAPA_LAMINA);
  assert.equal(A.anotarFranjas('pe', A.FRANJAS_TEJIDO - 1), null);
  assert.ok(A.anotarFranjas('pe', 1));
  for (let i = 1; i < A.COCINAR_COMIDA; i++) assert.equal(A.anotarCocina('mx'), null);
  assert.ok(A.anotarCocina('mx'));
  assert.ok(A.visitarPais('co'));
  assert.equal(A.jugarEnFiesta('us', new Date(2026, 10, 13)), null);
  assert.ok(A.jugarEnFiesta('us', new Date(2026, 10, 27)));
});

test('sello del pasaporte: tres preguntas sobre láminas ganadas; sella solo con las tres bien', () => {
  const e = obtener();
  e.album = { ganadas: {}, cuenta: {}, sellos: {} };
  for (const id of ['bo:palabra', 'bo:fruta:achachairu', 'bo:fruta:durazno', 'bo:fruta:chirimoya', 'bo:tejido']) e.album.ganadas[id] = true;
  assert.equal(A.puedeSellar('bo'), false, 'con 5 láminas todavía no');
  e.album.ganadas['bo:comida'] = true;
  assert.equal(A.puedeSellar('bo'), true);

  const preguntas = A.preguntasSello('bo', fijo([0.3, 0.7, 0.1, 0.9, 0.5]));
  assert.equal(preguntas.length, A.PREGUNTAS_SELLO);
  const nombres = A.laminasDe('bo').filter((l) => l.ganada).map((l) => l.dato);
  for (const q of preguntas) {
    assert.ok(nombres.includes(q.dato), 'pregunta sobre una lámina ganada');
    assert.equal(q.opciones.length, 3);
    assert.equal(new Set(q.opciones).size, 3);
  }
  const mal = A.responderSello('bo', preguntas, preguntas.map((q) => (q.correcta + 1) % 3));
  assert.deepEqual(mal, { aciertos: 0, sellado: false });
  const yapa = e.yapa;
  const bien = A.responderSello('bo', preguntas, preguntas.map((q) => q.correcta));
  assert.deepEqual(bien, { aciertos: 3, sellado: true });
  assert.equal(e.yapa, yapa + A.YAPA_SELLO);
  assert.equal(A.sellado('bo'), true);
  assert.equal(A.puedeSellar('bo'), false);
});

test('caseritos con nombre: uno por puesto y país, y lo que piden existe en ese país', () => {
  for (const id of IDS) {
    const lista = CASERITOS[id];
    assert.deepEqual(lista.map((c) => c.puesto).sort(), ['comida', 'frutera', 'refresquera', 'telar']);
    const bebidas = BEBIDAS[id].map(([b]) => b);
    const frutas = frutasDe(id).map((f) => f.id);
    const colores = datosPais(id).telar.paleta.map(([c]) => c);
    for (const c of lista) {
      assert.equal(c.linea.length, 3);
      if (c.bebida) assert.ok(bebidas.includes(c.bebida), `${id}: ${c.bebida}`);
      if (c.color) assert.ok(colores.includes(c.color), `${id}: ${c.color}`);
      if (c.fruta) {
        const k = frutas.indexOf(c.fruta);
        assert.ok(k >= 3 && k <= 7, `${id}: ${c.fruta} debe poder pedirse (escalón 3 a 7)`);
      }
    }
    const f = FIESTAS[id].caserito;
    if (f.bebida) assert.ok(bebidas.includes(f.bebida), `${id} fiesta: ${f.bebida}`);
    if (f.color) assert.ok(colores.includes(f.color), `${id} fiesta: ${f.color}`);
  }
});

test('caseritos con nombre: llegan a veces, y en fiesta llega el de la fiesta', () => {
  assert.equal(A.caseritoConHistoria('bo', 'refresquera', () => 0.9, new Date(2026, 3, 1)), null);
  assert.equal(A.caseritoConHistoria('bo', 'refresquera', () => 0.1, new Date(2026, 3, 1))?.bebida, 'api');
  const fiesta = A.caseritoConHistoria('us', 'refresquera', () => 0.1, new Date(2026, 10, 26));
  assert.equal(fiesta.fiesta, true);
  assert.equal(fiesta.bebida, 'us-arandano');
  assert.equal(A.esCasera({ nombre: 'Doña Rosa · El Alto' }), true);
  assert.equal(A.esCasera({ nombre: 'Don Teo · La Paz' }), false);
  assert.match(A.htmlCaserito({ nombre: 'A <b>', linea: 'x & y' }), /&lt;b&gt;.*x &amp; y/);
});

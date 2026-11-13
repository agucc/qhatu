// Las bebidas de cada país para La Refresquera y su recetario.
// Cada país tiene ocho, una por color de vaso, y cada una con un dibujo distinto.
// Nombre y descripción en [español, inglés, portugués].

import { ICONOS } from './iconos.js';
import { texto } from '../shared/paises.js';

/** Los ocho colores de vaso: siempre los mismos para que se distingan bien entre sí. */
export const COLORES_VASO = [
  { color: '#9a48b8', tinta: '#ffffff' }, // morado
  { color: '#ffb520', tinta: '#17131f' }, // amarillo
  { color: '#ef476f', tinta: '#ffffff' }, // rosado
  { color: '#a6d63a', tinta: '#17131f' }, // verde limón
  { color: '#1fb5a5', tinta: '#17131f' }, // turquesa
  { color: '#f3ead2', tinta: '#17131f' }, // crema
  { color: '#96502a', tinta: '#ffffff' }, // café
  { color: '#3f3c9e', tinta: '#ffffff' }, // añil
];

// [id, ícono, nombre, descripción], en el orden de COLORES_VASO
export const BEBIDAS = {
  bo: [
    ['api', 'mazorca', ['Api morado', 'Purple api', 'Api roxo'], ['Maíz morado molido, caliente y espeso. Va con buñuelos o pastel.', 'Ground purple corn, hot and thick. Goes with buñuelos or pastel.', 'Milho roxo moído, quente e grosso. Vai com buñuelos ou pastel.']],
    ['tumbo', 'tumbo', ['Jugo de tumbo', 'Tumbo juice', 'Suco de tumbo'], ['Tumbo de los valles, ácido y perfumado.', 'Banana passionfruit from the valleys, tart and fragrant.', 'Tumbo dos vales, ácido e perfumado.']],
    ['frutilla', 'frutilla', ['Refresco de frutilla', 'Strawberry drink', 'Suco de morango'], ['Frutilla licuada con agua fría y un poco de azúcar.', 'Strawberries blended with cold water and a little sugar.', 'Morango batido com água gelada e um pouco de açúcar.']],
    ['limonada', 'limon', ['Limonada', 'Lemonade', 'Limonada'], ['Limón, agua fría y azúcar. Para el mediodía.', 'Lime, cold water and sugar. For midday.', 'Limão, água gelada e açúcar. Para o meio-dia.']],
    ['hierbabuena', 'mate', ['Mate de hierbabuena', 'Mint tea', 'Chá de hortelã'], ['Para después del almuerzo, caliente o frío.', 'For after lunch, hot or cold.', 'Para depois do almoço, quente ou frio.']],
    ['somo', 'grano', ['Somó', 'Somó', 'Somó'], ['Maíz blanco con canela. Típico de Chuquisaca.', 'White corn with cinnamon. Typical of Chuquisaca.', 'Milho branco com canela. Típico de Chuquisaca.']],
    ['mocochinchi', 'durazno', ['Mocochinchi', 'Mocochinchi', 'Mocochinchi'], ['Durazno deshidratado hervido con canela y clavo. El refresco del mercado.', 'Dried peach boiled with cinnamon and cloves. The market classic.', 'Pêssego seco fervido com canela e cravo. O clássico do mercado.']],
    ['chicha', 'pina', ['Chicha morada', 'Chicha morada', 'Chicha morada'], ['Maíz morado con piña, canela y clavo.', 'Purple corn with pineapple, cinnamon and cloves.', 'Milho roxo com abacaxi, canela e cravo.']],
  ],
  pe: [
    ['pe-chicha', 'mazorca', ['Chicha morada', 'Chicha morada', 'Chicha morada'], ['Maíz morado hervido con piña, canela y clavo.', 'Purple corn boiled with pineapple, cinnamon and cloves.', 'Milho roxo fervido com abacaxi, canela e cravo.']],
    ['pe-maracuya', 'maracuya', ['Jugo de maracuyá', 'Passion fruit juice', 'Suco de maracujá'], ['Ácido y perfumado, de la costa y la selva.', 'Tart and fragrant, from the coast and the jungle.', 'Ácido e perfumado, do litoral e da selva.']],
    ['pe-camucamu', 'cerezas', ['Refresco de camu camu', 'Camu camu drink', 'Refresco de camu-camu'], ['Fruta amazónica con muchísima vitamina C.', 'An Amazon fruit packed with vitamin C.', 'Fruta amazônica cheia de vitamina C.']],
    ['pe-limonada', 'limon', ['Limonada', 'Lemonade', 'Limonada'], ['Con limón de la costa norte, bien helada.', 'Made with limes from the northern coast, ice cold.', 'Com limão do litoral norte, bem gelada.']],
    ['pe-muna', 'hoja', ['Mate de muña', 'Muña tea', 'Chá de muña'], ['Hierba andina con olor a menta.', 'An Andean herb that smells like mint.', 'Erva andina com aroma de menta.']],
    ['pe-quinua', 'quinua', ['Refresco de quinua', 'Quinoa drink', 'Refresco de quinoa'], ['Quinua cocida con manzana y canela.', 'Cooked quinoa with apple and cinnamon.', 'Quinoa cozida com maçã e canela.']],
    ['pe-emoliente', 'taza', ['Emoliente', 'Emoliente', 'Emoliente'], ['Bebida caliente de hierbas que se vende en carretillas.', 'A hot herbal drink sold from street carts.', 'Bebida quente de ervas vendida em carrinhos de rua.']],
    ['pe-sauco', 'moras', ['Refresco de sauco', 'Elderberry drink', 'Refresco de sabugueiro'], ['Bayas oscuras de los Andes, dulces y ácidas.', 'Dark Andean berries, sweet and tart.', 'Frutinhas escuras dos Andes, doces e ácidas.']],
  ],
  mx: [
    ['mx-tuna', 'tuna', ['Agua de tuna', 'Prickly pear agua fresca', 'Água de figo-da-índia'], ['Tuna roja licuada con agua y limón.', 'Red prickly pear blended with water and lime.', 'Figo-da-índia vermelho batido com água e limão.']],
    ['mx-mango', 'mango', ['Agua de mango', 'Mango agua fresca', 'Água de manga'], ['Mango maduro licuado: el sabor del verano.', 'Ripe mango blended: the taste of summer.', 'Manga madura batida: o sabor do verão.']],
    ['mx-jamaica', 'flor', ['Agua de jamaica', 'Hibiscus agua fresca', 'Água de hibisco'], ['Flor de jamaica en infusión, roja y ácida.', 'Steeped hibiscus flowers, red and tart.', 'Flor de hibisco em infusão, vermelha e ácida.']],
    ['mx-limon', 'limon', ['Agua de limón con chía', 'Lime agua fresca with chia', 'Água de limão com chia'], ['Limón con semillas de chía, muy fresca.', 'Lime with chia seeds, very refreshing.', 'Limão com sementes de chia, bem refrescante.']],
    ['mx-pepino', 'pepino', ['Agua de pepino', 'Cucumber agua fresca', 'Água de pepino'], ['Pepino con limón y un toque de menta.', 'Cucumber with lime and a touch of mint.', 'Pepino com limão e um toque de hortelã.']],
    ['mx-horchata', 'arroz', ['Horchata', 'Horchata', 'Horchata'], ['Arroz remojado con canela y vainilla.', 'Soaked rice with cinnamon and vanilla.', 'Arroz de molho com canela e baunilha.']],
    ['mx-tamarindo', 'vaina', ['Agua de tamarindo', 'Tamarind agua fresca', 'Água de tamarindo'], ['Pulpa de tamarindo, agridulce.', 'Tamarind pulp, sweet and sour.', 'Polpa de tamarindo, agridoce.']],
    ['mx-atole', 'mazorca', ['Atole de maíz azul', 'Blue corn atole', 'Atole de milho azul'], ['Bebida caliente y espesa de maíz, desde tiempos antiguos.', 'A hot, thick corn drink made since ancient times.', 'Bebida quente e grossa de milho, desde tempos antigos.']],
  ],
  co: [
    ['co-mora', 'moras', ['Jugo de mora', 'Andean blackberry juice', 'Suco de amora'], ['Mora de Castilla licuada en agua o en leche.', 'Andean blackberries blended with water or milk.', 'Amora andina batida com água ou leite.']],
    ['co-maracuya', 'maracuya', ['Jugo de maracuyá', 'Passion fruit juice', 'Suco de maracujá'], ['Uno de los jugos favoritos en todo el país.', 'One of the favorite juices across the country.', 'Um dos sucos favoritos em todo o país.']],
    ['co-salpicon', 'cubos', ['Salpicón', 'Salpicón', 'Salpicón'], ['Frutas picadas en jugo de sandía.', 'Chopped fruit in watermelon juice.', 'Frutas picadas no suco de melancia.']],
    ['co-lulada', 'lulo', ['Lulada', 'Lulada', 'Lulada'], ['Lulo machacado con limón y hielo, típico del Valle del Cauca.', 'Mashed lulo with lime and ice, typical of Valle del Cauca.', 'Lulo amassado com limão e gelo, típico do Valle del Cauca.']],
    ['co-aromatica', 'hoja', ['Aromática', 'Herbal infusion', 'Chá de ervas'], ['Agua caliente con hierbas y frutas.', 'Hot water with herbs and fruit.', 'Água quente com ervas e frutas.']],
    ['co-avena', 'espiga', ['Avena', 'Oat drink', 'Bebida de aveia'], ['Avena con leche y canela, bien fría.', 'Oats with milk and cinnamon, served cold.', 'Aveia com leite e canela, bem gelada.']],
    ['co-aguapanela', 'taza', ['Aguapanela', 'Aguapanela', 'Água de rapadura'], ['Panela en agua: fría con limón o caliente con queso.', 'Cane sugar in water: cold with lime or hot with cheese.', 'Rapadura na água: fria com limão ou quente com queijo.']],
    ['co-corozo', 'cerezas', ['Jugo de corozo', 'Corozo juice', 'Suco de corozo'], ['Fruto de palma de la costa Caribe.', 'A palm fruit from the Caribbean coast.', 'Fruto de palmeira do litoral caribenho.']],
  ],
  ar: [
    ['ar-uva', 'uvas', ['Jugo de uva', 'Grape juice', 'Suco de uva'], ['Uvas de Mendoza y San Juan.', 'Grapes from Mendoza and San Juan.', 'Uvas de Mendoza e San Juan.']],
    ['ar-naranja', 'naranja', ['Jugo de naranja exprimido', 'Fresh orange juice', 'Suco de laranja espremido'], ['Recién exprimido, para el desayuno.', 'Freshly squeezed, for breakfast.', 'Espremido na hora, para o café da manhã.']],
    ['ar-frutilla', 'frutilla', ['Licuado de frutilla', 'Strawberry shake', 'Vitamina de morango'], ['Frutillas con leche, en la licuadora.', 'Strawberries blended with milk.', 'Morangos batidos com leite.']],
    ['ar-mate', 'mate', ['Mate', 'Mate', 'Mate'], ['Yerba en el mate, con bombilla. Se comparte en ronda.', 'Yerba in a gourd with a metal straw, shared in a circle.', 'Erva na cuia, com bomba. Compartilhado em roda.']],
    ['ar-terere', 'guampa', ['Tereré', 'Tereré', 'Tereré'], ['Yerba mate con agua bien fría, del norte del país.', 'Yerba mate with ice-cold water, from the north.', 'Erva-mate com água gelada, do norte do país.']],
    ['ar-banana', 'banana', ['Licuado de banana', 'Banana shake', 'Vitamina de banana'], ['Banana con leche, el clásico de la merienda.', 'Banana with milk, the afternoon-snack classic.', 'Banana com leite, o clássico do lanche da tarde.']],
    ['ar-submarino', 'taza', ['Submarino', 'Submarino', 'Submarino'], ['Una barra de chocolate que se hunde en la leche caliente.', 'A chocolate bar sunk into hot milk.', 'Uma barra de chocolate afundada no leite quente.']],
    ['ar-arandanos', 'arandanos', ['Jugo de arándanos', 'Blueberry juice', 'Suco de mirtilo'], ['Arándanos de Tucumán y Entre Ríos.', 'Blueberries from Tucumán and Entre Ríos.', 'Mirtilos de Tucumán e Entre Ríos.']],
  ],
  br: [
    ['br-jabuticaba', 'jabuticaba', ['Jugo de jabuticaba', 'Jaboticaba juice', 'Suco de jabuticaba'], ['Fruta que crece pegada al tronco del árbol.', 'A fruit that grows right on the tree trunk.', 'Fruta que cresce grudada no tronco da árvore.']],
    ['br-maracuja', 'maracuya', ['Jugo de maracuyá', 'Passion fruit juice', 'Suco de maracujá'], ['Ácido, perfumado y muy brasileño.', 'Tart, fragrant and very Brazilian.', 'Ácido, perfumado e bem brasileiro.']],
    ['br-acerola', 'cerezas', ['Jugo de acerola', 'Acerola juice', 'Suco de acerola'], ['Cereza tropical con mucha vitamina C.', 'A tropical cherry rich in vitamin C.', 'Cereja tropical rica em vitamina C.']],
    ['br-caldo', 'cana', ['Jugo de caña', 'Sugarcane juice', 'Caldo de cana'], ['Caña recién molida, con limón. Se toma en la feria.', 'Freshly pressed sugarcane with lime, sold at street fairs.', 'Cana moída na hora, com limão. Tomado na feira.']],
    ['br-coco', 'coco', ['Agua de coco', 'Coconut water', 'Água de coco'], ['Directo del coco verde, en la playa.', 'Straight from a green coconut at the beach.', 'Direto do coco verde, na praia.']],
    ['br-cupuacu', 'copoazu', ['Jugo de copoazú', 'Cupuaçu juice', 'Suco de cupuaçu'], ['Fruta amazónica cremosa, prima del cacao.', 'A creamy Amazon fruit, cousin of cacao.', 'Fruta amazônica cremosa, prima do cacau.']],
    ['br-guarana', 'guarana', ['Guaraná', 'Guaraná', 'Guaraná'], ['Fruto amazónico que parece un ojo y da energía.', 'An Amazon fruit that looks like an eye and gives energy.', 'Fruto amazônico que parece um olho e dá energia.']],
    ['br-acai', 'bol', ['Açaí', 'Açaí', 'Açaí'], ['Bayas del Amazonas, espesas y moradas.', 'Thick purple berries from the Amazon.', 'Frutinhas da Amazônia, grossas e roxas.']],
  ],
  us: [
    ['us-uva', 'uvas', ['Jugo de uva', 'Grape juice', 'Suco de uva'], ['Uva Concord, morada y dulce.', 'Concord grapes, purple and sweet.', 'Uva Concord, roxa e doce.']],
    ['us-limonada', 'limon', ['Limonada', 'Lemonade', 'Limonada'], ['El puesto de limonada en la vereda, todo un clásico.', 'The sidewalk lemonade stand, a classic.', 'A barraca de limonada na calçada, um clássico.']],
    ['us-arandano', 'cerezas', ['Jugo de arándano rojo', 'Cranberry juice', 'Suco de cranberry'], ['El arándano rojo de la cena de Acción de Gracias.', 'The cranberry of the Thanksgiving table.', 'O cranberry da ceia de Ação de Graças.']],
    ['us-manzana', 'manzana', ['Jugo de manzana', 'Apple juice', 'Suco de maçã'], ['Manzanas de otoño de Nueva Inglaterra y Washington.', 'Fall apples from New England and Washington.', 'Maçãs de outono da Nova Inglaterra e de Washington.']],
    ['us-te', 'hoja', ['Té helado con menta', 'Mint iced tea', 'Chá gelado com hortelã'], ['Té frío con hielo, muy del sur.', 'Iced tea, a Southern favorite.', 'Chá gelado, muito do sul do país.']],
    ['us-batido', 'batido', ['Malteada de vainilla', 'Vanilla milkshake', 'Milk-shake de baunilha'], ['Helado y leche batidos, como en el diner.', 'Ice cream and milk blended, diner style.', 'Sorvete e leite batidos, estilo lanchonete.']],
    ['us-rootbeer', 'jarra', ['Root beer', 'Root beer', 'Root beer'], ['Gaseosa de raíces y vainilla, sin alcohol.', 'A soda made from roots and vanilla, no alcohol.', 'Refrigerante de raízes e baunilha, sem álcool.']],
    ['us-blueberry', 'arandanos', ['Batido de arándanos', 'Blueberry smoothie', 'Vitamina de mirtilo'], ['Arándanos azules de Maine, batidos.', 'Wild Maine blueberries, blended.', 'Mirtilos do Maine, batidos.']],
  ],
};

/** Bebidas de Bolivia que solo están en el recetario (no se juegan). */
export const EXTRAS_RECETARIO = {
  bo: [
    ['linaza', 'semillas', '#d8c27a', '#17131f', ['Linaza', 'Flaxseed drink', 'Linhaça'], ['Semillas de linaza hervidas. Suave y fresca.', 'Boiled flaxseeds. Smooth and fresh.', 'Sementes de linhaça fervidas. Suave e fresca.']],
    ['cebada', 'espiga', '#c8893f', '#17131f', ['Cebada', 'Barley drink', 'Cevada'], ['Cebada tostada con canela y un toque de limón.', 'Toasted barley with cinnamon and a touch of lime.', 'Cevada tostada com canela e um toque de limão.']],
    ['copoazu', 'copoazu', '#f1dfae', '#6b3f1f', ['Copoazú', 'Cupuaçu', 'Cupuaçu'], ['Fruta amazónica del Beni y Pando, cremosa y dulce.', 'Amazon fruit from Beni and Pando, creamy and sweet.', 'Fruta amazônica do Beni e Pando, cremosa e doce.']],
    ['tamarindo', 'vaina', '#7a4b2a', '#ffffff', ['Tamarindo', 'Tamarind', 'Tamarindo'], ['Pulpa de tamarindo, agridulce y refrescante.', 'Tamarind pulp, sweet and sour.', 'Polpa de tamarindo, agridoce e refrescante.']],
  ],
};

/** Todas las bebidas (jugables y de recetario) por id: { color, tinta, simbolo, nombre, desc, pais }. */
export const TODAS = {};
for (const [pais, lista] of Object.entries(BEBIDAS)) {
  lista.forEach(([id, icono, nombre, desc], k) => {
    TODAS[id] = { ...COLORES_VASO[k], simbolo: ICONOS[icono], icono, nombre, desc, pais };
  });
}
for (const [pais, lista] of Object.entries(EXTRAS_RECETARIO)) {
  for (const [id, icono, color, tinta, nombre, desc] of lista) TODAS[id] = { color, tinta, simbolo: ICONOS[icono], icono, nombre, desc, pais };
}

/** Las ocho bebidas jugables de un país, como mapa de sabores para el tablero. */
export function saboresDe(pais) {
  const lista = BEBIDAS[pais] || BEBIDAS.bo;
  const SABORES = {};
  for (const [id] of lista) SABORES[id] = TODAS[id];
  return { SABORES, IDS_SABORES: lista.map(([id]) => id) };
}

export function nombreBebida(id) {
  return texto(TODAS[id]?.nombre) || id;
}

export function descBebida(id) {
  return texto(TODAS[id]?.desc);
}

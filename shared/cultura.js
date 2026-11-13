// Contenido cultural de cada país: láminas del Álbum del Mercado, caseritos con nombre y fiestas.
// Solo datos (la lógica está en album.js). Textos en [español, inglés, portugués].
//
// IMPORTANTE: todo esto está "pendiente de validar" con personas de cada país (ver docs/).
// Los datos se escribieron a partir de fuentes generales; si alguien de ese país corrige algo,
// se cambia aquí y no hace falta tocar la lógica.

// ---------- Láminas que no salen de otros datos ----------
// Las bebidas usan su descripción de refresquera/bebidas.js y el tejido su `origen` de paises.js.

/** Tres frutas por país con su dato, por id de frutera/frutas.js. */
export const FRUTAS_ALBUM = {
  bo: {
    achachairu: ['Fruta del oriente boliviano (Santa Cruz y Beni), de cáscara naranja y pulpa blanca, dulce y ácida.', 'Fruit from eastern Bolivia (Santa Cruz and Beni), with orange skin and white, sweet-and-sour flesh.', 'Fruta do oriente boliviano (Santa Cruz e Beni), de casca laranja e polpa branca, doce e ácida.'],
    durazno: ['Los valles de Tarija, Chuquisaca y Cochabamba son tierra de duraznos. Secos, se convierten en el mocochinchi.', 'The valleys of Tarija, Chuquisaca and Cochabamba are peach country. Dried, they become mocochinchi.', 'Os vales de Tarija, Chuquisaca e Cochabamba são terra de pêssegos. Secos, viram o mocochinchi.'],
    chirimoya: ['Fruta de los valles andinos, de pulpa blanca y cremosa con semillas negras.', 'Fruit from the Andean valleys, with creamy white flesh and black seeds.', 'Fruta dos vales andinos, de polpa branca e cremosa com sementes pretas.'],
  },
  pe: {
    aguaymanto: ['Baya dorada de los Andes que viene envuelta en un capuchón de hojas secas.', 'Golden Andean berry that comes wrapped in a papery husk.', 'Baga dourada dos Andes que vem envolta em uma capinha de folhas secas.'],
    lucuma: ['Fruta andina de pulpa amarilla y harinosa. El helado de lúcuma es uno de los favoritos del Perú.', 'Andean fruit with yellow, floury flesh. Lúcuma ice cream is one of Peru’s favorites.', 'Fruta andina de polpa amarela e farinhenta. O sorvete de lúcuma é um dos favoritos do Peru.'],
    palta: ['Palta es como se le dice al aguacate en el Perú; la palabra viene del quechua.', 'Palta is what avocado is called in Peru; the word comes from Quechua.', 'Palta é como se chama o abacate no Peru; a palavra vem do quéchua.'],
  },
  mx: {
    capulin: ['Cereza silvestre de los bosques de México, pequeña y oscura.', 'Wild cherry from Mexico’s forests, small and dark.', 'Cereja silvestre das florestas do México, pequena e escura.'],
    mamey: ['Cáscara café y pulpa color salmón, dulce y cremosa; se toma en licuados.', 'Brown skin and salmon-colored flesh, sweet and creamy; it goes into smoothies.', 'Casca marrom e polpa cor de salmão, doce e cremosa; vai em vitaminas.'],
    aguacate: ['Su nombre viene del náhuatl ahuacatl. Michoacán es la región que más aguacate cultiva.', 'Its name comes from the Nahuatl ahuacatl. Michoacán grows more avocados than any other region.', 'O nome vem do náuatle ahuacatl. Michoacán é a região que mais cultiva abacate.'],
  },
  co: {
    uchuva: ['Así se llama en Colombia al aguaymanto: una baya dorada de los Andes.', 'That is what Colombia calls the golden Andean berry.', 'É assim que a Colômbia chama a baga dourada dos Andes.'],
    lulo: ['Fruta ácida de cáscara naranja y pulpa verde; con ella se hace la lulada del Valle del Cauca.', 'Sour fruit with orange skin and green pulp; it is used for the lulada of Valle del Cauca.', 'Fruta ácida de casca laranja e polpa verde; com ela se faz a lulada do Valle del Cauca.'],
    guanabana: ['Fruta grande de cáscara verde con espinas suaves; su pulpa blanca se toma en jugo con leche.', 'Large green fruit with soft spines; its white pulp is drunk as a milk juice.', 'Fruta grande de casca verde com espinhos macios; a polpa branca vira suco com leite.'],
  },
  ar: {
    arandano: ['Se cultiva sobre todo en Tucumán y Entre Ríos, y se cosecha en primavera.', 'Grown mainly in Tucumán and Entre Ríos, and harvested in spring.', 'Cultivado sobretudo em Tucumán e Entre Ríos, e colhido na primavera.'],
    uva: ['Mendoza es la principal región de viñedos de la Argentina, al pie de la cordillera.', 'Mendoza is Argentina’s main vineyard region, at the foot of the Andes.', 'Mendoza é a principal região de vinhedos da Argentina, ao pé da cordilheira.'],
    pera: ['El Alto Valle de Río Negro y Neuquén es famoso por sus peras y manzanas.', 'The Alto Valle of Río Negro and Neuquén is famous for its pears and apples.', 'O Alto Valle de Río Negro e Neuquén é famoso por suas peras e maçãs.'],
  },
  br: {
    jabuticaba: ['Fruta nativa del Brasil que nace pegada al tronco del árbol.', 'Native Brazilian fruit that grows stuck to the tree trunk.', 'Fruta nativa do Brasil que nasce grudada no tronco da árvore.'],
    caju: ['El fruto del cajú es la castaña que cuelga abajo; la parte carnosa se toma en jugo.', 'The real fruit of the cashew is the nut hanging below; the fleshy part is made into juice.', 'O fruto do caju é a castanha que fica embaixo; a parte carnuda vira suco.'],
    cupuacu: ['Pariente del cacao, de la Amazonía; su pulpa perfumada se usa en cremas y jugos.', 'A relative of cacao from the Amazon; its fragrant pulp goes into creams and juices.', 'Parente do cacau, da Amazônia; sua polpa perfumada vai em cremes e sucos.'],
  },
  us: {
    blueberry: ['Es nativo de Norteamérica; Maine es famoso por sus arándanos silvestres.', 'Native to North America; Maine is famous for its wild blueberries.', 'É nativo da América do Norte; o Maine é famoso por seus mirtilos silvestres.'],
    cherry: ['Michigan y el estado de Washington son grandes productores de cerezas.', 'Michigan and Washington State are big cherry growers.', 'Michigan e o estado de Washington são grandes produtores de cerejas.'],
    pumpkin: ['La reina del otoño: se talla para Halloween y se hornea en pumpkin pie para Thanksgiving.', 'The queen of fall: carved for Halloween and baked into pumpkin pie for Thanksgiving.', 'A rainha do outono: entalhada no Halloween e assada em pumpkin pie no Thanksgiving.'],
  },
};

/** El plato del puesto de comida de cada país. */
export const COMIDA_ALBUM = {
  bo: ['Se come a media mañana y con cuidado: por dentro tiene un jugo caliente que no se debe derramar.', 'Eaten mid-morning and carefully: inside there is a hot juice you must not spill.', 'Come-se no meio da manhã e com cuidado: dentro tem um caldo quente que não se deve derramar.'],
  pe: ['Brochetas de corazón de res marinado en ají panca, asadas en la calle al caer la noche.', 'Skewers of beef heart marinated in ají panca, grilled on the street at nightfall.', 'Espetinhos de coração de boi marinado em ají panca, assados na rua ao anoitecer.'],
  mx: ['El taco al pastor nació del shawarma que trajeron inmigrantes libaneses a México.', 'Tacos al pastor were born from the shawarma brought by Lebanese immigrants to Mexico.', 'O taco al pastor nasceu do shawarma trazido por imigrantes libaneses ao México.'],
  co: ['Masa de maíz asada o frita; cada región tiene la suya, como la de choclo o la boyacense.', 'Corn dough, grilled or fried; each region has its own, like the sweet-corn or Boyacá arepa.', 'Massa de milho assada ou frita; cada região tem a sua, como a de milho verde ou a de Boyacá.'],
  ar: ['Cada provincia tiene la suya: tucumanas, salteñas, mendocinas… y se discute cuál es la mejor.', 'Each province has its own: from Tucumán, Salta, Mendoza… and people argue about which is best.', 'Cada província tem a sua: tucumanas, salteñas, mendocinas… e se discute qual é a melhor.'],
  br: ['Se hace con almidón de mandioca (polvilho) y queso; por eso no lleva harina de trigo.', 'Made with cassava starch (polvilho) and cheese, so it has no wheat flour.', 'Feito com polvilho e queijo; por isso não leva farinha de trigo.'],
  us: ['En Nueva York se come con mostaza y chucrut; en Chicago, con muchos ingredientes y sin kétchup.', 'In New York it comes with mustard and sauerkraut; in Chicago, loaded with toppings and no ketchup.', 'Em Nova York vem com mostarda e chucrute; em Chicago, com muitos ingredientes e sem ketchup.'],
};

/** Un dato más del tejido (además de su procedencia). */
export const TEJIDO_ALBUM = {
  bo: ['Tela que se lleva en la espalda para cargar al bebé o la mercadería. Sus figuras cambian según la comunidad que lo teje.', 'Cloth carried on the back to hold a baby or goods. Its figures change with the community that weaves it.', 'Pano levado nas costas para carregar o bebê ou a mercadoria. Suas figuras mudam conforme a comunidade que o tece.'],
  pe: ['En Chinchero las tejedoras tiñen la lana con plantas, cochinilla y minerales.', 'In Chinchero, weavers dye the wool with plants, cochineal and minerals.', 'Em Chinchero, as tecelãs tingem a lã com plantas, cochonilha e minerais.'],
  mx: ['Los sarapes de Saltillo tienen franjas de colores degradados y un rombo al centro.', 'Saltillo sarapes have stripes of shaded colors and a diamond in the middle.', 'Os sarapes de Saltillo têm faixas em degradê e um losango no centro.'],
  co: ['Las mujeres wayuu la tejen en crochet; sus figuras se llaman kanaas y cada una tiene significado.', 'Wayuu women crochet it; its figures are called kanaas and each one has a meaning.', 'As mulheres wayuu a tecem em crochê; suas figuras se chamam kanaas e cada uma tem um significado.'],
  ar: ['El poncho salteño es rojo con franjas negras, en recuerdo de los gauchos de Güemes.', 'The Salta poncho is red with black stripes, in memory of Güemes’ gauchos.', 'O poncho salteño é vermelho com faixas pretas, em lembrança dos gaúchos de Güemes.'],
  br: ['Tela de algodón barata y alegre, con flores grandes; es el traje de las fiestas juninas.', 'Cheap, cheerful cotton with big flowers; it is the outfit of the June festivals.', 'Tecido de algodão barato e alegre, com flores grandes; é a roupa das festas juninas.'],
  us: ['Colchas hechas uniendo retazos; las de Gee’s Bend, Alabama, se exhiben en museos.', 'Blankets made by joining patches; the ones from Gee’s Bend, Alabama, hang in museums.', 'Colchas feitas unindo retalhos; as de Gee’s Bend, no Alabama, estão em museus.'],
};

/** La palabra del mercado de cada país (va con el saludo de La Casera). */
export const PALABRA_ALBUM = {
  bo: { nombre: ['Caserito', 'Caserito', 'Caserito'], dato: ['Casero o caserito es el cliente de siempre, y también la vendedora. Al casero nunca le falta la yapa.', 'Casero or caserito is your regular customer, and also the seller. A casero always gets yapa.', 'Casero ou caserito é o cliente de sempre, e também a vendedora. Ao casero nunca falta a yapa.'] },
  pe: { nombre: ['Casero', 'Casero', 'Casero'], dato: ['En los mercados del Perú se llama a la gente con “¡Pase, casero!”, y la yapa también existe.', 'In Peru’s markets people are called in with “¡Pase, casero!”, and yapa exists there too.', 'Nos mercados do Peru chamam as pessoas com “¡Pase, casero!”, e a yapa também existe.'] },
  mx: { nombre: ['Marchante y pilón', 'Marchante and pilón', 'Marchante e pilón'], dato: ['Marchante es el cliente de confianza del mercado, y el regalo de más se llama pilón.', 'Marchante is the market’s trusted customer, and the little extra is called pilón.', 'Marchante é o cliente de confiança do mercado, e o agrado a mais se chama pilón.'] },
  co: { nombre: ['Veci y ñapa', 'Veci and ñapa', 'Veci e ñapa'], dato: ['Veci viene de vecino; en las tiendas de barrio el regalo de más se llama ñapa.', 'Veci comes from vecino (neighbor); in corner shops the little extra is called ñapa.', 'Veci vem de vecino (vizinho); nas vendinhas do bairro o agrado a mais se chama ñapa.'] },
  ar: { nombre: ['Che', 'Che', 'Che'], dato: ['Che se usa para llamar a alguien con confianza; es tan argentino que se volvió apodo.', 'Che is how you call someone you trust; it is so Argentine it became a nickname.', 'Che serve para chamar alguém com intimidade; é tão argentino que virou apelido.'] },
  br: { nombre: ['Freguês', 'Freguês', 'Freguês'], dato: ['Freguês es el cliente de siempre de la feria, al que el feirante saluda por su nombre.', 'Freguês is the regular at the street market, whom the stallholder greets by name.', 'Freguês é o cliente de sempre da feira, que o feirante cumprimenta pelo nome.'] },
  us: { nombre: ['Lagniappe', 'Lagniappe', 'Lagniappe'], dato: ['En Luisiana, el regalo de más se llama lagniappe; la palabra viene de “la yapa” de los Andes.', 'In Louisiana, the little extra is called lagniappe; the word comes from the Andean “la yapa”.', 'Na Luisiana, o agrado a mais se chama lagniappe; a palavra vem de “la yapa” dos Andes.'] },
};

// ---------- Fiestas del calendario ----------
// Fechas reales (aproximadas a la semana de la fiesta). `desde` y `hasta` son [mes, día];
// `regla: 'thanksgiving'` calcula el cuarto jueves de noviembre de cada año.

export const FIESTAS = {
  bo: {
    id: 'alasitas',
    nombre: ['Alasitas', 'Alasitas', 'Alasitas'],
    desde: [1, 24], hasta: [2, 8],
    dato: ['Feria de miniaturas de La Paz: se compran casitas, autos o billetes pequeños para pedirle al Ekeko que los deseos se cumplan.', 'La Paz’s miniatures fair: people buy tiny houses, cars or bills so the Ekeko will make their wishes come true.', 'Feira de miniaturas de La Paz: compram-se casinhas, carros ou notas pequenas para pedir ao Ekeko que os desejos se realizem.'],
    caserito: { puesto: 'comida', nombre: 'Doña Ana · La Paz', linea: ['¡Salteñas para pasear por Alasitas!', 'Salteñas for a stroll around Alasitas!', 'Salteñas para passear pela Alasitas!'] },
  },
  pe: {
    id: 'intiraymi',
    nombre: ['Inti Raymi', 'Inti Raymi', 'Inti Raymi'],
    desde: [6, 20], hasta: [6, 26],
    dato: ['La Fiesta del Sol se celebra en Cusco cada 24 de junio, cerca del solsticio de invierno, en recuerdo de la celebración inca.', 'The Festival of the Sun is held in Cusco every June 24, near the winter solstice, recalling the Inca celebration.', 'A Festa do Sol é celebrada em Cusco todo 24 de junho, perto do solstício de inverno, lembrando a celebração inca.'],
    caserito: { puesto: 'telar', color: 'naranja', nombre: 'Doña Nilda · Cusco', linea: ['Una franja naranja, como el sol del Inti Raymi.', 'An orange stripe, like the Inti Raymi sun.', 'Uma faixa laranja, como o sol do Inti Raymi.'] },
  },
  mx: {
    id: 'muertos',
    nombre: ['Día de Muertos', 'Day of the Dead', 'Dia de Muertos'],
    desde: [10, 28], hasta: [11, 2],
    dato: ['Se arman altares con flores de cempasúchil, pan de muerto y la comida favorita de quienes se recuerdan.', 'Families build altars with marigolds, pan de muerto and the favorite food of those they remember.', 'Montam-se altares com flores de cempasúchil, pão de morto e a comida favorita de quem se lembra.'],
    caserito: { puesto: 'refresquera', bebida: 'mx-atole', nombre: 'Doña Lupe · Oaxaca', linea: ['Un atole para acompañar el pan de muerto.', 'An atole to go with the pan de muerto.', 'Um atole para acompanhar o pão de morto.'] },
  },
  co: {
    id: 'flores',
    nombre: ['Feria de las Flores', 'Flower Festival', 'Feira das Flores'],
    desde: [8, 1], hasta: [8, 12],
    dato: ['En Medellín, los silleteros cargan en la espalda enormes arreglos de flores en un desfile.', 'In Medellín, the silleteros carry huge flower arrangements on their backs in a parade.', 'Em Medellín, os silleteros carregam nas costas enormes arranjos de flores em um desfile.'],
    caserito: { puesto: 'telar', color: 'amarillo', nombre: 'Don Jairo · Santa Elena', linea: ['Una franja amarilla, como las flores de mi silleta.', 'A yellow stripe, like the flowers on my silleta.', 'Uma faixa amarela, como as flores da minha silleta.'] },
  },
  ar: {
    id: 'tradicion',
    nombre: ['Día de la Tradición', 'Tradition Day', 'Dia da Tradição'],
    desde: [11, 5], hasta: [11, 15],
    dato: ['Se celebra el 10 de noviembre, nacimiento de José Hernández, autor del Martín Fierro; en San Antonio de Areco hay desfiles gauchos.', 'Held on November 10, birthday of José Hernández, author of Martín Fierro; San Antonio de Areco hosts gaucho parades.', 'Celebrado em 10 de novembro, nascimento de José Hernández, autor do Martín Fierro; em San Antonio de Areco há desfiles gaúchos.'],
    caserito: { puesto: 'refresquera', bebida: 'ar-mate', nombre: 'Don Ramón · San Antonio de Areco', linea: ['Un mate para el desfile gaucho.', 'A mate for the gaucho parade.', 'Um mate para o desfile gaúcho.'] },
  },
  br: {
    id: 'junina',
    nombre: ['Festa Junina', 'Festa Junina', 'Festa Junina'],
    desde: [6, 1], hasta: [6, 30],
    dato: ['En junio se celebran los santos con fogatas, bandeirinhas, quadrilha y comidas de maíz.', 'In June the saints are celebrated with bonfires, bandeirinhas, quadrilha dancing and corn dishes.', 'Em junho celebram-se os santos com fogueiras, bandeirinhas, quadrilha e comidas de milho.'],
    caserito: { puesto: 'telar', color: 'rojo', nombre: 'Dona Lúcia · Caruaru', linea: ['Una franja roja para mi vestido de chita.', 'A red stripe for my chita dress.', 'Uma faixa vermelha para o meu vestido de chita.'] },
  },
  us: {
    id: 'thanksgiving',
    nombre: ['Thanksgiving', 'Thanksgiving', 'Ação de Graças'],
    regla: 'thanksgiving',
    dato: ['El cuarto jueves de noviembre las familias comparten pavo, puré, salsa de arándanos y pumpkin pie.', 'On the fourth Thursday of November families share turkey, mashed potatoes, cranberry sauce and pumpkin pie.', 'Na quarta quinta-feira de novembro as famílias dividem peru, purê, molho de cranberry e pumpkin pie.'],
    caserito: { puesto: 'refresquera', bebida: 'us-arandano', nombre: 'Mrs. Miller · Massachusetts', linea: ['Jugo de arándano rojo, como la salsa de la cena.', 'Cranberry juice, like the sauce at dinner.', 'Suco de cranberry, como o molho do jantar.'] },
  },
};

// ---------- Caseritos con nombre e historia ----------
// Uno por puesto en cada país. Aparecen a veces en lugar de un caserito cualquiera y piden
// lo suyo: `bebida` (id de bebidas.js), `fruta` (id de frutas.js) o `color` (del telar).

export const CASERITOS = {
  bo: [
    { puesto: 'refresquera', bebida: 'api', nombre: 'Doña Rosa · El Alto', linea: ['¡Un api calientito para el frío de la mañana!', 'A hot api for the cold morning!', 'Um api quentinho para o frio da manhã!'] },
    { puesto: 'frutera', fruta: 'durazno', nombre: 'Don Mario · Tarija', linea: ['Duraznos de los valles, para el mocochinchi.', 'Peaches from the valleys, for mocochinchi.', 'Pêssegos dos vales, para o mocochinchi.'] },
    { puesto: 'telar', color: 'rosado', nombre: 'Doña Justina · Tarabuco', linea: ['En Tarabuco tejemos figuras de la vida del campo.', 'In Tarabuco we weave figures of country life.', 'Em Tarabuco tecemos figuras da vida no campo.'] },
    { puesto: 'comida', nombre: 'Don Teo · La Paz', linea: ['Las salteñas son para media mañana, ¡con su jugo!', 'Salteñas are for mid-morning, with their juice!', 'Salteñas são para o meio da manhã, com seu caldo!'] },
  ],
  pe: [
    { puesto: 'refresquera', bebida: 'pe-chicha', nombre: 'Señora Carmen · Lima', linea: ['Una chicha morada bien heladita para el almuerzo.', 'An ice-cold chicha morada for lunch.', 'Uma chicha morada bem geladinha para o almoço.'] },
    { puesto: 'frutera', fruta: 'lucuma', nombre: 'Don Hugo · Lima', linea: ['Lúcuma para el helado de la tarde.', 'Lúcuma for the afternoon ice cream.', 'Lúcuma para o sorvete da tarde.'] },
    { puesto: 'telar', color: 'rojo', nombre: 'Doña Nilda · Chinchero', linea: ['Teñimos la lana con plantas y cochinilla.', 'We dye the wool with plants and cochineal.', 'Tingimos a lã com plantas e cochonilha.'] },
    { puesto: 'comida', nombre: 'Don Pepe · Lima', linea: ['Anticuchos al caer la noche, con su ají.', 'Anticuchos at nightfall, with their ají.', 'Anticuchos ao anoitecer, com seu ají.'] },
  ],
  mx: [
    { puesto: 'refresquera', bebida: 'mx-jamaica', nombre: 'Doña Lupe · Oaxaca', linea: ['Agua de jamaica para acompañar la comida.', 'Hibiscus water to go with the meal.', 'Água de hibisco para acompanhar a comida.'] },
    { puesto: 'frutera', fruta: 'aguacate', nombre: 'Don Chuy · Michoacán', linea: ['Aguacate de Michoacán para el guacamole.', 'Michoacán avocado for the guacamole.', 'Abacate de Michoacán para o guacamole.'] },
    { puesto: 'telar', color: 'naranja', nombre: 'Doña Chela · Saltillo', linea: ['Mi sarape lleva un rombo al centro.', 'My sarape has a diamond in the middle.', 'Meu sarape tem um losango no centro.'] },
    { puesto: 'comida', nombre: 'Don Beto · Ciudad de México', linea: ['Tacos al pastor con piña y cebollita.', 'Tacos al pastor with pineapple and onion.', 'Tacos al pastor com abacaxi e cebolinha.'] },
  ],
  co: [
    { puesto: 'refresquera', bebida: 'co-lulada', nombre: 'Doña Gloria · Cali', linea: ['Una lulada bien fría, como en Cali.', 'An ice-cold lulada, like in Cali.', 'Uma lulada bem gelada, como em Cali.'] },
    { puesto: 'frutera', fruta: 'guanabana', nombre: 'Don Efraín · Valle del Cauca', linea: ['Guanábana para el jugo en leche.', 'Soursop for the milk juice.', 'Graviola para o suco com leite.'] },
    { puesto: 'telar', color: 'rojo', nombre: 'Doña Iris · La Guajira', linea: ['Mis kanaas cuentan historias wayuu.', 'My kanaas tell Wayuu stories.', 'Meus kanaas contam histórias wayuu.'] },
    { puesto: 'comida', nombre: 'Don Álvaro · Bogotá', linea: ['Arepa con queso para el desayuno.', 'Arepa with cheese for breakfast.', 'Arepa com queijo no café da manhã.'] },
  ],
  ar: [
    { puesto: 'refresquera', bebida: 'ar-terere', nombre: 'Doña Marta · Corrientes', linea: ['Un tereré bien frío para la siesta.', 'An ice-cold tereré for siesta time.', 'Um tereré bem gelado para a sesta.'] },
    { puesto: 'frutera', fruta: 'pera', nombre: 'Don Raúl · Río Negro', linea: ['Peras del Alto Valle, recién cosechadas.', 'Pears from the Alto Valle, freshly picked.', 'Peras do Alto Valle, recém-colhidas.'] },
    { puesto: 'telar', color: 'rojo', nombre: 'Doña Elena · Salta', linea: ['Rojo y negro, como los gauchos de Güemes.', 'Red and black, like Güemes’ gauchos.', 'Vermelho e preto, como os gaúchos de Güemes.'] },
    { puesto: 'comida', nombre: 'Don Carlos · Tucumán', linea: ['Empanadas tucumanas, con carne cortada a cuchillo.', 'Tucumán empanadas, with knife-cut beef.', 'Empanadas tucumanas, com carne cortada à faca.'] },
  ],
  br: [
    { puesto: 'refresquera', bebida: 'br-acai', nombre: 'Dona Graça · Belém', linea: ['Açaí del Pará, espeso y sin azúcar.', 'Açaí from Pará, thick and unsweetened.', 'Açaí do Pará, grosso e sem açúcar.'] },
    { puesto: 'frutera', fruta: 'cupuacu', nombre: 'Seu Zé · Manaus', linea: ['Cupuaçu para la crema de la tarde.', 'Cupuaçu for the afternoon cream.', 'Cupuaçu para o creme da tarde.'] },
    { puesto: 'telar', color: 'rojo', nombre: 'Dona Lúcia · Caruaru', linea: ['Chita para el São João de Caruaru.', 'Chita for Caruaru’s São João.', 'Chita para o São João de Caruaru.'] },
    { puesto: 'comida', nombre: 'Seu Antônio · Minas Gerais', linea: ['Pão de queijo calentito, como en Minas.', 'Warm pão de queijo, just like in Minas.', 'Pão de queijo quentinho, como em Minas.'] },
  ],
  us: [
    { puesto: 'refresquera', bebida: 'us-te', nombre: 'Mrs. Johnson · Georgia', linea: ['Té helado bien dulce, como en el Sur.', 'Sweet iced tea, the Southern way.', 'Chá gelado bem doce, como no Sul.'] },
    { puesto: 'frutera', fruta: 'apple', nombre: 'Mr. Lee · Washington', linea: ['Manzanas del estado de Washington.', 'Apples from Washington State.', 'Maçãs do estado de Washington.'] },
    { puesto: 'telar', color: 'azul', nombre: 'Mary · Gee’s Bend, Alabama', linea: ['En Gee’s Bend cosemos quilts en grupo.', 'In Gee’s Bend we sew quilts together.', 'Em Gee’s Bend costuramos quilts em grupo.'] },
    { puesto: 'comida', nombre: 'Mr. Rossi · Nueva York', linea: ['Hot dog con mostaza y chucrut, como en Nueva York.', 'Hot dog with mustard and sauerkraut, New York style.', 'Cachorro-quente com mostarda e chucrute, como em Nova York.'] },
  ],
};

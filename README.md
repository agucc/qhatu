# qhatu

**El mercado de juegos.** Cada juego es un puesto. Todo se paga con yapa.

Qhatu es un mercado boliviano de juegos casuales hecho en HTML5 y JavaScript, sin motor ni dependencias. La portada es el mercado: tocas un puesto y juegas al instante, sin descargar ni registrarte.

## Los mercados de las Américas

Al entrar por primera vez, el jugador elige su país: será su **mercado de casa**. Con la experiencia que gana en los puestos consigue **pasajes** y, con cada uno, elige a qué país viajar después (el pasaporte está en la portada). Cada país cambia los cuatro puestos:

| País | La Refresquera | La Frutera | Telar | Puesto de comida |
| --- | --- | --- | --- | --- |
| Bolivia | mocochinchi, api, somó… | achachairú → papaya | El Aguayo (franjas y rombos) | La Salteñera (Bs) |
| Perú | chicha morada, emoliente, quinua… | aguaymanto → zapallo | La Manta cusqueña (ñawi) | La Anticuchería (S/) |
| México | horchata, jamaica, atole… | capulín → sandía | El Sarape de Saltillo | La Taquería ($) |
| Colombia | lulada, aguapanela, avena… | uchuva → papaya | La Mochila wayuu (zigzag) | La Arepería ($) |
| Argentina | mate, tereré, submarino… | arándano → sandía | El Poncho salteño (guarda) | Las Empanadas ($) |
| Brasil | caldo de cana, açaí, guaraná… | jabuticaba → sandía | La Chita (flores) | La Padaria (R$) |
| Estados Unidos | lemonade, root beer, iced tea… | blueberry → pumpkin | The Quilt (retazos) | The Hot Dog Stand (US$) |

- Las bebidas usan siempre los mismos ocho colores de vaso (para que se distingan) y cada una tiene su propio dibujo (`refresquera/iconos.js`, `refresquera/bebidas.js`).
- Cada país tiene su **recetario**, que avanza con los niveles jugados allí.
- Los caseritos llevan sombreros de su lugar y el pasaporte trae un dato cultural de cada país.
- **El saludo** de la portada va en la jerga de cada país: ¡Hola, caserito! (Bolivia), ¡Pase, casero! (Perú), ¡Pásele, marchante! (México), ¡A la orden, veci! (Colombia), ¡Buenas, che! (Argentina), E aí, freguês! (Brasil) y Hey there, neighbor! (Estados Unidos) (`saludo` en `shared/paises.js`).
- **La Casera** es la misma anfitriona en todos los países, pero se viste como las caseras de cada lugar: bombín y aguayo (Bolivia), montera y lliclla (Perú), trenzas con listones y rebozo (México), sombrero vueltiao (Colombia), poncho salteño (Argentina), lenço de chita (Brasil) y gorra con delantal (Estados Unidos) (`shared/marca.js`).
- **Fondos y toldos por país:** Noche, Mercado y Carnaval son de todos; cada país tiene tres fondos con sus paisajes y un toldo propio, y solo se ven y se compran estando allí. Lo comprado en otro país se conserva y vuelve a verse al regresar (`shared/decoracion.js`).
- Cada tejido dice de dónde viene (`telar.origen` en `shared/paises.js`): por ejemplo, el sarape es de Saltillo (Coahuila) y la mochila es wayuu de La Guajira.
- Las franjas de arriba y abajo de cada pantalla usan los colores del tejido del país, en otro orden en cada puesto.
- Datos de los países: `shared/paises.js`. Frutas: `frutera/frutas.js`. Comidas y cocinas: `saltenera/comidas.js`.
- Conviene que alguien de cada país revise nombres, bebidas y dibujos antes de publicar.

## Puestos

| Puesto | Género | Estado |
| --- | --- | --- |
| La Refresquera | ordenar colores | v2 jugable |
| La Frutera | merge | jugable |
| El Aguayo | bloques | jugable |
| La Salteñera | idle | jugable |

### La Refresquera v2

- **Botellas de vidrio** dibujadas en SVG (`refresquera/botella.js`): refresco con volumen, superficie que se mueve, burbujas, brillo del vidrio y chapa que cae al completar un vaso. Al verter, la botella se inclina y cae un chorro del sabor. Tres formas que se eligen en la tienda: botella, frasco y copa.
- **Niveles:** infinitos, con semilla (el nivel N siempre es igual) y con solución comprobada. Los cinco primeros se ganan en menos de un minuto.
- **Vasos especiales** (desde el nivel 9): capas con **hielo** que no muestran su sabor hasta quedar arriba, vaso con **etiqueta** que solo acepta un sabor y vaso **chico** de tres capas. La primera vez se explican con un dibujo.
- **Recetario:** doce refrescos bolivianos (mocochinchi, api, somó, linaza, cebada, copoazú…) que se desbloquean al avanzar y regalan yapa.
- **Modo pedidos:** llegan caseritos pidiendo un sabor. Cada vaso completo de ese sabor se sirve solo y entra uno nuevo mezclado. Se acaba cuando se llena la fila. Lleva la cuenta de la semana y permite **retar a un amigo**.
- **Vaso extra, pistas, deshacer y reiniciar.** Sin yapa, la pista sale gratis viendo un anuncio.

### La Frutera

- Sueltas frutas en el canasto; dos iguales se juntan en una más grande: achachairú, frutilla, limón, tuna, mandarina, durazno, chirimoya, mango, piña y papaya. Dos papayas se venden juntas.
- **Caserito con pedido:** pide una fruta; cuando la formas, se la lleva, te da yapa y deja espacio en el canasto.
- Física propia (`frutera/fisica.js`), sin motor.
- **Ayudas:** cambiar la fruta que vas a soltar y, una vez por partida, despejar el borde para seguir jugando.

### El Aguayo

- Arrastras piezas a un telar de 8×8. Cada fila o columna completa se teje como una franja de aguayo y libera espacio; varias a la vez valen más.
- **Tu aguayo:** las franjas tejidas se van sumando en una tela arriba del telar.
- **Caserito con pedido:** pide una franja de un color; si tejes una línea con al menos la mitad de ese color, se la lleva y te da yapa.
- También se juega tocando: eliges una pieza y tocas la celda donde va.
- **Ayudas:** cambiar las tres piezas y, una vez por partida, piezas nuevas que quepan cuando se traba el telar.

### La Salteñera

- Tocas el horno para sacar salteñas y con lo que vendes compras mejoras: mano rápida, horno, ayudante, carrito, local y receta jugosa.
- **Sigue vendiendo mientras no juegas** (a medio ritmo, hasta 8 horas). Al volver cobras lo vendido, o el doble si eliges ver un anuncio.
- **Caserito con pedido:** quiere salteñas recién hechas; se completan con tus toques y deja propina y yapa.
- **Hitos:** cada vez que tus ventas totales pasan una meta (100, 1.000, 10.000...) ganas yapa.
- **Hora pico:** todo vende el doble por un minuto (yapa o anuncio).

## Álbum del Mercado, sellos, caseritos y fiestas

La cultura se aprende jugando (`shared/cultura.js` tiene el contenido; `shared/album.js`, las reglas; `album/`, la pantalla):

- **Álbum del Mercado:** cada país tiene 15 láminas (Bolivia 19): la palabra del mercado, sus bebidas, tres frutas, el tejido, la comida y la fiesta. Cada lámina tiene un dibujo y un dato breve, y se gana jugando: las bebidas con los niveles de La Refresquera en ese país (las mismas del recetario), las frutas al hacerlas aparecer en La Frutera, el tejido con 10 franjas en el telar, la comida cocinando 50 veces, la palabra al visitar el país y la fiesta jugando durante su semana. Cada lámina nueva da 5 de yapa.
- **Sello del pasaporte:** con 6 láminas de un país se puede sellar su pasaporte respondiendo tres preguntas sobre los datos de esas láminas. Con las tres bien: sello en el pasaporte y 50 de yapa. Se puede volver a intentar.
- **Caseritos con nombre:** en cada país, uno por puesto (por ejemplo, Doña Rosa de El Alto pide api para el frío). Llegan a veces en lugar de un caserito cualquiera y piden lo suyo con una frase que enseña algo; las caseras se dibujan como La Casera de su país.
- **Fiestas del calendario:** Alasitas (Bolivia), Inti Raymi (Perú), Día de Muertos (México), Feria de las Flores (Colombia), Día de la Tradición (Argentina), Festa Junina (Brasil) y Thanksgiving (Estados Unidos, el cuarto jueves de noviembre). Durante la semana de la fiesta la portada la anuncia, llega un caserito de fiesta y se gana su lámina. Para probar: `?fiesta=us` (o el país) en la dirección.
- Todo este contenido está **pendiente de validar** con personas de cada país.

## Contrarreloj (`shared/reloj.js`)

Modo opcional en cada puesto, con su propio récord; el modo normal no cambia:

- **La Refresquera** (pestaña *Contrarreloj*): 90 segundos para ordenar tandas cortas de refrescos, una tras otra. No cuenta para los niveles ni el recetario.
- **La Frutera** y **el telar** (botón *Contrarreloj*): 90 segundos para hacer puntos; si el canasto se llena o el telar se traba, la ronda termina con lo hecho.
- **Puesto de comida**: pedido relámpago de 30 segundos para cocinar todo lo posible.

El reloj se detiene con las ventanas abiertas o la pantalla oculta y pita los últimos cinco segundos. Al final: récord, yapa (según lo hecho, hasta 20, y 10 más si es récord) y la opción de jugar otra vez, volver al modo normal o al mercado.

## Jugar con amigos: salas en vivo (`salas/`, `shared/sala.js`, `nube/src/sala.js`)

- Desde la portada, **Jugar con amigos**: se elige el puesto y se crea una sala con un código de 4 letras (por ejemplo `K7MQ`) para compartir. Entran de 2 a 4 jugadores.
- El anfitrión toca **Empezar**: todos pasan al puesto, ven una cuenta regresiva y juegan el mismo contrarreloj al mismo tiempo, con la **misma semilla** (las mismas frutas, piezas y tandas para todos).
- Arriba se ve el **marcador en vivo** de todos. Al terminar, el ranking: el ganador recibe 15 de yapa y los demás 5 si hicieron algo. Después se vuelve a la sala para otra ronda.
- Servidor: un Durable Object de Cloudflare por sala (con SQLite, incluido en el plan gratis), con WebSockets que hibernan. Las reglas están en `nube/src/sala-logica.js` y se prueban en `tests/salas.test.js`. Una sala dura 3 horas.

## La tienda (`tienda/`)

- **Yapa gratis:** ver un anuncio da 15 de yapa, hasta 5 veces por día.
- **Packs de yapa** (0,99 / 2,99 / 4,99 USD) y **pase sin anuncios** (2,99 USD): quien lo compra recibe la yapa de los anuncios sin verlos.
- **Decoración con yapa:** fondos, toldos y formas de vaso. Solo cambia cómo se ve; nadie paga para ganar.

### Lo que se vende

| Categoría | Con yapa (se gana jugando) | Con dinero |
| --- | --- | --- |
| Paquetes de yapa | — | 150, 500, 1000 y 3000 de yapa |
| Vestimentas y elementos culturales | Sombreros y prendas de cada país (bombín paceño, montera cusqueña, sombrero charro, vueltiao, poncho salteño, rebozo, chita…), que se desbloquean al visitar el país | — |
| Personalización del personaje | Peinados, piel y colores gratis; accesorios y marcos con yapa | — |
| Pasaportes especiales | Portadas andina, de la selva y de carnaval | **Pasaporte viajero**: 2 pasajes y la portada dorada |
| Experiencia y progresión | Doble experiencia 24 h y pasaje extra | **Doble experiencia 7 días** |
| Temporadas y desafíos premium | Premios gratis de la temporada y 3 desafíos por semana | **Pase de temporada**: premios premium (chullo de fiesta, poncho dorado, marco de oro, portada dorada, estrellas) y 2 desafíos más por semana |
| Sin anuncios | — | Pase sin anuncios |

- **Tu caserito** (`perfil/`, `shared/catalogo.js`, `avatar()` en `shared/marca.js`): el personaje del jugador, con las prendas y sombreros que usa La Casera en cada país. Se ve en la portada y en las salas.
- **Temporada** (`temporada/`, `shared/temporada.js`): 20 niveles; la experiencia de los puestos da puntos de temporada y los desafíos de la semana también. Temporada 1: *Fiestas de fin de año* (1 nov 2026 – 31 ene 2027).
- La experiencia y los pasajes solo sirven para subir de nivel y viajar: no cambian los puntajes contra amigos ni los contrarrelojes.
- Productos de Google Play (crear con estos identificadores): `yapa_150`, `yapa_500`, `yapa_1000`, `yapa_3000`, `pase_temporada_t1` (no consumible), `pasaporte_viajero`, `doble_xp_7d`, `sin_anuncios` (no consumible).

### Métodos de pago

| Versión | Cómo se paga | Qué falta para activarlo |
| --- | --- | --- |
| Google Play (`CANAL = 'play'`, acción *Compilar para Google Play*) | Google Play Billing, verificado en el servidor | Cuenta de Play Console, la app en prueba interna, los 4 productos (`yapa_150`, `yapa_500`, `yapa_1000`, `sin_anuncios`) y la cuenta de servicio como secreto `GOOGLE_PLAY_CUENTA` en Cloudflare |
| APK directa (`CANAL = 'directo'`) | Cripto directo a tu billetera, 20 % más barato: USDT, USDC o DAI por Polygon (o USDC y DAI por Base) | Poner `CRIPTO_RED` y `CRIPTO_DIRECCION` (dirección pública) en `nube/wrangler.toml` |
| APK directa | Tarjeta | Una cuenta de Polar o Lemon Squeezy (por hacer) |

- **Cripto:** el jugador envía el monto exacto a tu billetera y pega el hash de la transacción. El servidor revisa en la blockchain que sea el token aceptado, a tu dirección, por el monto correcto, con 5 confirmaciones, y que ese pago no se haya usado antes (tabla `compras`). Nada pasa por intermediarios. DAI no tiene función para congelar direcciones; USDT y USDC sí. Es solo para mayores de edad, y la tienda lo dice.
- **Google Play:** después de comprar, el servidor pregunta a la API de Google Play si el token es real y lo anota para que no se use en otra cuenta. Si el servidor no está configurado o no hay conexión, se confía en lo que dijo Google Play en el celular.
- La compilación para Play (`.github/workflows/play.yml`) genera el AAB firmado con la llave fija (llave de subida), con `VERSION_DE_PRUEBA = false` y compras con Google Play.

### Reglas de dinero

- **Los anuncios solo sirven para ganar yapa y siempre los elige el jugador.** No hay anuncios obligatorios.
- No hay premios en dinero, cajas al azar ni contadores falsos.

## Pasar el progreso

En la portada, **Pasar mi progreso** da un código para copiar en un dispositivo y pegar en otro: lleva la yapa, los puestos y la decoración, sin cuentas ni servidor (`shared/transferir.js`). El código trae una suma de control y no se acepta si está incompleto o alterado.

## Partida en la nube (`nube/` y `shared/nube.js`)

Con la nube activada (`NUBE_URL` en `shared/compilacion.js`), la primera vez que el juego abre con internet se crea una **cuenta anónima**, sin pedir nada al jugador. La partida se sigue guardando en el celular y además se sube sola: como mucho una vez por minuto mientras se juega y al salir del juego. Sin internet todo sigue igual y se sube después.

- **Código de recuperación:** la llave de la cuenta (`QH-XXXXX-XXXXX-XXXXX-XXXXX`, 100 bits). En la portada, **Tu partida en la nube** lo muestra y permite usar uno en otro celular. También acepta los códigos `QHATU1-…` de antes.
- **Dos celulares con la misma cuenta:** cada guardado lleva versión; si otro celular guardó antes, queda la partida con más experiencia (y, si empatan, la jugada más recientemente).
- **Vincular con Google:** el servidor ya verifica los tokens de Google (`/v1/google/vincular` y `/v1/google/entrar`); falta el botón en la app, que se activa cuando haya un ID de cliente de Google (`GOOGLE_CLIENT_ID` en `nube/wrangler.toml`).
- El servidor guarda solo la huella SHA-256 de cada llave, limita los pedidos por IP y rechaza partidas de más de 100 KB.

**Servidor** (`nube/`): un Worker de Cloudflare con una base D1. `esquema.sql` crea las tablas, `src/servidor.js` tiene las rutas (`POST /v1/cuenta`, `GET`/`PUT /v1/partida`, Google y `/v1/salud`) y `src/index.js` es la entrada. Para probarlo en tu computadora: `cd nube && npm install && npx wrangler d1 execute qhatu --local --file esquema.sql && npx wrangler dev`.

**Publicarlo** (gratis hasta 100 000 pedidos por día):

1. Crear una cuenta en Cloudflare y abrir una vez **Workers & Pages** para elegir tu subdominio `workers.dev`.
2. Crear un token en **My Profile → API Tokens → Create Token → Edit Cloudflare Workers**, y agregarle el permiso **Account · D1 · Edit**.
3. En GitHub, **Settings → Secrets and variables → Actions**, guardar `CLOUDFLARE_API_TOKEN` (el token) y `CLOUDFLARE_ACCOUNT_ID` (el Account ID que aparece en el panel de Cloudflare).
4. Ejecutar la acción **Publicar la nube**. Crea la base, aplica el esquema, publica y muestra la dirección del servidor.
5. Poner esa dirección en `NUBE_URL` y compilar la APK.

## Nivel de cada puesto

Atender caseritos da experiencia al puesto. Al subir de nivel hay papel picado y un regalo de yapa. La portada muestra el nivel y el avance de cada puesto (`shared/progreso.js`).

## Lo que comparten todos los puestos (`shared/`)

| Archivo | Qué hace |
| --- | --- |
| `almacen.js` | Guardado en el dispositivo: yapa, racha, regalo diario y progreso de cada puesto |
| `i18n.js` | Textos en español, inglés y portugués |
| `anuncios.js` | Una sola interfaz para CrazyGames, Poki y el sitio propio |
| `sonido.js` | Sonidos sintetizados con Web Audio, sin archivos |
| `marca.js` | Toldo, logo (sin letras), La Casera y caseritos en SVG |
| `ui.js` | Avisos, ventanas y contador de yapa |
| `qhatu.css` | Colores de la marca (los refrescos del mercado) y componentes |
| `progreso.js` | Nivel y experiencia de cada puesto |
| `decoracion.js` | Fondos, toldos y vasos que se compran con yapa |
| `compras.js` | Packs de yapa y pase sin anuncios (Google Play Billing) |
| `compilacion.js` | Versión de prueba o de tienda, canal, Unity Ads y servidor |
| `compartir.js` | Retar a un amigo (Telegram, menú de Android o portapapeles) |
| `transferir.js` | Código para pasar el progreso a otro dispositivo |
| `nube.js` | Cuenta anónima, subida de la partida y código de recuperación |
| `cultura.js` | Contenido cultural: láminas, caseritos con nombre y fiestas de cada país |
| `sala.js` | Salas en vivo: conexión, cuenta regresiva, marcador y resultado |
| `catalogo.js` | Artículos con yapa: vestimentas, personalización, portadas de pasaporte e impulsos |
| `temporada.js` | Temporadas: niveles, premios gratis y premium, y desafíos de la semana |
| `reloj.js` | Contrarreloj de los puestos: cuenta regresiva, barra de tiempo, récord y yapa |
| `album.js` | Reglas del álbum, del sello del pasaporte, de los caseritos con nombre y de las fiestas |
| `dibujos-fiesta.js` | Dibujo de cada fiesta |
| `tejidos.js` | Dibujo del tejido de cada país (aguayo, manta, sarape, mochila, poncho, chita, quilt) |
| `plataforma.js` | Mini app de Telegram |
| `nativo.js` | Acceso a los complementos de la app Android |
| `puesto.css` | Barra de arriba, mesa y botones de abajo de cada puesto |

Reglas del mercado que el código respeta:

- Los anuncios solo son para ganar yapa y siempre los elige el jugador: no hay anuncios obligatorios.
- Todo lo que se compra con yapa también se gana jugando.
- Sin cajas de premios al azar ni contadores falsos.

## Desarrollo

```bash
npm run dev     # sirve el sitio en http://localhost:8080
npm test        # pruebas de la lógica (node:test, sin dependencias)
node scripts/revisar-pantallas.cjs   # con npm run dev abierto: 7 países × 6 pantallas × 3 anchos
```

En pantallas angostas, el nombre del puesto achica la letra y, si no alcanza, pasa a su propia fila: nunca se corta con puntos suspensivos.

Parámetros útiles en la URL:

- `?portal=crazygames` o `?portal=poki`: carga el SDK de ese portal.
- `?anuncios=demo`: simula un anuncio con recompensa en el sitio propio.
- `?compras=demo`: simula las compras de la tienda sin cobrar.
- `?tg=1`: abre como mini app de Telegram.

## Publicar

- **Sitio Qhatu:** la raíz del repositorio es un sitio estático. Se sube tal cual a Cloudflare Pages o Vercel. Se instala en el celular como app web (`manifest.webmanifest` y `sw.js`). Al publicar cambios, sube `VERSION` en `sw.js`.
- **Portales:** `npm run empaquetar` arma `dist/refresquera-crazygames.zip` y `dist/refresquera-poki.zip`, con `index.html` en la raíz y el SDK de cada portal activado.

## App Android (APK)

La app es el mismo código web empaquetado con Capacitor; no se reescribe nada.

- **Desde GitHub:** cada push compila la APK en GitHub Actions (`.github/workflows/apk.yml`) y la publica suelta en el release **apk-prueba**: `https://github.com/agucc/qhatu/releases/download/apk-prueba/qhatu.apk`.
- **Prueba en emulador:** el flujo *Probar APK en emulador* (manual) instala la APK en un Android 14, abre cada pantalla y deja en el registro el estado de la página y los errores.
- **En tu computadora** (con el SDK de Android): `npm install` y `npm run android:apk`.

**Logo:** sin letras: el toldo del mercado sobre cuatro casillas, una por puesto (refresco, fruta, tejido y comida). El dibujo está en `icono.svg`; los íconos de Android y la pantalla de carga se generan con `node scripts/iconos.cjs`.

El identificador de la app es `bo.qhatu.mercado` (en `capacitor.config.json`). Se puede cambiar hasta que se publique en Google Play; después queda fijo.

**Firma fija:** con los secretos `QHATU_KEYSTORE_BASE64` (la llave `.jks` en base64) y `QHATU_KEYSTORE_PASSWORD`, todas las APK se firman con la misma llave (alias `qhatu`) y cada versión nueva se instala encima de la anterior sin borrar la partida. El número de versión sube solo en cada compilación. La misma llave sirve como llave de subida para Google Play. La llave nunca va en el repositorio (`*.jks` está en `.gitignore`); si se pierde, Google Play permite cambiar la llave de subida, pero las APK ya instaladas fuera de Play habría que desinstalarlas.

### Antes de publicar en Google Play

1. **`shared/compilacion.js`:** poner `VERSION_DE_PRUEBA = false`. En la versión de prueba las compras se simulan sin cobrar y los anuncios son de prueba.
2. **Unity Ads** (complemento propio `AnunciosUnity`, SDK `com.unity3d.ads:unity-ads`, sin AdMob): crear el proyecto en el panel de Unity (Monetization), copiar el *Game ID* de Android en `UNITY_GAME_ID` y el bloque con recompensa en `UNITY_RECOMPENSA` (`shared/compilacion.js`). Unity Ads está en la lista de SDK certificados para Familias de Google Play. Los cobros llegan en dólares por Tipalti.
3. **Compras** (`@capgo/native-purchases`, Google Play Billing): en Play Console crear los productos integrados `yapa_150`, `yapa_500`, `yapa_1000` (consumibles) y `sin_anuncios` (no consumible). Cuando existen, la tienda los usa con el precio de Play; el pase sin anuncios se recupera solo al reinstalar.
4. Firmar la APK o el AAB de publicación con tu propia clave (la APK de prueba es *debug*).

## Telegram (mini app)

Los mismos juegos funcionan como mini app de Telegram (`shared/plataforma.js`): pantalla completa, colores del mercado y botón atrás de Telegram. Retar a un amigo comparte por Telegram. Para activarla, con [@BotFather](https://t.me/BotFather): crear un bot (`/newbot`) y luego la mini app (`/newapp`) con la dirección del sitio publicado. También se puede abrir cualquier página con `?tg=1` para probar.

## Estructura

```
index.html, portal.js, portal.css   portada del mercado
refresquera/                        primer puesto
  logica.js                         reglas, niveles, solucionador y pistas (puro)
  pedidos.js                        modo pedidos (puro)
  sabores.js                        colores y símbolos
  botella.js                        dibujo de botellas, frascos y copas (SVG)
  recetario.js                      los doce refrescos coleccionables
  juego.js                          pantalla, yapa y anuncios
frutera/                            segundo puesto
  fisica.js                         caída, choques y uniones (puro)
  frutas.js                         las diez frutas y cómo se dibujan
  juego.js                          canasto, controles y pedidos
aguayo/                             tercer puesto
  logica.js                         piezas, telar y franjas (puro)
  juego.js                          telar, arrastrar piezas y pedidos
saltenera/                          cuarto puesto
  logica.js                         mejoras, ventas fuera del juego, hitos y pedidos (puro)
  juego.js                          horno, mejoras y hora pico
tienda/                             yapa por anuncios, compras y decoración
album/                              Álbum del Mercado y sello del pasaporte
salas/                              Jugar con amigos (salas en vivo)
perfil/                             Tu caserito: vestimentas y personalización
temporada/                          Temporada: premios y desafíos
nube/                               servidor de partidas en Cloudflare (Worker + D1)
shared/                             código base de todos los puestos
scripts/empaquetar.mjs              zips para portales
scripts/web.mjs                     copia el juego a www/ para la app
android/                            proyecto Android (Capacitor)
shared/fuentes/                     Chango y Figtree incluidas (licencia OFL)
tests/                              pruebas
```

# qhatu

**El mercado de juegos.** Cada juego es un puesto. Todo se paga con yapa.

Qhatu es un mercado boliviano de juegos casuales hecho en HTML5 y JavaScript, sin motor ni dependencias. La portada es el mercado: tocas un puesto y juegas al instante, sin descargar ni registrarte.

## Puestos

| Puesto | Género | Estado |
| --- | --- | --- |
| La Refresquera | ordenar colores | v2 jugable |
| La Frutera | merge | jugable |
| El Aguayo | bloques | jugable |
| La Salteñera | idle | jugable |

### La Refresquera v2

- **Niveles:** infinitos, con semilla (el nivel N siempre es igual) y con solución comprobada. Los cinco primeros se ganan en menos de un minuto.
- **Modo pedidos:** llegan caseritos pidiendo un sabor. Cada vaso completo de ese sabor se sirve solo y en su lugar entra un vaso nuevo mezclado. La partida termina cuando se llena la fila.
- **Vaso extra:** se paga con yapa o viendo un anuncio con recompensa.
- **Pistas, deshacer y reiniciar.**
- **Símbolos por sabor:** cada refresco tiene un ícono además del color.

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

## La tienda (`tienda/`)

- **Yapa gratis:** ver un anuncio da 15 de yapa, hasta 5 veces por día. El anuncio siempre lo elige el jugador.
- **Packs de yapa** (0,99 / 2,99 / 4,99 USD) y **quitar anuncios** (2,99 USD), como en el plan. La compra real pasa por Google Play (`shared/compras.js` espera un complemento `QhatuCompras`); mientras la app no esté publicada, la versión de prueba simula la compra sin cobrar y lo dice en pantalla. En el sitio y los portales no se vende.
- **Decoración con yapa:** fondos, toldos y vasos. Solo cambia cómo se ve; nadie paga para ganar.
- Sin premios en dinero, sin cajas al azar y sin contadores falsos.

## Nivel de cada puesto

Atender caseritos da experiencia al puesto. Al subir de nivel hay papel picado y un regalo de yapa. La portada muestra el nivel y el avance de cada puesto (`shared/progreso.js`).

## Lo que comparten todos los puestos (`shared/`)

| Archivo | Qué hace |
| --- | --- |
| `almacen.js` | Guardado en el dispositivo: yapa, racha, regalo diario y progreso de cada puesto |
| `i18n.js` | Textos en español, inglés y portugués |
| `anuncios.js` | Una sola interfaz para CrazyGames, Poki y el sitio propio |
| `sonido.js` | Sonidos sintetizados con Web Audio, sin archivos |
| `marca.js` | Toldo, logo, La Casera y caseritos en SVG |
| `ui.js` | Avisos, ventanas y contador de yapa |
| `qhatu.css` | Colores de la marca (los refrescos del mercado) y componentes |
| `progreso.js` | Nivel y experiencia de cada puesto |
| `decoracion.js` | Fondos, toldos y vasos que se compran con yapa |
| `compras.js` | Packs de yapa y quitar anuncios |
| `puesto.css` | Barra de arriba, mesa y botones de abajo de cada puesto |

Reglas del mercado que el código respeta:

- Un anuncio obligatorio como máximo cada tres niveles, nunca en medio de una partida ni en los cinco primeros niveles.
- Todo lo que se compra con yapa también se gana jugando.
- Sin cajas de premios al azar ni contadores falsos.

## Desarrollo

```bash
npm run dev     # sirve el sitio en http://localhost:8080
npm test        # pruebas de la lógica (node:test, sin dependencias)
```

Parámetros útiles en la URL:

- `?portal=crazygames` o `?portal=poki`: carga el SDK de ese portal.
- `?anuncios=demo`: simula un anuncio con recompensa en el sitio propio.

## Publicar

- **Sitio Qhatu:** la raíz del repositorio es un sitio estático. Se sube tal cual a Cloudflare Pages o Vercel. Se instala en el celular como app web (`manifest.webmanifest` y `sw.js`). Al publicar cambios, sube `VERSION` en `sw.js`.
- **Portales:** `npm run empaquetar` arma `dist/refresquera-crazygames.zip` y `dist/refresquera-poki.zip`, con `index.html` en la raíz y el SDK de cada portal activado.

## App Android (APK)

La app es el mismo código web empaquetado con Capacitor; no se reescribe nada.

- **Desde GitHub:** cada push compila la APK en GitHub Actions (`.github/workflows/apk.yml`) y la publica suelta en el release **apk-prueba**, siempre en el mismo link: `https://github.com/agucc/qhatu/releases/download/apk-prueba/qhatu.apk`.
- **En tu computadora** (con Android Studio o el SDK de Android instalado):

```bash
npm install
npm run android:apk   # deja la APK en android/app/build/outputs/apk/debug/app-debug.apk
```

`npm run android:sync` copia los cambios del juego a la app sin compilar; después se puede abrir `android/` en Android Studio.

El identificador de la app es `bo.qhatu.mercado` (en `capacitor.config.json`). Se puede cambiar hasta que se publique en Google Play; después queda fijo.

## Estructura

```
index.html, portal.js, portal.css   portada del mercado
refresquera/                        primer puesto
  logica.js                         reglas, niveles, solucionador y pistas (puro)
  pedidos.js                        modo pedidos (puro)
  sabores.js                        colores y símbolos
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
shared/                             código base de todos los puestos
scripts/empaquetar.mjs              zips para portales
scripts/web.mjs                     copia el juego a www/ para la app
android/                            proyecto Android (Capacitor)
shared/fuentes/                     Chango y Figtree incluidas (licencia OFL)
tests/                              pruebas
```

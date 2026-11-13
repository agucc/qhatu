# Entrega P0 y P1 · Especificación definitiva de mejoras

Base: versión `32458e6` y la especificación del 13/11/2026. Regla seguida: no rehacer, no borrar contenido ni progreso.

## P0 · Diagnóstico

- Estructura: HTML5 + JavaScript (módulos, sin motor) empaquetado para Android con Capacitor 8.
- Los países y su contenido ya estaban separados en datos (`shared/paises.js`, `refresquera/bebidas.js`, `frutera/frutas.js`, `saltenera/comidas.js`); la lógica de cada minijuego es una sola para los siete países.
- Guardado: `localStorage` (`qhatu.v1`) con yapa, XP por puesto, países, pasajes, racha, recetas y mejoras; copia en la nube opcional (Cloudflare).
- Pruebas automáticas antes de empezar: 66 aprobadas.

## P1 · Cambios

| Área | Cambio | Archivos |
| --- | --- | --- |
| Móvil | Los nombres largos de los puestos ya no se cortan: la letra se ajusta y, si no alcanza, el nombre pasa a su propia fila | `shared/plataforma.js`, `shared/puesto.css` |
| Móvil | Cabecera de la portada sin desbordes en 320 px; EE. UU. con nombre corto en el chip | `portal.css`, `portal.js`, `shared/paises.js` |
| Móvil | Franjas decorativas con los colores del tejido de cada país, distintas en cada pantalla | `shared/decoracion.js`, `shared/qhatu.css` |
| Cultura | La Casera vestida según el país | `shared/marca.js`, `portal.js`, `shared/ui.js` |
| Cultura | Fondos: Titicaca, Cerro Rico y Yungas solo en Bolivia; tres fondos propios por país | `shared/decoracion.js`, `tienda/tienda.js`, `shared/i18n.js` |
| Cultura | Toldos: Salar y Kantuta solo en Bolivia; un toldo propio por país | `shared/decoracion.js` |
| Cultura | Bolivia: chicha camba (sin alcohol, Santa Cruz) en lugar de chicha morada | `refresquera/bebidas.js` |
| Cultura | Procedencia de cada tejido (Saltillo, La Guajira, Salta, Cusco…) en la portada y la ayuda del telar; los textos ya no dicen "aguayo" en todos los países | `shared/paises.js`, `aguayo/juego.js`, `portal.js`, `shared/i18n.js` |

## Guardado y compatibilidad

- No cambió el esquema de guardado. Los identificadores se mantienen (la chicha camba conserva el id `chicha`, así el recetario no pierde avance).
- Si el jugador tenía puesto un fondo o toldo de otro país, se ve el básico mientras está fuera de ese país; la compra no se pierde.

## Pruebas

| ID | Resultado |
| --- | --- |
| QA-01 Inicio y carga | Aprobado: las 126 pantallas cargan (`scripts/revisar-pantallas.cjs`) |
| QA-02 Cambio de país | Aprobado: título del telar, puesto de comida, moneda, La Casera, fondo y toldo cambian sin residuos al viajar y al volver |
| QA-03 a QA-06 Mecánicas | Aprobado en pruebas automáticas (`npm test`: 70) y en la prueba del emulador Android |
| QA-07 Economía | Sin cambios de precios ni recompensas |
| QA-08 Guardado | Aprobado: se conservan compras y progreso al viajar |
| QA-09 Actualización | Sin migración necesaria; la firma fija de la APK permite instalar encima (falta cargar los secretos) |
| QA-10 Pantallas | Aprobado en 320, 360 y 412 px: sin textos cortados ni desbordes |
| QA-11 Sin conexión | Sin cambios; la nube sigue siendo opcional |
| QA-12 APK Android | Prueba en emulador al subir los cambios |

## Pendiente de validación cultural

- Sombreros de cada país (uso regional).
- Vestuario de La Casera por país (es una propuesta de diseño).
- Nombres de los fondos y toldos nuevos.
- Bebidas y frutas repetidas entre países: se mantienen mientras sean auténticas (la especificación prioriza autenticidad sobre exclusividad).
- Poncho salteño: el dibujo es rojo y negro; en el telar se juega con cinco colores por legibilidad.

## Después de la entrega

- Saludo de la portada en la jerga de cada país (pendiente de validar con personas de cada país).
- Botón **Volver al mercado** al completar un nivel de La Refresquera, al terminar los pedidos y al terminar una partida de La Frutera y El Aguayo. El avance se guarda antes de salir.
- Arreglado: el botón "Retar" al terminar una partida de El Aguayo fallaba.

## Cultura para aprender (Álbum, sellos, caseritos y fiestas)

Contenido nuevo, todo **pendiente de validar** con personas de cada país (`shared/cultura.js`):

- 21 datos de frutas (3 por país), 7 de comidas, 7 de tejidos, 7 palabras del mercado y 7 fiestas.
- 28 caseritos con nombre (uno por puesto y país) y 7 caseritos de fiesta, con frase en tres idiomas.
- Fechas de las fiestas: Alasitas 24 ene – 8 feb; Inti Raymi 20–26 jun; Día de Muertos 28 oct – 2 nov; Feria de las Flores 1–12 ago; Día de la Tradición 5–15 nov; Festa Junina todo junio; Thanksgiving la semana del cuarto jueves de noviembre.

Recompensas (cambio de balance aprobado al pedir estas funciones): 5 de yapa por lámina y 50 por sello.

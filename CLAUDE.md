# Vida productiva

Tablero personal de hábitos diarios. Una sola pantalla: registras en qué se te
fue el día, un manómetro muestra tu porcentaje de vida productiva y una franja de
veinticuatro horas muestra cuántas te quedaron libres. Uso personal, un solo
usuario, sin cuentas ni servidor.

## Cómo correrlo

No hay build, ni npm, ni dependencias. Es HTML, CSS y JavaScript plano.

Para probar en local (hace falta un servidor, ver "Restricciones"):

```bash
node servidor.js
# luego abrir http://localhost:8000
```

En el equipo de Sebastián no hay Python, solo el atajo del Microsoft Store, así
que `python3 -m http.server` no sirve. `servidor.js` es Node puro sin
dependencias y solo existe para probar: no se despliega con la app.

No está publicada en ningún lado. En el celular quedó instalada como PWA desde
`http://localhost:8000`, con `adb reverse tcp:8000 tcp:8000` redirigiendo el
puerto por USB. Chrome trata `localhost` como contexto seguro aunque sea `http`,
así que instala la app y activa el service worker; después funciona desconectada,
sirviendo todo desde el caché.

Para actualizar el celular: subir `CACHE` en `sw.js`, correr `celular.cmd` con el
cable puesto, y abrir la app **dos veces** (la primera descarga el service worker
nuevo, la segunda ya muestra el cambio).

Si algún día hace falta soltarla del cable, GitHub Pages sirviendo la raíz del
repo. Los datos siguen siendo locales de todos modos.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app entera: markup, estilos y lógica en un solo archivo. |
| `sw.js` | Service worker. Cachea todo para que abra sin internet. |
| `manifest.webmanifest` | Permite instalarla en la pantalla de inicio. |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` | Íconos. El dibujo es el mismo manómetro de la app. |
| `servidor.js` | Servidor estático para probar en local. No es parte de la app. |
| `celular.cmd` | Redirige el puerto por USB y arranca el servidor, para actualizar el celular. |

## Restricciones que no se pueden romper

- **Sin frameworks ni build.** Nada de React, Vue, bundlers ni `npm install`.
  Debe seguir siendo editable abriendo un archivo. Si una función necesita una
  librería, primero propón la alternativa a mano.
- **Los datos viven solo en `localStorage`**, bajo la clave `vida-productiva-v1`.
  No hay backend y no se debe agregar uno. La clave nunca ha cambiado: los campos
  nuevos (`paginas`, `libro`, `libros`) llegan vacíos si no estaban, y `migrar()`
  convierte al vuelo lo que quedó del formato viejo (`opciones` → `minimo` y
  `objetivo`, y un número suelto → `[{m:n}]`). La migración conserva los puntajes
  exactos, así que el historial no cambia de valor. Si vuelves a tocar el formato,
  amplía `migrar()`; no cambies la clave.
- **No funciona abierta con `file://`.** Chrome en Android bloquea `localStorage`
  en archivos locales y los service workers exigen `https`. Siempre probar con un
  servidor.
- **Al cambiar `index.html`, subir la versión de `CACHE` en `sw.js`**
  (`vida-productiva-v1` → `v2`, etc). Si no, el celular sigue mostrando la versión
  vieja cacheada y parece que el cambio no se aplicó. Este es el error más común.
- **Fechas siempre en hora local.** Usar el helper `claveFecha()`, nunca
  `toISOString()`: eso da UTC y en Colombia (UTC-5) desplaza el día cinco horas.

## Lógica de puntaje

Cada hábito tiene `puntos`, que definen cuánto pesa en el porcentaje. Los siete
hábitos por defecto suman 100, así que el porcentaje coincide con los puntos,
pero eso es casualidad y el código no lo asume: siempre divide entre el total
real. Si agregas o borras hábitos desde "Editar hábitos" el total cambia y el
porcentaje se sigue calculando bien.

Dos tipos de hábito, y la diferencia es si la actividad dura o no:

- `check` — o lo hiciste o no, sin duración (agua, comidas). Da todos sus puntos
  o ninguno, y solo vale `valor === true`.
- `tiempo` — se registra con bloques de hora. Tiene `minimo` y `objetivo` en
  minutos. Al llegar al mínimo ganas la mitad de los puntos, al objetivo los ganas
  todos, y en medio se reparten linealmente. Por debajo del mínimo reparte desde
  cero, para que quince minutos sueltos también sumen algo.

Las pastillas de 15/20/30 minutos ya no existen: un hábito con duración se anota
con hora de inicio y fin, y de ahí salen los minutos.

Un día cuenta para la **racha** si su porcentaje llega o supera `meta`
(configurable, por defecto 80). La racha se cuenta hacia atrás desde hoy; si hoy
todavía no llega a la meta, empieza a contar desde ayer, para no romperla a las
8 de la mañana. El bucle tiene tope de 3650 vueltas: `meta` llega acotada por
`acotarMeta()` entre 40 y 100, pero una copia corrupta con `meta: 0` colgaba la
pantalla y el tope evita que vuelva a pasar.

## El día como presupuesto

Veinticuatro horas. Cada bloque que registras las consume, y lo que queda son las
**horas libres** — el número que de verdad importa para decidir en qué invertir.

Un bloque vive dentro del hábito, en el registro del día:

```js
estado.registro["2026-09-02"] = {
  h1: true,                              // check
  h3: [{d:"07:30", h:"09:00"}],          // tiempo: lista de bloques
  h7: [{d:"22:00", h:"07:00"}]           // cruza medianoche: son 9 horas
}
```

Reglas que no son obvias:

- **`hasta` menor que `desde` significa que cruza medianoche**, no que está mal.
  Dormir es el caso normal. `minutosBloque()` suma 1440 cuando pasa.
- El bloque pertenece al día en que lo anotas, aunque termine al otro día. Es lo
  que hace que dormir 10pm–7am descuente del presupuesto del día que lo registras.
- Para pintar la franja, `tramosDe()` parte en medianoche los que cruzan, y cada
  tramo se lleva su bloque. Si no los emparejas, las etiquetas se corren.
- `hayCruces()` avisa si dos bloques se pisan, porque ahí las horas libres mienten.
  Avisa nomás: no corrige ni bloquea nada.
- Los bloques `{m:30}` son minutos sin hora, de la versión de pastillas. Suman en
  el puntaje y en el presupuesto, pero no se pueden dibujar en la franja.

**Dormir es un hábito de tiempo, no un check.** Ocupa nueve horas del día; si
fuera de sí-o-no no entraría al presupuesto y las horas libres saldrían mal.

## Lectura

Aparte de los hábitos hay un libro en curso, en `estado.libro`:

```js
{titulo:"Cien años de soledad", paginas:471, desde:"2026-09-02"}
```

`estado.paginas` guarda, por día, **en qué página quedaste** — no cuántas leíste.
Las páginas de un día son la resta con el último día anotado antes de ese. Los
libros terminados se van a `estado.libros`.

Dos reglas que no son obvias:

- `paginaPrevia()` solo mira días desde `libro.desde`. Al cambiar de libro la
  numeración vuelve a empezar en uno, y sin ese corte el libro nuevo heredaría la
  página del viejo.
- Al empezar un libro distinto se borran las páginas anotadas de ese día en
  adelante, porque son del anterior. Terminar un libro y empezar otro el mismo
  día es el caso que rompía esto.

El avance en páginas **no** entra en el porcentaje del día. El hábito "Leer" se
marca por minutos como cualquier otro; la página es aparte, para saber dónde
quedaste.

## Diseño

El concepto es un **tablero de indicadores industrial**, no un tracker genérico.
De ahí salen el manómetro con aguja (en vez del anillo de progreso de siempre) y
el semáforo verde/ámbar/rojo. Manténlo.

Tokens, definidos en `:root`:

```
--papel  #E9EFE8   fondo
--blanco #FBFDFA   superficies
--tinta  #16302B   texto y aguja
--suave  #5F7268   texto secundario
--linea  #CFDCCE   bordes y arco vacío
--vacio  #DDE7DC   días sin registro
--verde  #2E9E5B   cumple la meta
--ambar  #EFA229   va a medias
--rojo   #DB4B36   por debajo
```

Tipografía: Bricolage Grotesque para el número grande, los títulos y la racha;
Inter para todo lo demás. Se cargan de Google Fonts con `@import`; si no hay red,
caen a la fuente del sistema y no pasa nada.

Principios al agregar cosas:

- El número grande es el héroe. Todo lo demás va callado alrededor. Las horas
  libres van justo debajo de la franja, en segundo lugar y sin competir.
- La franja de 24 horas es monocroma a propósito: lo registrado en `--tinta`
  sobre `--vacio`. El semáforo es solo para cumplir la meta; si cada actividad
  tuviera color, los verdes y rojos dejarían de querer decir algo.
- El calendario es un mes real, con la semana empezando el lunes. El color del
  día sale del mismo semáforo, con el alfa marcando qué tan completo estuvo; el
  número encima pasa a claro cuando el fondo pesa. Los colores se leen de
  `:root` con `token()`, no se repiten en el JavaScript.
- Filas planas separadas por líneas de un píxel. **No** tarjetas con sombra.
- Movimiento solo como respuesta a algo que hizo el usuario. Nada de animaciones
  de entrada. Respetar `prefers-reduced-motion`.
- Sin etiquetas en mayúsculas sostenidas ni eyebrows sobre cada título.

## Convenciones de código

- Variables, funciones y comentarios en español. El código ya está así.
- JavaScript plano, ES5-ish, sin módulos. Todo en el `<script>` de `index.html`.
- Delegación de eventos en el contenedor (`#lista`, `#rejilla`, `#editor`), no un
  listener por botón: esas secciones se redibujan enteras en cada `render()`.
- El manómetro **no** se redibuja; `render()` solo actualiza los atributos del
  `<path>` y la `<line>`. Si lo recreas, se pierden las transiciones CSS.
- El bloque del libro tampoco se redibuja: su markup está en el HTML y
  `renderLectura()` solo cambia valores. El campo de la página no se toca si lo
  tienes enfocado, porque `render()` corre en cada clic y te borraría lo escrito.
- Todo lo que venga del usuario pasa por `escapar()` antes de entrar a `innerHTML`.
- Después de tocar `estado`, llamar `guardar()` y luego `render()`.

## Estado actual

Funciona y está probado: bloques de tiempo, presupuesto del día con horas libres,
puntaje, racha, calendario por mes, avance de lectura en páginas, edición de
hábitos, exportar e importar copia de seguridad, y la migración desde el formato
de pastillas.

Ideas pendientes, sin empezar:

- Ver a qué se van las horas libres a lo largo de la semana, para elegir el rato
  fijo donde meter lo nuevo. Es la continuación natural del presupuesto.
- Recordatorio a una hora fija (requiere permiso de notificaciones y el service
  worker; en iOS solo funciona si la app está instalada).
- Meta distinta entre semana y fin de semana.
- Ver el ritmo de lectura: páginas por día, cuánto falta para terminar el libro.

Descartado: empaquetarla como APK. No va a la tienda, así que se queda como PWA.

## Qué no hacer

- No agregues analítica, cuentas, sincronización en la nube ni telemetría.
- No conviertas esto en una SPA con router. Es una pantalla.
- No metas dependencias para resolver algo que se hace en veinte líneas.
- No cambies la clave de `localStorage` sin escribir una migración: ahí está todo
  el historial y no hay respaldo automático.

# Vida productiva

Tablero personal de hábitos. Anotas en qué se te fue el día, el manómetro sube y
la app te dice cuántas horas te sobraron.

![Ícono](icon-192.png)

## Probarlo en el computador

```bash
node servidor.js
```

Abre `http://localhost:8000`. Hace falta el servidor: abriendo el archivo con
doble clic, Chrome bloquea el guardado y la app no recuerda nada.

`servidor.js` son sesenta líneas de Node sin dependencias, solo para probar. No
es parte de la app: si publicas la carpeta en cualquier lado, ese archivo sobra.

## En el celular

Ya está instalada, por USB, sin publicar nada en internet. Funciona así: `adb`
redirige el puerto 8000 del celular al del computador, entonces el celular ve la
app en `http://localhost:8000`. Chrome trata `localhost` como sitio seguro
aunque sea `http`, y por eso deja instalarla y activar el modo sin internet.

Una vez instalada **ya no necesita el computador**: el service worker guardó todo
y la app abre sola, desconectada.

### Actualizarla después de un cambio

1. Sube la versión de `CACHE` en `sw.js`. Sin esto el celular sigue mostrando
   lo viejo y parece que el cambio no sirvió.
2. Conecta el celular por USB y ejecuta:

   ```bash
   celular.cmd
   ```

   Redirige el puerto y arranca el servidor.
3. Abre la app en el celular **dos veces**. La primera descarga el service worker
   nuevo; la segunda ya muestra la versión nueva. Es así por diseño: la app abre
   desde el caché para que funcione sin internet.

Si algún día quieres soltarla del computador del todo, súbela a GitHub Pages
(gratis, sirviendo la raíz del repo). Sigue siendo local: el sitio solo entrega
los archivos y tus datos nunca salen del teléfono. La ventaja es que se instala y
se actualiza sin cable, y no depende de que el caché sobreviva.

En iPhone tendría que ser por Safari → compartir → Añadir a pantalla de inicio, y
ahí sí hace falta `https`: el truco del cable no aplica.

## Tus datos

Se quedan en el navegador del teléfono. No viajan a ningún servidor y nadie más
los ve. Pero si borras los datos de navegación de Chrome, desaparecen — y como la
app está instalada desde `localhost`, no habría de dónde volver a bajarla sin
conectar el cable otra vez.

Por eso están los botones **Descargar copia** y **Restaurar copia** abajo de la
pantalla. Baja una copia de vez en cuando, y siempre antes de cambiar de teléfono.

## Qué hay en la pantalla

**El manómetro** con el porcentaje del día y la racha arriba a la derecha.

**La franja del día.** Veinticuatro horas. Lo que registraste se pinta oscuro y
lo que queda en claro son tus **horas libres**: el hueco donde de verdad cabe algo
nuevo. Los huecos se ven en su hora, así que sabes si tienes la tarde o la noche.

**Los hábitos.** Vienen siete: comidas sanas, ejercicio, leer, meditar, aprender
algo nuevo, agua y dormir. Los que duran se anotan con hora de inicio y fin —
"leí de 7:30 a 9:00"— y puedes poner varios bloques al día. Los que no duran, como
el agua, siguen con un botón de Marcar.

No están fijos: con **Editar hábitos** los renombras, les cambias el ícono, los
borras o agregas los que quieras.

**El libro que estás leyendo.** Anotas en qué página quedaste y la app calcula
cuántas leíste ese día y cuánto llevas del libro. Cuando lo terminas queda en la
lista y empiezas otro.

**El calendario del mes**, con los meses anteriores a un toque. Cada día se pinta
según qué tan completo estuvo. Toca cualquiera para revisarlo o completarlo.

## Cómo se calcula el porcentaje

Cada hábito pesa unos puntos, editables. Los de sí-o-no dan todo o nada. Los que
se miden por tiempo tienen un mínimo y un objetivo en minutos: al llegar al mínimo
ganas la mitad de los puntos y al objetivo, todos. El porcentaje son los puntos
ganados sobre el total posible.

Dormir cuenta como cualquier otro bloque. Si duermes nueve horas te quedan quince
de día, y eso es justo lo que la franja te muestra.

Un día cuenta para la racha si llega a la meta diaria (80% por defecto, ajustable
con el deslizador).

Las páginas del libro no suman al porcentaje. "Leer" se marca por minutos como
todo lo demás; la página es solo para saber dónde quedaste.

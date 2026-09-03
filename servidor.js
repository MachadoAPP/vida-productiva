/* Servidor local para probar la app. Node puro, sin dependencias.
   Hace falta porque Chrome bloquea localStorage y los service workers
   cuando el archivo se abre con file://.

   Uso:  node servidor.js        (luego abrir http://localhost:8000)  */

var http = require("http");
var fs   = require("fs");
var path = require("path");

var PUERTO = Number(process.argv[2]) || 8000;
var RAIZ = __dirname;

var TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".md":   "text/plain; charset=utf-8"
};

http.createServer(function(pet, res){
  var ruta = decodeURIComponent(pet.url.split("?")[0]);
  if(ruta === "/") ruta = "/index.html";

  var archivo = path.join(RAIZ, ruta);
  // Nadie sale de la carpeta del proyecto.
  if(archivo.indexOf(RAIZ) !== 0){
    res.writeHead(403); res.end("Prohibido"); return;
  }

  fs.readFile(archivo, function(err, datos){
    if(err){ console.log("404 " + ruta); res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"}); res.end("No existe: " + ruta); return; }
    res.writeHead(200, {
      "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream",
      // Sin caché del navegador: el service worker ya cachea, y al probar
      // cambios queremos ver siempre el archivo recién guardado.
      "Cache-Control": "no-store"
    });
    res.end(datos);
    console.log("200 " + ruta);
  });
}).listen(PUERTO, function(){
  console.log("Vida productiva en http://localhost:" + PUERTO);
});

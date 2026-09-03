@echo off
REM Conecta el celular para instalar o actualizar la app.
REM Redirige el puerto 8000 por USB y deja el servidor corriendo.
REM Cierra esta ventana para parar el servidor.

setlocal
set ADB=adb
where adb >nul 2>&1 || set ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe

"%ADB%" devices | findstr /r /c:"device$" >nul
if errorlevel 1 (
  echo.
  echo No hay ningun celular conectado.
  echo Revisa el cable y que tenga activada la depuracion por USB.
  echo.
  pause
  exit /b 1
)

"%ADB%" reverse tcp:8000 tcp:8000
if errorlevel 1 (
  echo No se pudo redirigir el puerto.
  pause
  exit /b 1
)

echo.
echo Puerto redirigido: el celular ya ve http://localhost:8000
echo Abre la app en el celular DOS veces para que tome la version nueva.
echo.
node servidor.js

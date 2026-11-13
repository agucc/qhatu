#!/usr/bin/env bash
# Instala la APK en el emulador, la abre y muestra qué se ve y qué errores hubo.
APK=android/app/build/outputs/apk/debug/app-debug.apk

echo "== Archivos web dentro de la APK =="
unzip -l "$APK" | grep "assets/public" | head -40

adb install -r "$APK"
adb logcat -c
adb shell am start -n bo.qhatu.mercado/.MainActivity
sleep 25

echo "== Textos en pantalla =="
adb shell uiautomator dump /sdcard/ui.xml >/dev/null
adb shell cat /sdcard/ui.xml | grep -o 'text="[^"]*"' | grep -v 'text=""' | head -60

echo "== Versión de WebView =="
adb shell dumpsys package com.google.android.webview | grep versionName | head -2

echo "== Consola y errores =="
adb logcat -d | grep -iE "capacitor|chromium|console|webview" | tail -60

adb exec-out screencap -p > captura.png

echo "== Estado de la página =="
PID=$(adb shell pidof bo.qhatu.mercado | tr -d '\r')
adb forward tcp:9222 localabstract:webview_devtools_remote_$PID
node scripts/estado-webview.mjs http://localhost:9222 || echo "no se pudo leer la página"

echo "== Tocar Jugar y abrir La Refresquera =="
node scripts/estado-webview.mjs http://localhost:9222 "document.querySelector('.puesto a.boton').click()" || echo "no se pudo abrir el puesto"

echo "== Volver al mercado =="
node scripts/estado-webview.mjs http://localhost:9222 "document.getElementById('volver').click()" || echo "no se pudo volver"

echo "== Abrir La Frutera =="
node scripts/estado-webview.mjs http://localhost:9222 "document.querySelectorAll('.puesto a.boton')[1].click()" || echo "no se pudo abrir La Frutera"

# El emulador tiene poca memoria: se reinicia la app antes de seguir con los demás puestos.
adb shell am force-stop bo.qhatu.mercado
adb shell am start -n bo.qhatu.mercado/.MainActivity
sleep 12
PID2=$(adb shell pidof bo.qhatu.mercado | tr -d '\r')
adb forward tcp:9222 localabstract:webview_devtools_remote_$PID2

echo "== El Aguayo =="
node scripts/estado-webview.mjs http://localhost:9222 "location.href = '/aguayo/index.html'" || echo "no se pudo abrir El Aguayo"
echo "== La Salteñera =="
node scripts/estado-webview.mjs http://localhost:9222 "location.href = '/saltenera/index.html'" || echo "no se pudo abrir La Salteñera"
echo "== La tienda =="
node scripts/estado-webview.mjs http://localhost:9222 "location.href = '/tienda/index.html'" || echo "no se pudo abrir la tienda"

echo "== El álbum =="
node scripts/estado-webview.mjs http://localhost:9222 "location.href = '/album/index.html'" || echo "no se pudo abrir el álbum"

echo "== ¿Sigue viva la app? =="
adb shell pidof bo.qhatu.mercado || echo "la app ya no está corriendo"
echo "== Cierres por memoria o errores graves =="
adb logcat -d -b crash | tail -40
adb logcat -d | grep -E "lowmemorykiller|lmkd.*[Kk]ill|ActivityManager: (Killing|Process bo.qhatu).*bo.qhatu|FATAL EXCEPTION" | tail -20

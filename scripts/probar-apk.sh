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
adb logcat -d | grep -iE "capacitor|chromium|console|webview" | tail -150

adb exec-out screencap -p > captura.png

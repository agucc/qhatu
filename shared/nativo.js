// Acceso a los complementos nativos de la app Android (Capacitor), sin empaquetador.

export function complementoNativo(nombre) {
  const cap = typeof window !== 'undefined' ? window.Capacitor : null;
  if (!cap?.isNativePlatform?.() || !cap.isPluginAvailable?.(nombre)) return null;
  return cap.registerPlugin ? cap.registerPlugin(nombre) : cap.Plugins?.[nombre] || null;
}

package bo.qhatu.mercado;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

/**
 * Anuncios con recompensa de Unity Ads para Qhatu (sin AdMob).
 * Desde el juego: AnunciosUnity.iniciar({ gameId, prueba }) y AnunciosUnity.mostrar({ lugar }) → { completo }.
 */
@CapacitorPlugin(name = "AnunciosUnity")
public class AnunciosUnity extends Plugin {

    @PluginMethod
    public void iniciar(PluginCall call) {
        String gameId = call.getString("gameId", "");
        boolean prueba = Boolean.TRUE.equals(call.getBoolean("prueba", false));
        if (gameId == null || gameId.isEmpty()) {
            call.reject("sin-game-id");
            return;
        }
        if (UnityAds.isInitialized()) {
            call.resolve();
            return;
        }
        UnityAds.initialize(getContext().getApplicationContext(), gameId, prueba, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {
                call.resolve();
            }

            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String mensaje) {
                call.reject(mensaje == null ? "error" : mensaje);
            }
        });
    }

    private void responder(PluginCall call, boolean completo, String error) {
        JSObject r = new JSObject();
        r.put("completo", completo);
        if (error != null) r.put("error", error);
        call.resolve(r);
    }

    @PluginMethod
    public void mostrar(PluginCall call) {
        String lugar = call.getString("lugar", "Rewarded_Android");
        UnityAds.load(lugar, new IUnityAdsLoadListener() {
            @Override
            public void onUnityAdsAdLoaded(String id) {
                getActivity().runOnUiThread(() -> UnityAds.show(getActivity(), id, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                    @Override
                    public void onUnityAdsShowFailure(String id, UnityAds.UnityAdsShowError error, String mensaje) {
                        responder(call, false, mensaje);
                    }

                    @Override
                    public void onUnityAdsShowStart(String id) {}

                    @Override
                    public void onUnityAdsShowClick(String id) {}

                    @Override
                    public void onUnityAdsShowComplete(String id, UnityAds.UnityAdsShowCompletionState estado) {
                        responder(call, estado == UnityAds.UnityAdsShowCompletionState.COMPLETED, null);
                    }
                }));
            }

            @Override
            public void onUnityAdsFailedToLoad(String id, UnityAds.UnityAdsLoadError error, String mensaje) {
                responder(call, false, mensaje);
            }
        });
    }
}

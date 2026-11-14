package bo.qhatu.mercado;

import com.applovin.mediation.MaxAd;
import com.applovin.mediation.MaxError;
import com.applovin.mediation.MaxReward;
import com.applovin.mediation.MaxRewardedAdListener;
import com.applovin.mediation.ads.MaxRewardedAd;
import com.applovin.sdk.AppLovinMediationProvider;
import com.applovin.sdk.AppLovinSdk;
import com.applovin.sdk.AppLovinSdkInitializationConfiguration;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Anuncios con recompensa de AppLovin MAX para Qhatu (sin AdMob).
 * Desde el juego: AnunciosMax.iniciar({ sdkKey }) y AnunciosMax.mostrar({ unidad }) → { completo }.
 * Se carga un anuncio, se muestra y se responde cuando el jugador lo cierra.
 */
@CapacitorPlugin(name = "AnunciosMax")
public class AnunciosMax extends Plugin {

    private MaxRewardedAd anuncio;
    private String unidadActual;
    private PluginCall pendiente;
    private boolean premiado;

    @PluginMethod
    public void iniciar(PluginCall call) {
        String sdkKey = call.getString("sdkKey", "");
        if (sdkKey == null || sdkKey.isEmpty()) {
            call.reject("sin-sdk-key");
            return;
        }
        AppLovinSdk sdk = AppLovinSdk.getInstance(getContext().getApplicationContext());
        if (sdk.isInitialized()) {
            call.resolve();
            return;
        }
        AppLovinSdkInitializationConfiguration config = AppLovinSdkInitializationConfiguration
            .builder(sdkKey)
            .setMediationProvider(AppLovinMediationProvider.MAX)
            .build();
        sdk.initialize(config, configuracion -> call.resolve());
    }

    private void responder(boolean completo, String error) {
        PluginCall call = pendiente;
        pendiente = null;
        if (call == null) return;
        JSObject r = new JSObject();
        r.put("completo", completo);
        if (error != null) r.put("error", error);
        call.resolve(r);
    }

    @PluginMethod
    public void mostrar(PluginCall call) {
        String unidad = call.getString("unidad", "");
        if (unidad == null || unidad.isEmpty()) {
            call.reject("sin-unidad");
            return;
        }
        if (pendiente != null) {
            call.reject("ocupado");
            return;
        }
        pendiente = call;
        premiado = false;
        getActivity().runOnUiThread(() -> {
            if (anuncio == null || !unidad.equals(unidadActual)) {
                anuncio = MaxRewardedAd.getInstance(unidad);
                unidadActual = unidad;
                anuncio.setListener(new Oyente());
            }
            if (anuncio.isReady()) anuncio.showAd(getActivity());
            else anuncio.loadAd();
        });
    }

    private class Oyente implements MaxRewardedAdListener {
        @Override
        public void onAdLoaded(MaxAd ad) {
            if (pendiente != null) getActivity().runOnUiThread(() -> anuncio.showAd(getActivity()));
        }

        @Override
        public void onAdLoadFailed(String unidad, MaxError error) {
            responder(false, error == null ? "carga" : error.getMessage());
        }

        @Override
        public void onAdDisplayed(MaxAd ad) {}

        @Override
        public void onAdClicked(MaxAd ad) {}

        @Override
        public void onUserRewarded(MaxAd ad, MaxReward premio) {
            premiado = true;
        }

        @Override
        public void onAdHidden(MaxAd ad) {
            responder(premiado, null);
        }

        @Override
        public void onAdDisplayFailed(MaxAd ad, MaxError error) {
            responder(false, error == null ? "mostrar" : error.getMessage());
        }
    }
}

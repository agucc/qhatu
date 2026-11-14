package bo.qhatu.mercado;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Complementos propios de Qhatu (antes de super.onCreate, como pide Capacitor).
        registerPlugin(AnunciosUnity.class);
        super.onCreate(savedInstanceState);
    }
}

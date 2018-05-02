//  Created by react-native-create-bridge

package com.adpay.rnadyen;

import android.net.Uri;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.adyen.core.PaymentRequest;
import com.adyen.core.interfaces.PaymentDataCallback;
import com.adyen.core.interfaces.PaymentDetailsCallback;
import com.adyen.core.interfaces.PaymentMethodCallback;
import com.adyen.core.interfaces.PaymentRequestDetailsListener;
import com.adyen.core.interfaces.PaymentRequestListener;
import com.adyen.core.interfaces.UriCallback;
import com.adyen.core.models.Payment;
import com.adyen.core.models.PaymentMethod;
import com.adyen.core.models.PaymentRequestResult;
import com.adyen.core.models.paymentdetails.InputDetail;
import com.adyen.core.models.paymentdetails.IssuerSelectionPaymentDetails;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONObject;

import java.io.IOException;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RNAdyenModule extends ReactContextBaseJavaModule implements Serializable {
    public static final String REACT_CLASS = "RNAdyen";
    private static final String TAG = "T";

    private static ReactApplicationContext reactContext = null;

    private PaymentRequest paymentRequest;
    private PaymentDataCallback paymentDataCallback;
    private PaymentMethodCallback paymentMethodCallback;
    private UriCallback uriCallback;
    private List<PaymentMethod> availablePaymentMethods;
    private String idealString;

    private final PaymentRequestListener paymentRequestListener = new PaymentRequestListener() {


        @Override
        public void onPaymentDataRequested(@NonNull PaymentRequest paymentRequest, @NonNull String sdkToken, @NonNull PaymentDataCallback callback) {
            paymentDataCallback = callback;
            emitDeviceEvent("getToken", sdkToken);
        }


        @Override
        public void onPaymentResult(@NonNull PaymentRequest paymentRequest, @NonNull PaymentRequestResult result) {

            Payment payment = result.getPayment();
            String adyenResult = "";

            // convert status:
            switch (payment.getPaymentStatus()) {
                case RECEIVED:
                    adyenResult = "PAYMENT_RECEIVED";
                    break;
                case AUTHORISED:
                    adyenResult = "PAYMENT_AUTHORISED";
                    break;
                case REFUSED:
                    adyenResult = "PAYMENT_REFUSED";
                    break;
                case CANCELLED:
                    adyenResult = "PAYMENT_CANCELLED";
                    break;
                case ERROR:
                    adyenResult = String.format("Payment failed with error (%s)", payment.getPayload());
                    break;
            }

            emitDeviceEvent("paymentResult", adyenResult);

        }
    };

    private final PaymentRequestDetailsListener paymentRequestDetailsListener = new PaymentRequestDetailsListener() {

        @Override
        public void onPaymentMethodSelectionRequired(@NonNull PaymentRequest paymentRequest, @NonNull List<PaymentMethod> preferredPaymentMethods, @NonNull List<PaymentMethod> availableMethods, @NonNull PaymentMethodCallback callback) {
            availablePaymentMethods = availableMethods;
            paymentMethodCallback = callback;
        }

        @Override
        public void onRedirectRequired(@NonNull PaymentRequest paymentRequest, @NonNull String redirectUrl, @NonNull UriCallback callBack) {
            emitDeviceEvent("getRedirectUrlForIdeal", redirectUrl);
            uriCallback = callBack;
        }

        @Override
        public void onPaymentDetailsRequired(@NonNull PaymentRequest paymentRequest, @NonNull Collection<InputDetail> inputDetails, @NonNull PaymentDetailsCallback callback) {

            final String paymentMethodType = paymentRequest.getPaymentMethod().getType();

            if(PaymentMethod.Type.IDEAL.equals(paymentMethodType)) {
                IssuerSelectionPaymentDetails issuerSelectionPaymentDetails = new IssuerSelectionPaymentDetails(inputDetails);
                issuerSelectionPaymentDetails.fillIssuer(idealString);
                callback.completionWithPaymentDetails(issuerSelectionPaymentDetails);
            }
        }
    };

    public RNAdyenModule(ReactApplicationContext context) {        
        super(context);
        reactContext = context;
    }


    @Override
    public String getName() {        
        return REACT_CLASS;
    }

    @Override
    public Map<String, Object> getConstants() {        
        final Map<String, Object> constants = new HashMap<>();
        constants.put("EXAMPLE_CONSTANT", "example");
        return constants;
    }

    @ReactMethod
    public void exampleMethod () {
        emitDeviceEvent("getToken", "params");
    }

    @ReactMethod
    public void initializeAdyen() {
        paymentRequest = new PaymentRequest(this.getCurrentActivity(), paymentRequestListener, paymentRequestDetailsListener);
        paymentRequest.start();
    }

    @ReactMethod
    public void  setPaymentData(ReadableMap data) throws IOException {
        JSONObject json = new JSONObject(data.toHashMap());
        paymentDataCallback.completionWithPaymentData(json.toString().getBytes("utf-8"));

    }

    @ReactMethod
    public void setPaymentMethod(String methodName, String idealId) {

        if(methodName.equals("ideal")) {
            idealString = idealId;
        }

        for (int i = 0; i < availablePaymentMethods.size(); i++) {
            PaymentMethod paymentMet = availablePaymentMethods.get(i);
            String type = paymentMet.getType();
            if(type.equals(methodName)) {
                paymentMethodCallback.completionWithPaymentMethod(paymentMet);
            }
        }
    }

    @ReactMethod
    public void setURLCompletion(String url) {
        Uri uri = Uri.parse(url);
        uriCallback.completionWithUri(uri);
    }




    private static void emitDeviceEvent(String eventName, @Nullable Object eventData) {
        // A method for emitting from the native side to JS
        // https://facebook.github.io/react-native/docs/native-modules-android.html#sending-events-to-javascript
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, eventData);
    }
}

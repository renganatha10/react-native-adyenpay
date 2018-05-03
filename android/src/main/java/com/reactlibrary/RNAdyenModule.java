
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
import com.adyen.core.models.paymentdetails.CreditCardPaymentDetails;
import com.adyen.core.models.paymentdetails.InputDetail;
import com.adyen.core.models.paymentdetails.IssuerSelectionPaymentDetails;

import adyen.com.adyencse.encrypter.exception.EncrypterException;
import adyen.com.adyencse.pojo.Card;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Date;


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
    private Card card;


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
        public void onPaymentDetailsRequired(@NonNull PaymentRequest paymentRequest, @NonNull Collection<InputDetail> inputDetails, @NonNull PaymentDetailsCallback paymentDetailsCallback) {
            final String paymentMethodType = paymentRequest.getPaymentMethod().getType();
            if(PaymentMethod.Type.IDEAL.equals(paymentMethodType)) {
                IssuerSelectionPaymentDetails issuerSelectionPaymentDetails = new IssuerSelectionPaymentDetails(inputDetails);
                issuerSelectionPaymentDetails.fillIssuer(idealString);
                paymentDetailsCallback.completionWithPaymentDetails(issuerSelectionPaymentDetails);
            } else if (PaymentMethod.Type.CARD.equals(paymentMethodType)) {
                try {
                    String cardInfo = card.serialize(paymentRequest.getPublicKey());
                    CreditCardPaymentDetails creditCardPaymentDetails = new CreditCardPaymentDetails(inputDetails);
                    creditCardPaymentDetails.fillCardToken(cardInfo);
                    paymentDetailsCallback.completionWithPaymentDetails(creditCardPaymentDetails);
                } catch (EncrypterException e) {
                    e.printStackTrace();
                }
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
    public void  setPaymentData(ReadableMap data) throws IOException, JSONException {
        JSONObject json = convertMapToJson(data);
        paymentDataCallback.completionWithPaymentData(json.toString().getBytes("utf-8"));

    }

    public JSONObject convertMapToJson(ReadableMap readableMap) throws JSONException {
        JSONObject object = new JSONObject();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (readableMap.getType(key)) {
                case Null:
                    object.put(key, JSONObject.NULL);
                    break;
                case Boolean:
                    object.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    object.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    object.put(key, readableMap.getString(key));
                    break;
                case Map:
                    object.put(key, convertMapToJson(readableMap.getMap(key)));
                    break;
                case Array:
                    object.put(key, convertArrayToJson(readableMap.getArray(key)));
                    break;
            }
        }
        return object;
    }

    public JSONArray convertArrayToJson(ReadableArray readableArray) throws JSONException {
        JSONArray array = new JSONArray();
        for (int i = 0; i < readableArray.size(); i++) {
            switch (readableArray.getType(i)) {
                case Null:
                    break;
                case Boolean:
                    array.put(readableArray.getBoolean(i));
                    break;
                case Number:
                    array.put(readableArray.getDouble(i));
                    break;
                case String:
                    array.put(readableArray.getString(i));
                    break;
                case Map:
                    array.put(convertMapToJson(readableArray.getMap(i)));
                    break;
                case Array:
                    array.put(convertArrayToJson(readableArray.getArray(i)));
                    break;
            }
        }
        return array;
    }

    @ReactMethod
    public void setPaymentMethodForCard(String methodName) {
        PaymentMethod paymentMet = availablePaymentMethods.get(0);
        for (int i = 0; i < availablePaymentMethods.size(); i++) {
            String type = availablePaymentMethods.get(i).getType();
            if(type.equals(methodName)) {
                paymentMet = availablePaymentMethods.get(i);
            }
        }
        paymentMethodCallback.completionWithPaymentMethod(paymentMet);
    }

    @ReactMethod
    public void setPaymentMethodForIdeal(String methodName, String idealId) {
        idealString = idealId;
        PaymentMethod paymentMet = availablePaymentMethods.get(0);
        for (int i = 0; i < availablePaymentMethods.size(); i++) {
            String type = paymentMet.getType();
            if(type.equals(methodName)) {
                paymentMet = availablePaymentMethods.get(i);
            }
        }
        paymentMethodCallback.completionWithPaymentMethod(paymentMet);
    }

    @ReactMethod
    public void setCardDetails(ReadableMap cardDetails) {
        card  = new Card();
        card.setNumber(cardDetails.getString("number"));
        card.setCardHolderName(cardDetails.getString("name"));
        card.setCvc(cardDetails.getString("cvc"));
        card.setGenerationTime(new Date());
        card.setExpiryMonth(cardDetails.getString("expiryDate").subSequence(0, 2).toString());
        card.setExpiryYear("20" + cardDetails.getString("expiryDate").subSequence(3, 5).toString());
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

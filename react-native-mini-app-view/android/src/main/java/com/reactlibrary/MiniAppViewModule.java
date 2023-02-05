package com.reactlibrary;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

public class MiniAppViewModule extends ReactContextBaseJavaModule {
    private static final String TAG = "[NGOCDH]-" + MiniAppViewModule.class.getSimpleName();

    public MiniAppViewModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "MiniAppViewManager";
    }

    @ReactMethod
    public void goBack(final String appName) {
        RCTMiniAppViewManager.getInstance().goBack();
    }

    @ReactMethod
    public void navigate(final String appName, final String name, final ReadableMap params) {
        RCTMiniAppViewManager.getInstance().navigate(name, params);
    }

    @ReactMethod
    public void loadApp(final int tag, final ReadableMap params, final Promise promise) {
        RCTMiniAppViewManager.getInstance().loadApp(tag, params, promise);
    }

    @ReactMethod
    public void restartApp(final int tag, final ReadableMap params, final Promise promise) {
        RCTMiniAppViewManager.getInstance().restartApp(tag, params, promise);
    }
}

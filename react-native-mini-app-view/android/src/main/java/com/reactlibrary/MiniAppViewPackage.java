package com.reactlibrary;

import android.util.Log;

import androidx.annotation.NonNull;

import java.util.Arrays;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.ViewManager;

public class MiniAppViewPackage implements ReactPackage {

    private static final String TAG = "[NGOCDH]-" + MiniAppViewPackage.class.getSimpleName();

    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        Log.d(TAG, "createNativeModules: ");
        return Arrays.<NativeModule>asList(
                new MiniAppViewModule(reactContext));
    }

    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        Log.d(TAG, "createViewManagers: ");
        return Arrays.<ViewManager>asList(
                RCTMiniAppViewManager.getInstance());
    }
}

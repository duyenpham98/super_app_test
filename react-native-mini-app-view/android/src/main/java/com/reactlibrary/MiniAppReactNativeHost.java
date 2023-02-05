package com.reactlibrary;

import android.app.Application;

import androidx.annotation.Nullable;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactInstanceManagerBuilder;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.ReactMarkerConstants;
import com.facebook.react.common.LifecycleState;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;

import java.util.List;

public class MiniAppReactNativeHost extends ReactNativeHost {
    private String mJsBundleFile;
    private ReactContext reactContext;
    private DefaultHardwareBackBtnHandler mDefaultHardwareBackBtnHandler;

    public MiniAppReactNativeHost(ReactContext reactContext, DefaultHardwareBackBtnHandler defaultHardwareBackBtnHandler) {
        this(reactContext.getCurrentActivity().getApplication());
        this.reactContext = reactContext;
        this.mDefaultHardwareBackBtnHandler = defaultHardwareBackBtnHandler;
    }

    protected MiniAppReactNativeHost(Application application) {
        super(application);
    }

    @Override
    public boolean getUseDeveloperSupport() {
        return false;
    }

    @Nullable
    @Override
    protected String getJSBundleFile() {
        return this.mJsBundleFile;
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return ((SuperReactActivity) this.reactContext.getCurrentActivity()).getPackages();
    }

    public void setJsBundleFile(String jsBundleFile) {
        this.mJsBundleFile = jsBundleFile;
    }

    @Override
    protected ReactInstanceManager createReactInstanceManager() {
        ReactMarker.logMarker(ReactMarkerConstants.BUILD_REACT_INSTANCE_MANAGER_START);
        ReactInstanceManagerBuilder builder = ReactInstanceManager.builder()
                .setApplication(reactContext.getCurrentActivity().getApplication())
                .setCurrentActivity(reactContext.getCurrentActivity())
                .addPackages(this.getPackages())
                .setUseDeveloperSupport(this.getUseDeveloperSupport())
                .setDefaultHardwareBackBtnHandler(this.mDefaultHardwareBackBtnHandler)
                .setInitialLifecycleState(LifecycleState.RESUMED);

        String jsBundleFile = getJSBundleFile();
        if (jsBundleFile != null) {
            builder.setJSBundleFile(jsBundleFile);
        } else {
            builder.setBundleAssetName(Assertions.assertNotNull(getBundleAssetName()));
        }
        ReactInstanceManager reactInstanceManager = builder.build();
        ReactMarker.logMarker(ReactMarkerConstants.BUILD_REACT_INSTANCE_MANAGER_END);
        return reactInstanceManager;
    }
}

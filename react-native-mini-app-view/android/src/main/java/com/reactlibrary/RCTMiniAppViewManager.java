package com.reactlibrary;

import android.util.Log;
import android.util.SparseArray;
import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Hashtable;
import java.util.Stack;

public class RCTMiniAppViewManager extends ViewGroupManager<RCTMiniAppView> implements View.OnAttachStateChangeListener {

    private static final String REACT_CLASS = "RCTMiniAppView";
    private static final String TAG = "[NGOCDH]-" + RCTMiniAppViewManager.class.getSimpleName();

    // handle events (loadApp, restartApp)
    private final SparseArray<RCTMiniAppView> mRctMiniAppViewSparseArray = new SparseArray<>();
    // handle events (navigate, goBack)
    private final Stack<RCTMiniAppView> mRCTMiniAppViewStack = new Stack<>();

    private static RCTMiniAppViewManager instance = null;

    private RCTMiniAppViewManager() {

    }

    public static RCTMiniAppViewManager getInstance() {
        if (instance == null) {
            instance = new RCTMiniAppViewManager();
        }
        return instance;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public void onViewAttachedToWindow(View v) {
        RCTMiniAppView view = ((RCTMiniAppView) v);
        view.readyToLoadApp();
        this.mRctMiniAppViewSparseArray.put(view.getId(), view);
        this.mRCTMiniAppViewStack.add(view);
    }

    @Override
    public void onViewDetachedFromWindow(View v) {
        this.mRctMiniAppViewSparseArray.remove(v.getId());
        this.mRCTMiniAppViewStack.pop();
    }

    @NonNull
    @Override
    protected RCTMiniAppView createViewInstance(@NonNull ThemedReactContext reactContext) {
        RCTMiniAppView view = new RCTMiniAppView(reactContext);
        view.addOnAttachStateChangeListener(this);
        return view;
    }

    @Override
    protected void onAfterUpdateTransaction(@NonNull RCTMiniAppView view) {
        super.onAfterUpdateTransaction(view);
        view.createIfNotExitsOrUseCacheMiniAppReactNativeHost();
    }

    @ReactProp(name = "mainComponentName")
    public void setMainComponentName(RCTMiniAppView view, String mainComponentName) {
        Log.d(TAG, "setMainComponentName: " + mainComponentName);
        view.setMainComponentName(mainComponentName);
    }

    @ReactProp(name = "bundleAssetName")
    public void setBundleAssetName(RCTMiniAppView view, String bundleAssetName) {
        Log.d(TAG, "bundleAssetName: " + bundleAssetName);
        view.setBundleAssetName(bundleAssetName);
    }

    public void loadApp(int tag, ReadableMap params, Promise promise) {
        try {
            RCTMiniAppView view = this.mRctMiniAppViewSparseArray.get(tag);
            if (view != null) {
                view.loadApp(params);
                promise.resolve(null);
            } else {
                promise.reject(new Throwable("Error: Can't get RCTMiniAppView"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject(e);
        }
    }

    public void restartApp(int tag, ReadableMap params, Promise promise) {
        try {
            RCTMiniAppView view = this.mRctMiniAppViewSparseArray.get(tag);
            if (view != null) {
                view.restartApp(params);
                promise.resolve(null);
            } else {
                promise.reject(new Throwable("Error: Can't get RCTMiniAppView"));
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    public void goBack() {
        try {
            RCTMiniAppView view = this.mRCTMiniAppViewStack.peek();
            if (view != null) {
                view.goBack();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void navigate(String name, ReadableMap params) {
        try {
            RCTMiniAppView view = this.mRCTMiniAppViewStack.peek();
            if (view != null) {
                view.navigate(name, params);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void onDestroy() {
        Log.d(TAG, "onDestroy: ");
        this.mRctMiniAppViewSparseArray.clear();
        this.mRCTMiniAppViewStack.clear();
    }


}

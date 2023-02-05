package com.reactlibrary;

import android.content.Context;
import android.os.Build;
import android.util.AttributeSet;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.common.logging.FLog;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMarker;
import com.facebook.react.bridge.ReactMarkerConstants;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class RCTMiniAppView extends FrameLayout implements ReactMarker.MarkerListener, View.OnAttachStateChangeListener, DefaultHardwareBackBtnHandler {

    private static final String TAG = "[NGOCDH]-" + RCTMiniAppView.class.getSimpleName();
    private ReactRootView mReactRootView;

    private MiniAppReactNativeHost mMiniAppReactNativeHost;

    private String mMainComponentName;

    private String mBundleAssetName;

    private ReactContext reactContext;

    private static RCTMiniAppView instance = null;
    public static RCTMiniAppView getInstance(@NonNull Context context) {
        if (instance == null) {
            instance = new RCTMiniAppView(context);
        }
        return instance;
    }

    public RCTMiniAppView(@NonNull Context context) {
        this(context, null);
        this.reactContext = ((ReactContext) context);
//        if (mReactRootView==null)
        this.mReactRootView = new ReactRootView(this.reactContext);
        this.addOnAttachStateChangeListener(this);

    }

    public RCTMiniAppView(@NonNull Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public RCTMiniAppView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public RCTMiniAppView(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public void readyToLoadApp() {
        WritableMap data = Arguments.createMap();
        data.putString("eventName", "onReadyToLoadApp");
        onReceiveNativeEvent(data);
    }

    public void onReceiveNativeEvent(WritableMap params) {
        try {
            this.reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(getId(), "topChange", params);
        } catch (Exception e) {
            FLog.e(TAG, "onReceiveNativeEvent", e);
        }
    }

    public void setMainComponentName(String mainComponentName) {
        this.mMainComponentName = mainComponentName;
    }

    public void setBundleAssetName(String bundleAssetName) {
        this.mBundleAssetName = bundleAssetName;
    }

    public void goBack() {
        MiniAppReactNativeHostManager.getInstance().pop();
        Log.d(TAG, "goBack: in " + this.mMainComponentName + ", back stack size: "
                + MiniAppReactNativeHostManager.getInstance().count());
        WritableMap data = Arguments.createMap();
        data.putString("eventName", "onBackPressed");
        onReceiveNativeEvent(data);
    }

    public void navigate(String name, ReadableMap params) {
        WritableMap data = Arguments.createMap();
        data.putString("eventName", "onNavigate");
        data.putString("name", name);
        data.putMap("params", Arguments.fromBundle(Arguments.toBundle(params)));
        onReceiveNativeEvent(data);
    }

    public void loadApp(final ReadableMap params) {
        Log.d(TAG, "loadApp");
        this.reactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                SuperReactActivity superReactActivity=((SuperReactActivity)reactContext.getCurrentActivity());
                FrameLayout.LayoutParams layoutparams=new FrameLayout.
                        LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT,
                        Gravity.CENTER_HORIZONTAL|Gravity.CENTER_VERTICAL);
                if (mReactRootView.getParent()==null){
                    superReactActivity.addContentView(mReactRootView,layoutparams);
                    if (MiniAppReactNativeHostCache.getInstance().containsKey(mMainComponentName)) {
                        mReactRootView.startReactApplication(mMiniAppReactNativeHost.getReactInstanceManager(),
                                mMainComponentName, Arguments.toBundle(params));
                    }

                }


            }
        });
    }

    public void restartApp(final ReadableMap params) {
        if (this.mMiniAppReactNativeHost.getReactInstanceManager().hasStartedCreatingInitialContext()) {
            this.mMiniAppReactNativeHost.getReactInstanceManager().recreateReactContextInBackground();
        }
        this.loadApp(params);
    }

    @Override
    public void logMarker(ReactMarkerConstants name, @Nullable String tag, int instanceKey) {
        if (name == ReactMarkerConstants.CONTENT_APPEARED && tag.equals(this.mMainComponentName)) {
            Log.d(TAG, "logMarker: MiniAppBtnBackHandler push " + this.mMainComponentName);
            MiniAppReactNativeHostManager.getInstance().push(this.mMiniAppReactNativeHost);
            WritableMap data = Arguments.createMap();
            data.putString("eventName", "onViewLoaded");
            onReceiveNativeEvent(data);
            ReactMarker.removeListener(this);
        }
    }

    @Override
    public void onViewAttachedToWindow(View v) {
        ReactMarker.addListener(this);

    }

    @Override
    public void onViewDetachedFromWindow(View v) {
        Log.d(TAG, "onViewDetachedFromWindow: ");
        ReactMarker.removeListener(this);
        this.mReactRootView.unmountReactApplication();
        mReactRootView.setVisibility(GONE);
        if ((ViewGroup) mReactRootView.getParent()==null) return;
        ((ViewGroup) mReactRootView.getParent()).removeView(mReactRootView);
    }

    @Override
    public void invokeDefaultOnBackPressed() {
        MiniAppReactNativeHostManager.getInstance().pop();

        Log.d(TAG, "invokeDefaultOnBackPressed: in "
                + this.mMainComponentName + ", back stack size: "
                + MiniAppReactNativeHostManager.getInstance().count());

        this.reactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                ((ReactApplication) reactContext.getCurrentActivity()
                        .getApplication())
                        .getReactNativeHost()
                        .getReactInstanceManager()
                        .onBackPressed();
            }
        });
    }

    protected void createAndCacheMiniAppReactNativeHost() {
        this.mMiniAppReactNativeHost = new MiniAppReactNativeHost(this.reactContext, this);
        MiniAppReactNativeHostCache.getInstance().put(this.mMainComponentName, this.mMiniAppReactNativeHost);
    }

    public void createIfNotExitsOrUseCacheMiniAppReactNativeHost() {
        if (this.mMiniAppReactNativeHost == null) {
            if (MiniAppReactNativeHostCache.getInstance().containsKey(this.mMainComponentName)) {
                this.mMiniAppReactNativeHost = MiniAppReactNativeHostCache.getInstance().get(this.mMainComponentName);
                ReactContext currentReactContext = mMiniAppReactNativeHost.getReactInstanceManager().getCurrentReactContext();
                if (currentReactContext!= null && !currentReactContext.hasActiveCatalystInstance()) {
                    this.createAndCacheMiniAppReactNativeHost();
                }
            } else {
                this.createAndCacheMiniAppReactNativeHost();
            }

            String currentBundleFilePath = this.mBundleAssetName.concat(".jsbundle");
            this.mMiniAppReactNativeHost.setJsBundleFile(currentBundleFilePath);
            if (!currentBundleFilePath.equals(this.mMiniAppReactNativeHost.getJSBundleFile())) {
                // not available
            }
        }
    }
}

package com.reactlibrary;

import android.content.Intent;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;

import java.util.List;

public abstract class SuperReactActivity extends ReactActivity {

    private static final String TAG = "[NGOCDH]-" + SuperReactActivity.class.getSimpleName();

    protected abstract List<ReactPackage> getPackages();

    @Override
    public void onBackPressed() {
        Log.d(TAG, "onBackPressed: " + "back stack size: " + MiniAppReactNativeHostManager.getInstance().count());
        // Mini App
        boolean useSuper = MiniAppReactNativeHostManager.getInstance().onBackPressed();
        if (useSuper) {
            // Super App & System
            super.onBackPressed();
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        // Mini App
        MiniAppReactNativeHostManager.getInstance().onActivityResult(this, requestCode, resultCode, data);
        // Super App & System
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onDestroy() {
        RCTMiniAppViewManager.getInstance().onDestroy();
        super.onDestroy();
    }
}

package com.reactlibrary;

import android.app.Activity;
import android.content.Intent;

import java.util.Stack;

public class MiniAppReactNativeHostManager {
    private static MiniAppReactNativeHostManager instance = null;

    private Stack<MiniAppReactNativeHost> mStack;

    private MiniAppReactNativeHostManager() {
        this.mStack = new Stack<>();
    }

    public static MiniAppReactNativeHostManager getInstance() {
        if (instance == null) {
            instance = new MiniAppReactNativeHostManager();
        }
        return instance;
    }

    public MiniAppReactNativeHost peek() {
        try {
            return this.mStack.peek();
        } catch (Exception e) {
            return null;
        }
    }

    public MiniAppReactNativeHost pop() {
        try {
            return this.mStack.pop();
        } catch (Exception e) {
            return null;
        }
    }

    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        MiniAppReactNativeHost top = this.peek();
        if (top != null) {
            top.getReactInstanceManager().onActivityResult(activity, requestCode, resultCode, data);
        }
    }

    public int count() {
        return this.mStack.size();
    }


    public boolean onBackPressed() {
        MiniAppReactNativeHost top = this.peek();
        if (top != null) {
            top.getReactInstanceManager().onBackPressed();
            return false;
        }
        return true;
    }

    public void push(MiniAppReactNativeHost miniAppReactNativeHost) {
        this.mStack.push(miniAppReactNativeHost);
    }
}

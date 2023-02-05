package com.reactlibrary;

import java.util.Hashtable;

public class MiniAppReactNativeHostCache {

    private static MiniAppReactNativeHostCache instance = null;

    private Hashtable<String, MiniAppReactNativeHost> mCache;

    private MiniAppReactNativeHostCache() {
        this.mCache = new Hashtable<>();
    }

    public static MiniAppReactNativeHostCache getInstance() {
        if (instance == null) {
            instance = new MiniAppReactNativeHostCache();
        }
        return instance;
    }


    public boolean containsKey(String key) {
        return this.mCache.containsKey(key);
    }

    public MiniAppReactNativeHost get(String key) {
        try {
            return this.mCache.get(key);
        } catch (Exception e) {
            return null;
        }
    }

    public void put(String key, MiniAppReactNativeHost miniAppReactNativeHost) {
        this.mCache.put(key, miniAppReactNativeHost);
    }
}

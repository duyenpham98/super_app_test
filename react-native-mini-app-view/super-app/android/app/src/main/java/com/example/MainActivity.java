package com.example;

import com.facebook.react.ReactPackage;
import com.reactlibrary.SuperReactActivity;

import java.util.List;


public class MainActivity extends SuperReactActivity {

    @Override
    protected String getMainComponentName() {
        return "example";
    }

    @Override
    protected List<ReactPackage> getPackages() {
        return ((MainApplication) getApplication()).getPackages();
    }
}

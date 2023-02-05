import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from '../screen/Home';
import DetailScreen from '../screen/Detail';
import LocalMiniAppScreen from '../screen/LocalMiniApp';
import TestAppVersionScreen from '../screen/TestAppVersion';
import {checkVersionMultiMiniApp} from 'react-native-mini-app-view';
import {miniApps} from '../../app.json';
import {UpdateModalHolder} from '../components/UpdateModal';
import {roundNumber} from '../../../src/Utils';
import SplashScreen from '../screen/Splash';
import {isOpenAppFisrtTime} from '../utils/functions';
import TestV2Screen from '../screen/TestV2';

const Stack = createStackNavigator();

async function onReady() {
  const isFisrtTime = await isOpenAppFisrtTime();
  if (!isFisrtTime) {
    console.log('onReady: check because no first time');
    checkVersionMultiMiniApp('staging', miniApps, {
      onGetLocalPackageError: (error) => {
        console.log('onGetLocalPackageError: ', error);
      },
      onGetRemotePackageError: (error) => {
        console.log('onGetRemotePackageError: ', error);
      },
      onSaveRemotePackageInfoError: (error) => {
        console.log('onSaveRemotePackageInfoError: ', error);
      },
    })
      .then((result) => {
        const {appsUpdateOnline, appsUpdateOffline, updateApps} = result;
        if (appsUpdateOnline.length > 0) {
          console.log('Cần update from online: ', appsUpdateOnline);
        } else {
          console.log('Không cần update from online');
        }

        if (appsUpdateOffline.length > 0) {
          console.log('Cần update from offline: ', appsUpdateOffline);
        } else {
          console.log('Không cần update from offline');
        }

        const all = [...appsUpdateOnline, ...appsUpdateOffline];

        if (all.length > 0) {
          let done = 0;
          UpdateModalHolder.getModal()?.show({
            onAcceptPress: () => {
              updateApps(all, {
                // Update lifecycle callbacks
                onUpdateBegin: (values) => {
                  console.log('onUpdateBegin');
                  UpdateModalHolder.getModal()?.setData({
                    total: values.totalPackage,
                    done: 0,
                  });
                },

                onUpdateError: (error) => {
                  console.log('onUpdateError: ', error);
                },

                onUpdateFinish: (res) => {
                  console.log('onUpdateFinish: ', res);
                },

                // download callbacks
                onDownloadBegin: (res) => {
                  console.log('onDownloadBegin: ', res);
                  UpdateModalHolder.getModal()?.setData({
                    percent: 0,
                  });
                },

                onDownloadProgress: (res) => {
                  console.log('onDownloadProgress: ', res);
                  const {bytesWritten, contentLength} = res;
                  UpdateModalHolder.getModal()?.setData({
                    percent: roundNumber(bytesWritten / contentLength / 2, 2),
                  });
                },
                onDownloadFinish: (res) => {
                  console.log('onDownloadFinish: ', res);
                  UpdateModalHolder.getModal()?.setData({
                    percent: 0.5,
                  });
                },

                // unzip callbacks
                onUnzipBegin: (res) => {
                  console.log('onUnzipBegin: ', res);
                },
                onUnzipProgress: (res) => {
                  console.log('onDownloadBegin: ', res);
                  const {progress} = res;
                  UpdateModalHolder.getModal()?.setData({
                    percent: roundNumber(0.5 + progress / 2, 2),
                  });
                },
                onUnzipFail: (error) => {
                  console.log('onUnzipFail: ', error);
                  console.log(error);
                },
                onUnzipFinish: (res) => {
                  console.log('onUnzipFinish: ', res);
                  UpdateModalHolder.getModal()?.setData({
                    done: ++done,
                    percent: 1,
                  });
                },
              });
            },
          });
        }
      })
      .catch((error) => {
        console.log('checkVersionMultiMiniApp: ', error);
      });
  } else {
    console.log('onReady: no check because first time');
  }
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="TestAppVersion" component={TestAppVersionScreen} />
        <Stack.Screen name="LocalMiniApp" component={LocalMiniAppScreen} />
        <Stack.Screen name="TestV2" component={TestV2Screen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

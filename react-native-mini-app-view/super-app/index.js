/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setup} from 'react-native-mini-app-view';

setup({
  storage: AsyncStorage,
});

AppRegistry.registerComponent(appName, () => App);

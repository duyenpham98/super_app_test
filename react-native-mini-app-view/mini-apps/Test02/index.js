/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import 'react-native-gesture-handler';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue.js';

const spyFunction = (msg) => {
    console.log("mini-app: ", msg);
};

MessageQueue.spy(spyFunction);

AppRegistry.registerComponent(appName, () => App);

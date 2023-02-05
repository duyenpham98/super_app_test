import React, {Component} from 'react';
import {Button, StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {MiniAppView, MiniAppViewManager} from 'react-native-mini-app-view';
import RNFS from 'react-native-fs';
import {miniApps} from '../../../app.json';
const {Test02} = miniApps;
const {packageName, mainComponentName} = Test02;
const jsbundleFile = `${RNFS.DocumentDirectoryPath}/${packageName}/CodePush/main`;
export default class TestV2Screen extends Component {
  miniAppViewRef = null;

  onReadyToLoadApp = () => {
    console.log('onReadyToLoadApp');
    this.miniAppViewRef.loadApp();
  };

  onViewLoaded = () => {
    console.log('onViewLoaded');
  };

  onNavigate = (name, params) => {
    this.props.navigation.navigate('Detail');
  };

  onBackPressed = () => {
    console.log('onBackPressed');
    this.props.navigation.goBack();
  };

  _renderTest = () => {
    return (
      <View style={{flexDirection: 'row'}}>
        <Button
          title="Load App"
          onPress={() => {
            MiniAppViewManager.loadApp();
          }}
        />
      </View>
    );
  };
  render() {
    return (
      <View style={styles.container}>
        <MiniAppView
          ref={(ref) => (this.miniAppViewRef = ref)}
          style={styles.miniAppView}
          bundleAssetName={jsbundleFile}
          mainComponentName={mainComponentName}
          onReadyToLoadApp={this.onReadyToLoadApp}
          onViewLoaded={this.onViewLoaded}
          onNavigate={this.onNavigate}
          onBackPressed={this.onBackPressed}
        />
        {/* {this._renderTest()} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  miniAppView: {
    flex: 1,
    backgroundColor: 'red',
  },
});

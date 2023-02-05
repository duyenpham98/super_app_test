import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {MiniAppView} from 'react-native-mini-app-view';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../../utils/constant';
import RNFS from 'react-native-fs';
import {miniApps} from '../../../app.json';
const {Test02} = miniApps;
const {packageName, mainComponentName} = Test02;
const jsbundleFile = `${RNFS.DocumentDirectoryPath}/${packageName}/CodePush/main`;

class LocalMiniAppScreenComponent extends Component {
  miniAppViewRef = undefined;

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={'blue'} />
        <Text>Loading...</Text>
      </View>
    );
  };

  render() {
    const {isLoading} = this.state;
    return (
      <View style={styles.container}>
        {isLoading && this.renderLoading()}
        <MiniAppView
          ref={(ref) => (this.miniAppViewRef = ref)}
          style={{flex: 1}}
          bundleAssetName="Test01/main"
          mainComponentName="Test01"
          launch={true}
          onReadyToLoadApp={() => this._miniAppViewRef?.loadApp()}
          onViewLoaded={() => this.setState({isLoading: false})}
          onBackPressed={() => this.props.navigation.goBack()}
          onViewLoaded={() => {
            this.setState({isLoading: false});
          }}
          onNavigate={(name) => {
            this.props.navigation.navigate(name);
          }}
          readyToLoadApp={() => {
            console.info('____ READY TO LOAD APP');
            this.miniAppViewRef?.loadApp('Test01');
            setTimeout(() => this.miniAppViewRef?.restartApp('Test01'), 5000);
          }}
        />
      </View>
    );
  }
}

const LocalMiniAppScreen = LocalMiniAppScreenComponent;

export default LocalMiniAppScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

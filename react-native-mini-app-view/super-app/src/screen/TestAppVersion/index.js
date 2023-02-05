import React, {Component, version} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {V2MiniAppView} from 'react-native-mini-app-view';
import {DEVICE_HEIGHT, DEVICE_WIDTH, MINI_APP_ENV} from '../../utils/constant';
import {miniApps} from '../../../app.json';
import RNFS from 'react-native-fs';
const {Test01} = miniApps;
const {mainComponentName, packageName, deployments} = Test01;

const DOWNLOAD_FILE_PATH = `${RNFS.DocumentDirectoryPath}/${packageName}.zip`;
const UNZIP_FILE_PATH = `${RNFS.DocumentDirectoryPath}/${packageName}`;

class TestAppVersionScreenComponent extends Component {
  _miniAppViewRef = null;

  constructor(props) {
    super(props);
    // console.log("props: ", this.props);
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
        <V2MiniAppView
          style={{flex: 1}}
          ref={(ref) => (this._miniAppViewRef = ref)}
          bundleAssetName={`${UNZIP_FILE_PATH}/CodePush/main`}
          mainComponentName={mainComponentName}
          launch={true}
          onReadyToLoadApp={() => {
            this._miniAppViewRef?.loadApp();
          }}
          onViewLoaded={() => {
            console.log('onViewLoaded');
            this.setState({isLoading: false});
          }}
          onBackPressed={() => this.props.navigation.goBack()}
          onNavigate={(name) => this.props.navigation.navigate(name)}
        />
      </View>
    );
  }
}

const TestAppVersionScreen = TestAppVersionScreenComponent;

export default TestAppVersionScreen;

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

import React, {Component} from 'react';
import RNFS from 'react-native-fs';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import {MiniAppView} from 'react-native-mini-app-view';
import {miniApps} from './app.json';

const {TestTemplateMini} = miniApps;
const {packageName, mainComponentName} = TestTemplateMini;

interface Props {
  navigation: any;
  route: any;
}

interface State {
  isLoading: boolean;
  isOpenMini: boolean;
}

class App extends Component<Props, State> {
  _miniAppViewRef: MiniAppView | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isOpenMini: false,
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

  getJSBundlePath(name: string) {
    return `${RNFS.DocumentDirectoryPath}/${name}/CodePush/main`;
  }

  render() {
    const {isLoading} = this.state;
    return (
      <View style={styles.container}>
        {isLoading && this.renderLoading()}

        <MiniAppView
          ref={(ref: MiniAppView | null) => (this._miniAppViewRef = ref)}
          style={{flex: 1}}
          onReadyToLoadApp={() => {
            console.log(
              'Load App',
              this.getJSBundlePath(packageName),
              mainComponentName,
            );
            this._miniAppViewRef?.loadApp(mainComponentName, {
              screenName: 'Login',
              screenProps: {
                dataSuperApp: 'data super app: 1111',
              },
            });
          }}
          bundleAssetName={this.getJSBundlePath(packageName)}
          mainComponentName={mainComponentName}
          onBackPressed={() => this.props.navigation.goBack()}
          onViewLoaded={() =>
            this.setState({isLoading: false}, () => {
              Alert.alert('loaded');
            })
          }
          onNavigate={(name: string) => this.props.navigation.navigate(name)}
        />
      </View>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

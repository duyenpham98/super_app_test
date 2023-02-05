import React, {Component} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {checkVersionMultiMiniApp} from 'react-native-mini-app-view';
import {miniApps} from '../../../app.json';
import {
  isOpenAppFisrtTime,
  nofityPassOpenAppFirstTime,
} from '../../utils/functions';

const updateCallbacks = {
  // Update lifecycle callbacks
  onUpdateBegin: (values) => {
    // tốt
    console.log('onUpdateBegin: ', values);
  },

  onUpdateError: (error) => {
    // tốt
    console.log('onUpdateError: ', error);
  },

  onUpdateFinish: (res) => {
    // tốt
    console.log('onUpdateFinish: ', res);
  },

  // download callbacks
  onDownloadBegin: (res) => {
    // tốt
    console.log('onDownloadBegin: ', res);
  },

  onDownloadProgress: (res) => {
    // tốt
    console.log('onDownloadProgress: ', res);
    const {bytesWritten, contentLength} = res;
  },
  onDownloadFinish: (res) => {
    // tốt
    console.log('onDownloadFinish: ', res);
  },

  // unzip callbacks
  onUnzipBegin: (res) => {
    // tốt
    console.log('onUnzipBegin: ', res);
  },
  onUnzipProgress: (res) => {
    const {progress} = res;
    // tốt
    console.log('onUnzipProgress: ', res);
  },
  onUnzipFail: (error) => {
    // tốt
    console.log('onUnzipFail: ', error);
    console.error(error);
  },
  onUnzipFinish: (res) => {
    // tốt
    console.log('onUnzipFinish: ', res);
  },
  onSaveRemotePackageInfoError: (error) => {
    // tốt
    console.log('onSaveRemotePackageInfoError: ', error);
  },
};

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  _handleUpdate = async () => {
    const isFisrtTime = await isOpenAppFisrtTime();
    if (isFisrtTime) {
      console.log('_handleUpdate: handle because fisrt time!');
      checkVersionMultiMiniApp('staging', miniApps)
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
            updateApps(all, updateCallbacks)
              .then((values) => {
                console.log('ahihi-splash: ', this.props);
                nofityPassOpenAppFirstTime();
                this.props.navigation.replace('Home');
              })
              .catch((error) => {
                console.log('updateApps-error: ', error.message);
              });
          } else {
            console.log('ahihi-splash: ', this.props);
            this.props.navigation.replace('Home');
          }
        })
        .catch((error) => {
          console.log('checkVersionMultiMiniApp-error: ', error.message);
        });
    } else {
      this.props.navigation.replace('Home');
      console.log('_handleUpdate: Pass to main because not fisrt time!');
    }
  };

  componentDidMount = async () => {
    this.props.navigation.replace('Home');
    // await this._handleUpdate()
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Super App Example</Text>
        <View style={{marginTop: 100}}>
          <ActivityIndicator size="large" color={'#FFFFFF'} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007589',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
  },
});

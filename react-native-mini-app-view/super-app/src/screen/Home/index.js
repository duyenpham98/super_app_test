import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
  Text,

} from 'react-native';
import { DEVICE_WIDTH } from '../../utils/constant';
import RNFS from 'react-native-fs'
import { combineLatest } from 'rxjs'
import { miniApps } from '../../../app.json'
import AsyncStorage from '@react-native-async-storage/async-storage';

const { Test01, Test02 } = miniApps

const packageNames = [

  Test01.packageName,
  Test02.packageName
]

const DOWNLOAD_FILE_PATHS = packageNames.map(item => `${RNFS.DocumentDirectoryPath}/${item}.zip`)
const UNZIP_FILE_PATHS = packageNames.map(item => `${RNFS.DocumentDirectoryPath}/${item}`)


export default class HomeScreen extends Component {


  _resetData = () => {
    AsyncStorage.multiRemove(["IS_FIRST_TIME_OPEN_APP", ...packageNames]).then(value => {
      console.log("removeItem: ", value);

    }).catch(error => {
      console.log("removeItem-Error: ", error);
    })

    const deletePackageZipPromises = DOWNLOAD_FILE_PATHS.map(item => RNFS.unlink(item))
    const deletePackageFolderPromises = UNZIP_FILE_PATHS.map(item => RNFS.unlink(item))
    combineLatest([...deletePackageFolderPromises, ...deletePackageZipPromises]).toPromise().then(value => {
      console.log("_resetData: ", value);

    }).catch(error => {
      console.log("_resetData-Error: ", error);
    })
  }

  _renderModuleShortcut = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.7}
        style={styles.appShortcutContainer}
        onPress={item.onPress}>
        <View style={styles.appShortcutImageContainer}>
          <Image
            style={styles.shortcutImage}
            resizeMode="contain"
            source={{
              uri:
                'https://www.iconsdb.com/icons/preview/caribbean-blue/lion-xxl.png',
            }}
          />
        </View>
        <Text style={styles.shortcutTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  _renderResetData = () => {
    return <Button title="Reset Data" onPress={this._resetData} />
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          data={[
            {
              title: 'Local Mini App',
              onPress: () => this.props.navigation.navigate('LocalMiniApp'),
            },
            {
              title: 'Test App Version',
              onPress: () => this.props.navigation.navigate('TestAppVersion'),
            },
            {
              title: 'Test V2',
              onPress: () => this.props.navigation.navigate('TestV2'),
            },
          ]}
          renderItem={this._renderModuleShortcut}
        />
        {this._renderResetData()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appShortcutContainer: {
    marginTop: 20,
    width: (DEVICE_WIDTH - 40) / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appShortcutImageContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shortcutImage: {
    width: 40,
    height: 40,
  },
  shortcutTitle: {
    marginTop: 10,
    marginHorizontal: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 12,
    color: '#323C47',
  },
});

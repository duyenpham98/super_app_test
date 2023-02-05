import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import AppNavigator from './src/navigator';
import codePush from 'react-native-code-push';
import { UpdatelModal, UpdateModalHolder } from './src/components/UpdateModal';
class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <AppNavigator />
        <UpdatelModal ref={ref => UpdateModalHolder.setModal(ref)} />
      </View>
    );
  }
}

export default codePush({
  installMode: codePush.InstallMode.IMMEDIATE,
  updateDialog: {
    title: 'Thông Báo',
    optionalUpdateMessage: 'Ứng dụng đã có phiên bản mới vui lòng cập nhật.',
    optionalIgnoreButtonLabel: 'Để sau',
    optionalInstallButtonLabel: 'Cài đặt ngay',
  },
})(App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React, { Component } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Bar } from 'react-native-progress';
import { roundNumber } from '../../../../src/Utils';
import codePush from 'react-native-code-push'


export default class UpdateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      acceptUpdate: false,
      onAcceptPress: null,
      total: 0,
      done: 0,
      percent: 0
    };
  }

  show = ({
    onAcceptPress
  }) => {
    this.setState({ visible: true, onAcceptPress });
  };

  hide = () => {
    this.setState({
      visible: false,
      acceptUpdate: false,
      onAcceptPress: null,
      total: 0,
      done: 0,
      percent: 0
    });
  };

  setData = (data) => {
    this.setState({
      ...this.state,
      ...data
    })
  }

  _renderContent = () => {
    const { acceptUpdate, percent, done, total } = this.state;
    if (!acceptUpdate) {
      return (
        <Text style={styles.textContent}>
          Phiên bản tiên ích mới đã sẵn sàng. Vui lòng cập nhật.
        </Text>
      );
    }

    return (
      <View style={{ width: '90%', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.numeric}>{`${roundNumber(percent * 100)}%`}</Text>
          <Text style={styles.numeric}>{`${done}/${total}`}</Text>
        </View>
        <Bar animated={false} progress={percent} width={null} height={3} useNativeDriver={true} />
      </View >
    );
  };

  _renderAcceptButton = () => {
    const { acceptUpdate, onAcceptPress } = this.state;
    if (acceptUpdate) return null;
    return (
      <View>
        <View style={styles.separateLine} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            disabled={acceptUpdate}
            style={styles.button}
            onPress={() => {
              this.setState({ acceptUpdate: true }, () => {
                onAcceptPress && onAcceptPress()
              })
            }}>
            <Text style={styles.buttonTitle}>{'Xác nhận'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderDoneButton = () => {
    const { acceptUpdate, total, done } = this.state;
    if (!acceptUpdate || total !== done) return null;
    return (
      <View>
        <View style={styles.separateLine} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.hide()
              codePush.restartApp()
            }}>
            <Text style={styles.buttonTitle}>{'Hoàn tất'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };


  render() {
    const { visible, acceptUpdate, total, done } = this.state;
    return (
      <Modal visible={visible} transparent>
        <View style={styles.container}>
          <View style={[styles.dialogContainer, { minHeight: acceptUpdate ? 0 : 146 }]}>
            <Text style={styles.title}>{!acceptUpdate ? "Thông báo" : done < total ? "Đang cập nhật" : "Đã cập nhật"}</Text>
            <View style={[styles.contentContainer, { flex: acceptUpdate ? 0 : 1 }]}>
              {this._renderContent()}
            </View>
            {this._renderAcceptButton()}
            {this._renderDoneButton()}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    width: 278,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontWeight: '600',
    fontSize: 18,
    fontStyle: 'normal',
    textAlign: 'center',
    // fontFamily: 'SVN-Poppins',
  },
  contentContainer: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    fontWeight: '400',
    fontSize: 14,
    fontStyle: 'normal',
    textAlign: 'center',
    // fontFamily: 'SVN-Poppins',
  },
  separateLine: {
    marginTop: 16,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: 16,
  },
  buttonTitle: {
    // fontFamily: 'SVN-Poppins',
    color: '#109CF1',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 16,
  },
  numeric: {
    fontSize: 20,
    color: '#192A3E',
    marginBottom: 6
  }
});

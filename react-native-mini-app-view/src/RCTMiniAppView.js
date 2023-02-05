import React, {Component} from 'react';
import {
  findNodeHandle,
  NativeModules,
  Platform,
  requireNativeComponent,
} from 'react-native';
import {log} from './Utils';

const {MiniAppViewManager} = NativeModules;
const RCTMiniAppView = requireNativeComponent('RCTMiniAppView');
export default class MiniAppView extends Component {
  _viewRef = null;

  constructor(props) {
    super(props);
  }

  _onChange = event => {
    const {eventName, ...data} = event.nativeEvent;
    const {onBackPressed, onNavigate, onViewLoaded, onReadyToLoadApp} =
      this.props;
    switch (eventName) {
      case 'onBackPressed':
        onBackPressed && onBackPressed();
        return;
      case 'onNavigate':
        const {name, params} = data;
        onNavigate && onNavigate(name, params);
        return;
      case 'onViewLoaded':
        onViewLoaded && onViewLoaded();
        return;
      case 'onReadyToLoadApp':
        onReadyToLoadApp && onReadyToLoadApp();
        return;
      default:
        break;
    }
  };

  loadApp = (appName = '', params = {}) => {
    const tag =
      Platform.OS === 'android' ? findNodeHandle(this._viewRef) : appName;
    console.log('APP NAME', tag);
    if (tag != null) {
      MiniAppViewManager?.loadApp(tag, params)
        .then(_ => {
          log('MiniAppView::loadApp: DONE');
        })
        .catch(error => {
          console.error('MiniAppView::loadApp: ' + error);
        });
    }
  };

  restartApp = (appName = '') => {
    const tag =
      Platform.OS === 'android' ? findNodeHandle(this._viewRef) : appName;
    if (tag != null) {
      MiniAppViewManager?.restartApp(tag)
        .then(_ => {
          log('MiniAppView::restartApp: DONE');
        })
        .catch(error => {
          console.error('MiniAppView::restartApp: ' + error);
        });
    }
  };

  render() {
    return (
      <RCTMiniAppView
        {...this.props}
        ref={ref => (this._viewRef = ref)}
        onChange={this._onChange}
      />
    );
  }
}

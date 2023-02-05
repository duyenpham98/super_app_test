# react-native-mini-app-view

## Getting started

`$ yarn add react-native-mini-app-view`

### Mostly automatic installation

`$ react-native link react-native-mini-app-view`

## Usage super app

```typescript
import React, { Component } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { MiniAppView } from "react-native-mini-app-view";

const DEVICE_HEIGHT = Dimensions.get("screen").height;
const DEVICE_WIDTH = Dimensions.get("screen").width;

interface Props {
  navigation: any;
}

interface State {
  isLoading: boolean;
}

class DemoScreenComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"blue"} />
        <Text>Loading JS bundle...</Text>
      </View>
    );
  };

  render() {
    const { isLoading } = this.state;
    return (
      <View style={styles.container}>
        {isLoading && this.renderLoading()}
        <MiniAppView
          style={{ flex: 1 }}
          bundleAssetName="Path to main.jsbundle mini app. Example: demo_module/main"
          mainComponentName="Main component is appName in your app.json"
          launch={true}
          onBackPressed={() => this.props.navigation.goBack()}
          onViewLoaded={() => {
            this.setState({ isLoading: false });
          }}
          onNavigate={(name: string) => {
            this.props.navigation.navigate(name);
          }}
        />
      </View>
    );
  }
}

const DemoScreen = DemoScreenComponent;

export default DemoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
## Usage mini app
import AsyncStorage from '@react-native-async-storage/async-storage';
const {MiniAppViewManager} = NativeModules;

 ```goback

  MiniAppViewManager?.goBack(appName in your app.json);

 ```navigate from mini app to mini app

 MiniAppViewManager?.navigate(appName in your app.json of project, name component mini app in navigator of super app, params route);

 example: 
  AsyncStorage.multiSet(
                [
                  ["Id", '11111'],
                  ["type", "complaint"],
                  ["currentTicket", 'test'],
                ],
                () => {
                  MiniAppViewManager?.navigate(appName in your app.json of project, name component mini app in navigator of super app, {
                    Id: '11111',
                    type: "complaint",
                    currentTicket: 'test',
                  });
                }
            );

 ---or---

  AsyncStorage.setItem('data', '1234');
  MiniAppViewManager?.navigate(appName in your app.json of project, name component mini app in navigator of super app, {data: '1234'}); 
  
```get params route of mini app

 AsyncStorage.getItem(name data);
  
 example:

  AsyncStorage.getItem('backToSuperApp', (error?: Error, result?: string) => {
      if (result && result.length > 0) {
        AsyncStorage.setItem('backToSuperApp', '');
        MiniAppViewManager?.goBack(appName in your app.json of project);
      } else {
        goBack();
      }
    });

  ---or--- 

   AsyncStorage.multiGet(['Id', 'type', 'currentTicket'], (errors, result: any) => {
     if (result && result.length > 0) {
        return {
          Id: result[0][1],
          type: result[1][1],
          currentTicket: result[2][1]
        }
      }
      return
    });

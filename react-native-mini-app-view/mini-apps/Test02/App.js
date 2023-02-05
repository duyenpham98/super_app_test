import React, { Component } from 'react'
import { StyleSheet, Text } from 'react-native'
import AppNavigator from './src/navigator'

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        {/* <AppNavigator /> */}
        <Text>ahihi</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lime"
  }
})










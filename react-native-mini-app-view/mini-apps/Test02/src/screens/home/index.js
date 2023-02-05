import React, { Component } from 'react'
import { Button, NativeModules, StyleSheet, Text, View } from 'react-native'
const { MiniAppViewManager } = NativeModules

export default class HomeScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Test 02</Text>
                <Button title="detail" onPress={() => {
                    this.props.navigation.navigate('Detail')
                }} />
                <Text>Super App</Text>
                <Button title="detail" onPress={() => {
                    MiniAppViewManager?.navigate("Test02", "dest", { data: 1234 })
                }} />
                <Button title="go back" onPress={() => {
                    MiniAppViewManager?.goBack("Test02")
                }} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

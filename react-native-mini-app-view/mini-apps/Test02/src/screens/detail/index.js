import React, { Component } from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

export default class DetailScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>Detail</Text>
                <Button title="go back" onPress={() => {
                    this.props.navigation.goBack()
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

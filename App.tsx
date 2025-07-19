// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NativeModules } from 'react-native';
import Main from './src/screens/main';
import { useTheme } from './src/theme';

export default function App() {
    const theme = useTheme();
    console.log("AudioFilterModule:", NativeModules.AudioFilterModule);
    return (
        <SafeAreaProvider>
                <View
                    style={[
                        styles.container,
                        { backgroundColor: theme.background },
                    ]}
                >
                    <Main />
                    <StatusBar style="auto" />
                </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

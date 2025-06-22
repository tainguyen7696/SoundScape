// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Main from 'screens/main';
import { useTheme } from './src/theme';

export default function App() {
    const theme = useTheme();

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Main />
                {<StatusBar style="auto" />}
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

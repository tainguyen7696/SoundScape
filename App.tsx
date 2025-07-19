// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, NativeModules } from 'react-native';
import Main from './src/screens/main';
import { useTheme } from './src/theme';

export default function App() {
    const theme = useTheme();
    const hasAudioModule = NativeModules.AudioFilterModule != null;

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* 🚨 On‑screen smoke test */}
                <Text style={styles.smoke}>
                    AudioFilterModule loaded? {hasAudioModule ? '✅ Yes' : '❌ No'}
                </Text>

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
    smoke: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 8,
    },
});

// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Main from 'screens/main';
import { useTheme } from './src/theme';

// Track Player imports
import TrackPlayer, { Capability } from 'react-native-track-player';

export default function App() {
    const theme = useTheme();

    useEffect(() => {
        (async () => {
            // 1) Initialize the player
            await TrackPlayer.setupPlayer();

            // 2) Configure options (including crossfade duration)
            await TrackPlayer.updateOptions({
                stopWithApp: true,
                // WHAT YOU NEED: crossfadeDuration in seconds
                crossfadeDuration: 2,
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
                compactCapabilities: [Capability.Play, Capability.Pause],
            });

            // 3) Register your background service
            TrackPlayer.registerPlaybackService(() => require('./src/playerService'));
        })();
    }, []);

    return (
        <SafeAreaProvider>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
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

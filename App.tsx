// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Main from 'screens/main';
import { useTheme } from './src/theme';
import { VoiceCommandProvider } from './src/voice/VoiceCommandContext';
import { VoiceCommandListener } from './src/components/VoiceCommandListener';
import TrackPlayer, { Capability } from 'react-native-track-player';
import audioEngine from './src/audio/audioEngine';

export default function App() {
    const theme = useTheme();

    useEffect(() => {
        (async () => {
            // 0) Initialize AudioEngine (fetch sound URLs from Supabase)
            try {
                await audioEngine.init();
            } catch (err) {
                console.error('AudioEngine initialization failed:', err);
            }

            // 1) Initialize the track player
            await TrackPlayer.setupPlayer();

            // 2) Configure player options (including crossfade)
            await TrackPlayer.updateOptions({
                stopWithApp: true,
                crossfadeDuration: 2, // 2 seconds crossfade between tracks
                capabilities: [
                    Capability.Play,
                    Capability.Pause,
                    Capability.SkipToNext,
                    Capability.SkipToPrevious,
                ],
                compactCapabilities: [Capability.Play, Capability.Pause],
            });

            // 3) Register background service for remote controls
            TrackPlayer.registerPlaybackService(() => require('./src/playerService'));
        })();
    }, []);

    return (
        <SafeAreaProvider>
            <VoiceCommandProvider>
                <View style={[styles.container, { backgroundColor: theme.background }]}>
                    <Main />
                    <StatusBar style="auto" />
                </View>

                {/* Debug overlay to visualize last voice command and state */}
                <VoiceCommandListener />
            </VoiceCommandProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

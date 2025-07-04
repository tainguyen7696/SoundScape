// App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, View, StyleSheet, Platform } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Main from './src/screens/main';
import { useTheme } from './src/theme';
import { VoiceCommandProvider } from './src/voice/VoiceCommandContext';
import { VoiceCommandListener } from './src/components/VoiceCommandListener';
import audioEngine from './src/audio/audioEngine';

export default function App() {
    const theme = useTheme();

    useEffect(() => {
        (async () => {
            // 0) Initialize AudioEngine
            try {
                await audioEngine.init();
            } catch (err) {
                console.error('AudioEngine initialization failed:', err);
            }

            // 1) Detect if we’re in Expo Go
            const isExpoGo =
                Constants.appOwnership === 'expo' && Platform.OS !== 'web';
            console.log(
                '[App] appOwnership=',
                Constants.appOwnership,
                'Platform.OS=',
                Platform.OS,
                '=> isExpoGo=',
                isExpoGo
            );

            if (isExpoGo) {
                console.warn('[App] Skipping TrackPlayer init in Expo Go');
                return;
            }

            // 2) Dynamically require TrackPlayer
            let TrackPlayer: typeof import('react-native-track-player').default;
            let Capability: typeof import('react-native-track-player').Capability;
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const tp = require('react-native-track-player');
                TrackPlayer = tp.default;
                Capability = tp.Capability;
            } catch (e) {
                console.error('[App] require TrackPlayer failed:', e);
                return;
            }

            // 3) Setup TrackPlayer
            try {
                console.log('[App] Setting up TrackPlayer...');
                await TrackPlayer.setupPlayer();
                await TrackPlayer.updateOptions({
                    stopWithApp: true,
                    crossfadeDuration: 2,
                    capabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                    ],
                    compactCapabilities: [Capability.Play, Capability.Pause],
                });
                console.log('[App] TrackPlayer ready');
            } catch (e) {
                console.error('[App] TrackPlayer setup error:', e);
            }

            // 4) Register background service
            try {
                TrackPlayer.registerPlaybackService(() =>
                    require('./src/playerService')
                );
                console.log('[App] Playback service registered');
            } catch (e) {
                console.error(
                    '[App] registerPlaybackService failed:',
                    e
                );
            }
        })();
    }, []);

    return (
        <SafeAreaProvider>
            <VoiceCommandProvider>
                <View
                    style={[
                        styles.container,
                        { backgroundColor: theme.background },
                    ]}
                >
                    <Main />
                    <StatusBar style="auto" />
                </View>

                {/* Debug overlay */}
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

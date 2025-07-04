// src/hooks/useScenePlayer.ts
import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export interface SceneSound {
    title: string;
    audioUrl: string;
    volume: number;     // [0.0–1.0]
    warmth: number;     // unused here
    backgroundImage: any; // not used here
}

export function useScenePlayer(
    sounds: SceneSound[],
    isPlaying: boolean,
    masterVolume: number
) {
    const isExpoGo = Constants.appOwnership === 'expo' && Platform.OS !== 'web';
    const soundMap = useRef<Map<string, Audio.Sound>>(new Map());
    const trackPlayerInitialized = useRef(false);

    //
    // 1) Configure iOS Audio Session for expo-av so that it plays when Silent is on
    //
    useEffect(() => {
        if (Platform.OS === 'ios') {
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,         // ← ignore hardware silent switch
                staysActiveInBackground: true,      // continue playing in background
                shouldDuckAndroid: false,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            }).catch(console.warn);
        }
    }, []);

    //
    // 2) Initialize react-native-track-player once (native branch)
    //
    useEffect(() => {
        if (!isExpoGo && !trackPlayerInitialized.current) {
            const tp = require('react-native-track-player');
            const TrackPlayer = tp.default;

            TrackPlayer.setupPlayer()
                .then(async () => {
                    await TrackPlayer.updateOptions({
                        stopWithApp: false,
                        alwaysPauseOnInterruption: true,
                        iosCategory: 'playback',           // ← ignore silent switch
                        iosCategoryMode: 'default',
                        iosCategoryOptions: [
                            'mixWithOthers',                  // allow other audio to mix
                            'duckOthers',                     // duck other audio
                        ],
                        capabilities: [
                            TrackPlayer.CAPABILITY_PLAY,
                            TrackPlayer.CAPABILITY_PAUSE,
                            TrackPlayer.CAPABILITY_STOP,
                        ],
                    });
                    trackPlayerInitialized.current = true;
                })
                .catch(console.warn);
        }
    }, [isExpoGo]);

    //
    // 3) Prune any sounds that are no longer in the `sounds` array
    //
    useEffect(() => {
        (async () => {
            const keep = new Set(sounds.map(s => s.title));
            for (let key of Array.from(soundMap.current.keys())) {
                if (!keep.has(key)) {
                    const snd = soundMap.current.get(key)!;
                    await snd.stopAsync().catch(() => { });
                    await snd.unloadAsync().catch(() => { });
                    soundMap.current.delete(key);
                }
            }
        })();
    }, [sounds.map(s => s.title).join('|')]);

    //
    // 4) Play / pause logic
    //
    useEffect(() => {
        (async () => {
            // STOP everything if not playing
            if (!isPlaying || sounds.length === 0) {
                if (isExpoGo) {
                    for (let snd of soundMap.current.values()) {
                        await snd.stopAsync().catch(() => { });
                    }
                } else {
                    const tp = require('react-native-track-player').default;
                    await tp.stop().catch(() => { });
                }
                return;
            }

            // EXPO GO branch: loop each sound
            if (isExpoGo) {
                for (let layer of sounds) {
                    let snd = soundMap.current.get(layer.title);
                    if (!snd) {
                        const { sound: loaded } = await Audio.Sound.createAsync(
                            { uri: layer.audioUrl },
                            { isLooping: true }
                        );
                        soundMap.current.set(layer.title, loaded);
                        snd = loaded;
                    }
                    await snd.setPositionAsync(0);
                    await snd.setVolumeAsync(masterVolume * layer.volume);
                    await snd.playAsync();
                }

                // NATIVE TrackPlayer branch: reset and play first sound
            } else {
                const tp = require('react-native-track-player').default;

                await tp.reset();
                const first = sounds[0];
                await tp.add({
                    id: first.title,
                    url: first.audioUrl,
                    title: first.title,
                    artist: '',
                    artwork: '',
                });
                await tp.setVolume(masterVolume * first.volume);
                await tp.play();
            }
        })();
    }, [isPlaying, sounds.map(s => s.title).join('|')]);

    //
    // 5) Volume-only updates
    //
    useEffect(() => {
        if (isExpoGo) {
            for (let layer of sounds) {
                const snd = soundMap.current.get(layer.title);
                if (snd) {
                    snd.setVolumeAsync(masterVolume * layer.volume).catch(() => { });
                }
            }
        } else if (sounds.length) {
            const first = sounds[0];
            const tp = require('react-native-track-player').default;
            tp.setVolume(masterVolume * first.volume).catch(() => { });
        }
    }, [masterVolume, sounds.map(s => `${s.title}-${s.volume}`).join('|')]);

    //
    // 6) Cleanup on unmount
    //
    useEffect(() => {
        return () => {
            if (isExpoGo) {
                soundMap.current.forEach(snd => {
                    snd.stopAsync().catch(() => { });
                    snd.unloadAsync().catch(() => { });
                });
                soundMap.current.clear();
            } else {
                try {
                    require('react-native-track-player').default.destroy().catch(() => { });
                } catch { }
            }
        };
    }, []);
}

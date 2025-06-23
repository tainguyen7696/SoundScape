// src/hooks/useAudioPlayer.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface CurrentSound {
    audioUrl: string;
    settings: {
        volume: number;
        soften: number;
        oscillate: boolean;
    };
}

export function useAudioPlayer(
    sounds: CurrentSound[],
    isPlaying: boolean,
    masterVolume: number = 1
) {
    type NativePair = { a: Audio.Sound; b: Audio.Sound; duration: number };
    const nativePlayers = useRef<NativePair[]>([]);
    const webPlayers = useRef<Audio.Sound[]>([]);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    // Configure audio mode once
    useEffect(() => {
        if (Platform.OS !== 'web') {
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: false,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            }).catch(err => console.warn(err));
        }
    }, []);

    // Load/unload when sounds list changes
    useEffect(() => {
        let cancelled = false;
        (async () => {
            // unload old players
            if (Platform.OS === 'web') {
                await Promise.all(webPlayers.current.map(s => s.unloadAsync()));
                webPlayers.current = [];
            } else {
                timersRef.current.forEach(clearTimeout);
                await Promise.all(nativePlayers.current.flatMap(p => [p.a.unloadAsync(), p.b.unloadAsync()]));
                nativePlayers.current = [];
            }
            if (cancelled) return;

            // create new players aligned with sounds length
            for (let i = 0; i < sounds.length; i++) {
                const { audioUrl, settings } = sounds[i];
                const vol = settings.volume * masterVolume;
                if (Platform.OS === 'web') {
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: audioUrl },
                        { volume: vol, isLooping: true }
                    );
                    webPlayers.current[i] = sound;
                } else {
                    const { sound: a, status } = await Audio.Sound.createAsync(
                        { uri: audioUrl },
                        { volume: 0, isLooping: false }
                    );
                    const duration = status.durationMillis || 0;
                    const { sound: b } = await Audio.Sound.createAsync(
                        { uri: audioUrl },
                        { volume: 0, isLooping: false }
                    );
                    nativePlayers.current[i] = { a, b, duration };
                }
            }
            // trim any extra players
            webPlayers.current = webPlayers.current.slice(0, sounds.length);
            nativePlayers.current = nativePlayers.current.slice(0, sounds.length);

            // auto-play if necessary
            if (isPlaying) {
                if (Platform.OS === 'web') {
                    webPlayers.current.forEach(sound => sound.playAsync());
                } else {
                    nativePlayers.current.forEach((pair, idx) => {
                        const { a, b, duration } = pair;
                        const baseVol = sounds[idx].settings.volume * masterVolume;
                        const overlap = Math.min(duration / 2, 10000);
                        const doLoop = () => {
                            a.setStatusAsync({ volume: baseVol });
                            a.setPositionAsync(0).then(() => a.playAsync());
                            const t1 = setTimeout(() => {
                                b.setStatusAsync({ volume: baseVol });
                                b.setPositionAsync(0).then(() => b.playAsync());
                            }, duration - overlap);
                            const t2 = setTimeout(() => {
                                a.stopAsync();
                                if (isPlaying) doLoop();
                            }, duration);
                            timersRef.current.push(t1, t2);
                        };
                        doLoop();
                    });
                }
            }
        })();
        return () => { cancelled = true; };
    }, [sounds.map(s => s.audioUrl).join('|'), isPlaying]);

    // Play/Pause toggle effect
    useEffect(() => {
        if (Platform.OS === 'web') {
            for (let i = 0; i < sounds.length; i++) {
                const sound = webPlayers.current[i];
                if (!sound) continue;
                if (isPlaying) sound.playAsync(); else sound.pauseAsync();
            }
        } else {
            timersRef.current.forEach(clearTimeout);
            for (let i = 0; i < sounds.length; i++) {
                const pair = nativePlayers.current[i];
                if (!pair) continue;
                const { a, b, duration } = pair;
                a.stopAsync(); b.stopAsync();
                if (isPlaying) {
                    const baseVol = sounds[i].settings.volume * masterVolume;
                    const overlap = Math.min(duration / 2, 10000);
                    const doLoop = () => {
                        a.setStatusAsync({ volume: baseVol });
                        a.setPositionAsync(0).then(() => a.playAsync());
                        const t1 = setTimeout(() => {
                            b.setStatusAsync({ volume: baseVol });
                            b.setPositionAsync(0).then(() => b.playAsync());
                        }, duration - overlap);
                        const t2 = setTimeout(() => {
                            a.stopAsync();
                            if (isPlaying) doLoop();
                        }, duration);
                        timersRef.current.push(t1, t2);
                    };
                    doLoop();
                }
            }
        }
    }, [isPlaying]);

    // Volume update effect
    useEffect(() => {
        if (Platform.OS === 'web') {
            for (let i = 0; i < sounds.length; i++) {
                const sound = webPlayers.current[i];
                if (!sound) continue;
                const vol = sounds[i].settings.volume * masterVolume;
                sound.setStatusAsync({ volume: vol });
            }
        } else {
            for (let i = 0; i < sounds.length; i++) {
                const pair = nativePlayers.current[i];
                if (!pair) continue;
                const vol = sounds[i].settings.volume * masterVolume;
                pair.a.setStatusAsync({ volume: vol });
                pair.b.setStatusAsync({ volume: vol });
            }
        }
    }, [masterVolume, sounds.map(s => s.settings.volume).join('|')]);

    return null;
}

// src/hooks/useScenePlayerExpo.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface SceneSound {
    title: string;
    audioUrl: string;
    volume: number;
    warmth: number;
    backgroundImage: any;
}

export function useScenePlayerExpo(
    sounds: SceneSound[],
    isPlaying: boolean,
    masterVolume: number
) {
    const soundMap = useRef<Map<string, Audio.Sound>>(new Map());

    // 1) ensure playback in silent mode on iOS
    useEffect(() => {
        if (Platform.OS === 'ios') {
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: false,
                interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            }).catch(console.warn);
        }
    }, []);

    // 2) remove old sounds
    useEffect(() => {
        const keep = new Set(sounds.map(s => s.title));
        (async () => {
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

    // 3) play / pause / loop
    useEffect(() => {
        (async () => {
            if (!isPlaying || sounds.length === 0) {
                for (let snd of soundMap.current.values()) {
                    await snd.stopAsync().catch(() => { });
                }
                return;
            }
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
        })();
    }, [isPlaying, sounds.map(s => s.title).join('|')]);

    // 4) volume updates
    useEffect(() => {
        for (let layer of sounds) {
            const snd = soundMap.current.get(layer.title);
            if (snd) {
                snd.setVolumeAsync(masterVolume * layer.volume).catch(() => { });
            }
        }
    }, [masterVolume, sounds.map(s => `${s.title}-${s.volume}`).join('|')]);

    // 5) cleanup
    useEffect(() => {
        return () => {
            soundMap.current.forEach(snd => {
                snd.stopAsync().catch(() => { });
                snd.unloadAsync().catch(() => { });
            });
            soundMap.current.clear();
        };
    }, []);
}

// src/hooks/useAudioPlayer.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export interface CurrentSound {
    audioUrl: string;
    settings: {
        volume: number;     // 0.0–1.0
        soften: number;     // TODO
        oscillate: boolean; // on/off
    };
}

export function useAudioPlayer(
    sounds: CurrentSound[],
    isPlaying: boolean,
    masterVolume: number = 1
) {
    type Pair = { a: Audio.Sound; b: Audio.Sound; duration: number };
    const playersRef = useRef<Pair[]>([]);
    const timersRef = useRef<NodeJS.Timeout[]>([]);

    // 1) Configure audio mode once
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        });
    }, []);

    // 2) Load/unload on URL change
    useEffect(() => {
        let cancelled = false;

        (async () => {
            // clear old timers & unload
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
            await Promise.all(
                playersRef.current.flatMap(p => [p.a.unloadAsync(), p.b.unloadAsync()])
            );
            playersRef.current = [];

            for (let i = 0; i < sounds.length; i++) {
                if (cancelled) break;
                const { audioUrl, settings } = sounds[i];

                // create first Sound, capture its status for duration
                const { sound: a, status } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { volume: 0, isLooping: false }
                );
                const duration = status.durationMillis ?? 0;

                // create second Sound
                const { sound: b } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { volume: 0, isLooping: false }
                );

                // store the pair + duration
                playersRef.current[i] = { a, b, duration };

                // if already playing, start its loop immediately
                if (isPlaying) {
                    startLoop(playersRef.current[i], settings);
                }
            }
        })();

        return () => {
            cancelled = true;
            timersRef.current.forEach(clearTimeout);
            playersRef.current.flatMap(p => [p.a.unloadAsync(), p.b.unloadAsync()]);
            playersRef.current = [];
        };
    }, [sounds.map(s => s.audioUrl).join('|')]);

    // 3) Cross‐fade loop helper using stored duration
    const startLoop = (pair: Pair, settings: CurrentSound['settings']) => {
        const { a, b, duration } = pair;
        if (duration <= 0) {
            console.warn('Invalid duration, skipping loop');
            return;
        }

        const overlap = Math.min(duration / 2, 10_000);
        const baseVol = settings.volume * masterVolume;

        const doLoop = () => {
            // start A
            a.setPositionAsync(0).then(() => a.playAsync());
            a.setStatusAsync({ volume: baseVol });

            // schedule B overlap
            const t1 = setTimeout(() => {
                b.setPositionAsync(0).then(() => b.playAsync());
                const steps = 30;
                for (let i = 1; i <= steps; i++) {
                    const pct = i / steps;
                    const fadeTimer = setTimeout(() => {
                        a.setStatusAsync({ volume: baseVol * (1 - pct) });
                        b.setStatusAsync({ volume: baseVol * pct });
                    }, (overlap / steps) * i);
                    timersRef.current.push(fadeTimer);
                }
            }, duration - overlap);

            // schedule next iteration
            const t2 = setTimeout(() => {
                a.stopAsync();
                if (isPlaying) doLoop();
            }, duration);

            timersRef.current.push(t1, t2);
        };

        doLoop();
    };

    // 4) Play / Pause effect (starts loops or stops them)
    useEffect(() => {
        // clear any pending timers
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        playersRef.current.forEach((pair, idx) => {
            const settings = sounds[idx]?.settings;
            if (!pair || !settings) return;

            // stop both before toggling
            pair.a.stopAsync();
            pair.b.stopAsync();

            if (isPlaying) {
                startLoop(pair, settings);
            }
        });
    }, [isPlaying]);

    // 5) Volume updates in-place
    useEffect(() => {
        playersRef.current.forEach((pair, idx) => {
            const settings = sounds[idx]?.settings;
            if (!pair || !settings) return;
            const vol = settings.volume * masterVolume;
            pair.a.setStatusAsync({ volume: vol });
            pair.b.setStatusAsync({ volume: vol });
        });
    }, [sounds.map(s => s.settings.volume).join('|'), masterVolume]);

    return null;
}

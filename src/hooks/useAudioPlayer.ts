// src/hooks/useAudioPlayer.ts
import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export interface CurrentSound {
    audioUrl: string;
    settings: {
        volume: number;       // 0.0 – 1.0
        soften: number;       // 0.0 – 1.0 (TODO: implement real DSP)
        oscillate: number;    // 0.0 – 1.0, amount to modulate volume
    };
}

/**
 * Hook to load/play/pause a list of sounds with individual settings.
 * @param sounds   array of CurrentSound
 * @param isPlaying   whether playback should be running
 */
export function useAudioPlayer(sounds: CurrentSound[], isPlaying: boolean) {
    // refs to the loaded Audio.Sound instances
    const playersRef = useRef<Audio.Sound[]>([]);
    // refs to any oscillation intervals
    const intervalsRef = useRef<NodeJS.Timeout[]>([]);

    // Whenever the sounds array changes, unload old and load new
    useEffect(() => {
        let cancelled = false;
        async function loadAll() {
            // Unload previous
            await Promise.all(playersRef.current.map(p => p.unloadAsync()));
            playersRef.current = [];
            intervalsRef.current.forEach(i => clearInterval(i));
            intervalsRef.current = [];

            // Load new
            for (const s of sounds) {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: s.audioUrl },
                    { shouldPlay: false, volume: s.settings.volume }
                );
                playersRef.current.push(sound);

                // set up oscillation if requested
                if (s.settings.oscillate > 0) {
                    const baseVol = s.settings.volume;
                    const amp = s.settings.oscillate * baseVol;
                    let phase = 0;
                    const interval = setInterval(() => {
                        phase = (phase + Math.PI / 30) % (2 * Math.PI);
                        const v = baseVol + Math.sin(phase) * amp;
                        sound.setStatusAsync({ volume: Math.max(0, Math.min(1, v)) });
                    }, 100);
                    intervalsRef.current.push(interval);
                }
            }
        }

        loadAll();

        return () => {
            cancelled = true;
            // cleanup on unmount
            playersRef.current.forEach(p => p.unloadAsync());
            intervalsRef.current.forEach(i => clearInterval(i));
        };
    }, [sounds]);

    // When isPlaying toggles, play or pause all
    useEffect(() => {
        (async () => {
            if (isPlaying) {
                await Promise.all(playersRef.current.map(p => p.playAsync()));
            } else {
                await Promise.all(playersRef.current.map(p => p.pauseAsync()));
            }
        })();
    }, [isPlaying]);

    // If just the settings change (volume or oscillate) on existing sounds,
    // you may want to rebuild or update statuses here. For simplicity,
    // we assume the load-effect runs when settings change too.

    return null; // no UI
}

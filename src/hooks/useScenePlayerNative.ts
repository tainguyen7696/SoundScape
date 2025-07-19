// src/hooks/useScenePlayerNative.ts
import { useEffect } from 'react';
import { NativeModules } from 'react-native';

// Native audio filter + playback module
const { AudioFilterModule } = NativeModules;

export interface SceneSound {
    title: string;
    audioUrl: string;
    volume: number;       // [0.0–1.0]
    warmth: number;       // [0.0–1.0]
    backgroundImage: any; // unused here
}

// Convert warmth [0–1] into low‑pass cutoff frequency (Hz)
function softenToCutoff(soften: number): number {
    const max = 20000;  // Hz
    const min = 200;    // Hz
    return min + (1 - soften) * (max - min);
}

/**
 * Native‑only sound hook: uses your AudioFilterModule to play, loop,
 * filter, and control volume for multiple sounds.
 */
export function useScenePlayerNative(
    sounds: SceneSound[],
    isPlaying: boolean,
    masterVolume: number
) {
    // 1) Play or stop all sounds
    useEffect(() => {
        if (AudioFilterModule == null) return;
        if (!isPlaying || sounds.length === 0) {
            AudioFilterModule.stop();
            return;
        }
        // Restart: stop previous playback
        AudioFilterModule.stop();
        // Schedule each sound to loop and set its volume
        for (let layer of sounds) {
            AudioFilterModule.playUrl(layer.audioUrl);
            // initial volume per layer
            const vol = masterVolume * layer.volume;
            AudioFilterModule.setVolumeForUrl(layer.audioUrl, vol);
        }
    }, [isPlaying, sounds.map(s => s.audioUrl).join('|'), masterVolume]);

    // 2) Update low‑pass cutoff whenever warmth changes
    useEffect(() => {
        if (AudioFilterModule == null) return;
        if (!isPlaying || sounds.length === 0) return;
        const avgWarmth = sounds.reduce((sum, s) => sum + s.warmth, 0) / sounds.length;
        const cutoff = softenToCutoff(avgWarmth);
        AudioFilterModule.setCutoff(cutoff);
    }, [isPlaying, sounds.map(s => s.warmth).join('|')]);

    // 3) Update volume-only on masterVolume or individual volume change
    useEffect(() => {
        if (AudioFilterModule == null) return;
        if (!isPlaying || sounds.length === 0) return;
        for (let layer of sounds) {
            const vol = masterVolume * layer.volume;
            AudioFilterModule.setVolumeForUrl(layer.audioUrl, vol);
        }
    }, [masterVolume, sounds.map(s => `${s.audioUrl}-${s.volume}`).join('|')]);
}

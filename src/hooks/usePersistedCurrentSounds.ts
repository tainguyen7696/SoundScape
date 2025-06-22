// src/hooks/usePersistedCurrentSounds.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'MYAPP_CURRENT_SOUNDS';

export interface PersistedSound {
    title: string;
    audioUrl: string;
    backgroundImage?: string;
    settings: { volume: number; soften: number; oscillate: number };
}

export function usePersistedCurrentSounds() {
    const [currentSounds, setCurrentSounds] = useState<PersistedSound[]>([]);

    // Load saved sounds on mount and log
    useEffect(() => {
        (async () => {
            try {
                const json = await AsyncStorage.getItem(STORAGE_KEY);
                console.debug('[PersistedSounds] loaded raw:', json);
                if (json) {
                    const parsed = JSON.parse(json);
                    console.debug('[PersistedSounds] parsed:', parsed);
                    setCurrentSounds(parsed);
                }
            } catch (err) {
                console.error('[PersistedSounds] load error:', err);
            }
        })();
    }, []);

    // Save on change and log
    useEffect(() => {
        (async () => {
            try {
                const json = JSON.stringify(currentSounds);
                console.debug('[PersistedSounds] saving:', json);
                await AsyncStorage.setItem(STORAGE_KEY, json);
            } catch (err) {
                console.error('[PersistedSounds] save error:', err);
            }
        })();
    }, [currentSounds]);

    return [currentSounds, setCurrentSounds] as const;
}

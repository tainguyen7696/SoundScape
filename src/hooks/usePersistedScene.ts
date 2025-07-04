// src/hooks/usePersistedScene.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'MYAPP_CURRENT_SOUNDS';

export interface PersistedSound {
    title: string;
    audioUrl: string;
    backgroundImage?: string;
    settings: { volume: number; warmth: number; };
}

export function usePersistedScene() {
    const [Scene, setScene] = useState<PersistedSound[]>([]);

    // Load saved sounds on mount and log
    useEffect(() => {
        (async () => {
            try {
                const json = await AsyncStorage.getItem(STORAGE_KEY);
                if (json) {
                    const parsed = JSON.parse(json);
                    setScene(parsed);
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
                const json = JSON.stringify(Scene);
                await AsyncStorage.setItem(STORAGE_KEY, json);
            } catch (err) {
                console.error('[PersistedSounds] save error:', err);
            }
        })();
    }, [Scene]);

    return [Scene, setScene] as const;
}

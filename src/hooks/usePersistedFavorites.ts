// src/hooks/usePersistedFavorites.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'MYAPP_FAVORITES';

export function usePersistedFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load on mount and log
    useEffect(() => {
        (async () => {
            try {
                const json = await AsyncStorage.getItem(FAVORITES_KEY);
                console.debug('[Favorites] loaded raw:', json);
                if (json) {
                    const parsed = JSON.parse(json);
                    console.debug('[Favorites] parsed:', parsed);
                    setFavorites(parsed);
                }
            } catch (err) {
                console.error('[Favorites] load error:', err);
            }
        })();
    }, []);

    // Save on change and log
    useEffect(() => {
        (async () => {
            try {
                const json = JSON.stringify(favorites);
                console.debug('[Favorites] saving:', json);
                await AsyncStorage.setItem(FAVORITES_KEY, json);
            } catch (err) {
                console.error('[Favorites] save error:', err);
            }
        })();
    }, [favorites]);

    return [favorites, setFavorites] as const;
}

import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface SoundRecord {
    id: string;
    title: string;
    audio_url: string;
    background_image_url: string | null;
    is_premium: boolean;
    isFavorite: boolean;
}

export interface CachedSound {
    title: string;
    localAudio: string;
    localImage: string | null;
    isPremium: boolean;
    isFavorite: boolean;
}

// helper: download & cache a remote file
async function cacheFile(
    remoteUrl: string,
    subfolder: 'sounds' | 'images'
): Promise<string> {
    const cacheDir = FileSystem.cacheDirectory + subfolder + '/';
    await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });

    const storageKey = `${subfolder}:${remoteUrl}`;
    const saved = await AsyncStorage.getItem(storageKey);
    if (saved) {
        const { url, localUri } = JSON.parse(saved);
        if (url === remoteUrl) {
            const info = await FileSystem.getInfoAsync(localUri);
            if (info.exists) return localUri;
        }
    }

    const filename = encodeURIComponent(remoteUrl);
    const localUri = cacheDir + filename;
    try {
        const { uri } = await FileSystem.downloadAsync(remoteUrl, localUri);
        await AsyncStorage.setItem(
            storageKey,
            JSON.stringify({ url: remoteUrl, localUri: uri })
        );
        return uri;
    } catch {
        return remoteUrl;
    }
}

/**
 * Fetches all SoundRecord rows, downloads audio & images to cache,
 * and returns an array of CachedSound plus loading state.
 */
export function useCachedSounds() {
    const [sounds, setSounds] = useState<CachedSound[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                console.log('[useCachedSounds] platform:', Platform.OS);
                const { data, error } = await supabase
                    .from<SoundRecord>('sounds')
                    .select('title, audio_url, background_image_url, is_premium')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (!mounted) return;

                if (Platform.OS === 'web') {
                    // On web, skip file-system caching entirely
                    const webSounds: CachedSound[] = data.map(r => ({
                        title: r.title,
                        localAudio: r.audio_url,
                        localImage: r.background_image_url,
                        isPremium: r.is_premium,
                    }));
                    setSounds(webSounds);
                } else {
                    // Native: cache files locally
                    const nativeSounds = await Promise.all(
                        data.map(async r => ({
                            title: r.title,
                            localAudio: await cacheFile(r.audio_url, 'sounds'),
                            localImage: r.background_image_url
                                ? await cacheFile(r.background_image_url, 'images')
                                : null,
                            isPremium: r.is_premium,
                        }))
                    );
                    if (mounted) setSounds(nativeSounds);
                }
            } catch (err) {
                console.error('[useCachedSounds] error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    return { sounds, loading };
}

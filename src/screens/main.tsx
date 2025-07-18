// src/screens/Main.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    NativeModules,
    Platform,
    UIManager,
    LayoutAnimation,
    ImageSourcePropType,
    Linking,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import Categories from '../components/Categories';
import Scene from '../components/Scene';
import Controls from '../components/Controls';
import SoundSettingsModal from '../components/SoundSettingsModal';
import TimerSettingsModal from '../components/TimerSettingsModal';
import SettingsModal from '../components/SettingsModal';
import { useTheme } from '../theme';
import { useScenePlayer, SceneSound } from '../hooks/useScenePlayer';
import Constants from 'expo-constants';
import { usePersistedScene, PersistedSound } from '../hooks/usePersistedScene';
import { usePersistedFavorites } from '../hooks/usePersistedFavorites';
import { useCachedSounds } from '../hooks/useCachedSounds';

const { AudioFilterModule } = NativeModules;
const categories = ['All sounds', 'Premium', 'Recently added', 'Favorites'];
const MAX_SLOTS = 3;
const SUGGEST_URL = 'https://your-site.com/suggest-sound';

function softenToCutoff(soften: number) {
    const max = 20000;  // Hz
    const min = 200;    // Hz
    // invert so higher ‘soften’ = lower cutoff
    return min + (1 - soften) * (max - min);
}

export default function Main() {
    const theme = useTheme();
    const isExpoGo = Constants.appOwnership === 'expo' && Platform.OS !== 'web';
    const soundRefs = useRef<Audio.Sound[]>([]);
    const currentIndexRef = useRef(-1);

    // Enable LayoutAnimation on Android
    useEffect(() => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental?.(true);
        }
    }, []);

    // Fetch & cache
    const { sounds, loading } = useCachedSounds();

    // Preview state (Expo-AV)
    const previewRef = useRef<Audio.Sound | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    // Global play
    const [isPlaying, setIsPlaying] = useState(false);

    // Persisted slots & favorites
    const [persistedSounds, setPersistedSounds] = usePersistedScene();
    const [favorites, setFavorites] = usePersistedFavorites();
    const [masterVolume, setMasterVolume] = useState<number>(1); // Global volume

    const scene: SceneSound[] = persistedSounds.map(s => ({
        title: s.title,
        audioUrl: s.audioUrl,
        volume: s.settings.volume,
        warmth: s.settings.warmth,
        backgroundImage: s.backgroundImage
            ? { uri: s.backgroundImage }
            : null,
    }));
    useScenePlayer(scene, isPlaying, masterVolume);

    // Timer settings
    const [timerMinutes, setTimerMinutes] = useState<number>(180);
    const [elapsedSec, setElapsedSec] = useState<number>(0);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const tickRef = useRef<NodeJS.Timeout | null>(null);

    // Reset the slot pointer when the scene is cleared
    useEffect(() => {
        currentIndexRef.current = persistedSounds.length - 1;
    }, [persistedSounds]);

    // Timer countdown & elapsed display
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (tickRef.current) clearInterval(tickRef.current);
        setElapsedSec(0);
        setEndTime(null);

        if (isPlaying) {
            const now = new Date();
            const end = new Date(now.getTime() + timerMinutes * 60 * 1000);
            setEndTime(end);

            timerRef.current = setTimeout(() => setIsPlaying(false), timerMinutes * 60 * 1000);
            tickRef.current = setInterval(() => setElapsedSec(sec => sec + 1), 1000);
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [isPlaying, timerMinutes]);
    // Modal states
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [soundSettingsVisible, setSoundSettingsVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [timerVisible, setTimerVisible] = useState(false);

    // Toggle favorite by title
    const handleFavoriteByTitle = (title: string) => {
        setFavorites(prev =>
            prev.includes(title)
                ? prev.filter(f => f !== title)
                : [...prev, title]
        );
    };
    // Add to scene slots by title, always writing into currentIndexRef, then advance it
    const handleAddByTitle = (title: string) => {
        const sound = filtered.find(s => s.title === title);
        if (!sound) return;

        const newEntry: PersistedSound = {
            title: sound.title,
            audioUrl: sound.localAudio,
            backgroundImage: sound.localImage ?? undefined,
            settings: { volume: 1, warmth: 0 },
        };

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setPersistedSounds(prev => {
            const copy = [...prev];
            const idx = currentIndexRef.current;

            if (copy.length < MAX_SLOTS) {
                copy.push(newEntry);
            }

            return copy;
        });

        setIsPlaying(true);
    };

    const handleReplaceCurrent = (title: string) => {
        if (persistedSounds.length === 0) {
            handleAddByTitle(title);
            return;
        }
        const sound = filtered.find(s => s.title === title);
        if (!sound) return;

        const newEntry: PersistedSound = {
            title: sound.title,
            audioUrl: sound.localAudio,
            backgroundImage: sound.localImage ?? undefined,
            settings: { volume: 1, warmth: 0 },
        };

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setPersistedSounds(prev => {
            const copy = [...prev];
            const idx = currentIndexRef.current;
            // Only replace if that slot exists
            if (idx < copy.length) {
                copy[idx] = newEntry;
            }
            return copy;
        });

        setIsPlaying(true);
    };

    // Remove slot
    const handleRemoveSlot = (idx: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const next = persistedSounds.filter((_, i) => i !== idx);
        setPersistedSounds(next);
        setSelectedIndex(null);
        if (next.length === 0 && isPlaying) {
            // we’ve just removed the last slot, so pause
            setIsPlaying(false);
        }
    };

    const handleSuggestSound = async () => {
        const supported = await Linking.canOpenURL(SUGGEST_URL);
        if (supported) {
            Linking.openURL(SUGGEST_URL);
        } else {
            console.warn(`Don't know how to open URI: ${SUGGEST_URL}`);
        }
    };

    // Filter + search + categories
    const [category, setCategory] = useState(categories[0]);
    const [searchText, setSearchText] = useState('');
    const filtered = sounds
        .filter(s => s.title.toLowerCase().includes(searchText.toLowerCase()))
        .filter((s, i) => {
            if (category === 'Premium') return s.isPremium;
            if (category === 'Recently added') return i < 10;
            if (category === 'Favorites') return favorites.includes(s.title);
            return true;
        });

    const previewTitle =
        previewIndex !== null && previewIndex < filtered.length
            ? filtered[previewIndex].title
            : null;

    const sections = Object.entries(
        filtered.reduce<Record<string, typeof filtered>>((acc, sound) => {
            const cat = sound.category ?? 'Others';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(sound);
            return acc;
        }, {})
    ).map(([title, data]) => ({ title, data }));

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Header
                categories={categories}
                selectedCategory={category}
                onCategoryChange={setCategory}
                onSettingsPress={() => setSettingsVisible(true)}
            />

            <View style={styles.wrapper}>
                <Categories
                    searchValue={searchText}
                    onSearchChange={setSearchText}
                    placeholder="Search sounds…"

                    sections={sections}
                    favorites={favorites}
                    scene={scene}
                    previewTitle={previewTitle}
                    onFavoriteToggle={handleFavoriteByTitle}
                    onAdd={handleAddByTitle}
                    onPreview={handleReplaceCurrent}
                />

                {scene.length > 0 && (
                    <LinearGradient
                        colors={['transparent', theme.background]}
                        start={[0, 0]}
                        end={[0, 1]}
                        style={styles.bottomFade}
                        pointerEvents="none"
                    />
                )}

                <Scene
                    sounds={scene}
                    onPress={i => {
                        setSelectedIndex(i);
                        setSoundSettingsVisible(true);
                    }}
                    onRemove={handleRemoveSlot}
                />
            </View>

            {scene.length > 0 && (
                <Controls
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(p => !p)}
                    volume={masterVolume}
                    onVolumeChange={setMasterVolume}
                    onTimerPress={() => setTimerVisible(true)}
                />
            )}

            <SoundSettingsModal
                visible={soundSettingsVisible}
                title={scene[selectedIndex!]?.title ?? ''}
                volume={scene[selectedIndex!]?.volume ?? 1}
                warmth={scene[selectedIndex!]?.warmth ?? 0}
                onVolumeChange={v => {
                    const idx = selectedIndex!;
                    setPersistedSounds(prev => {
                        const copy = [...prev];
                        copy[idx].settings.volume = v;
                        return copy;
                    });

                    if (Platform.OS !== 'web') {
                        if (!isExpoGo) {
                            const TrackPlayer = require('react-native-track-player').default;
                            TrackPlayer.setVolume(masterVolume * v).catch(console.warn);
                        } else {
                            // — expo-av fallback —
                            soundRefs.current.forEach(async (sound) => {
                                try {
                                    await sound.setVolumeAsync(masterVolume * v);
                                } catch (e) {
                                    console.warn('expo-av setVolumeAsync failed', e);
                                }
                            });
                        }
                    }
                }}
                onWarmthChange={v => {
                    const idx = selectedIndex!;
                    // update persisted settings
                    setPersistedSounds(prev => {
                        const copy = [...prev];
                        copy[idx].settings.warmth = v;
                        return copy;
                    });
                    // if we’re running natively, tell the module
                    if (Platform.OS === 'ios' || Platform.OS === 'android') {
                        const cutoffFreq = softenToCutoff(v);
                        AudioFilterModule.setCutoff(cutoffFreq);
                    }
                }}
                onClose={() => setSoundSettingsVisible(false)}
            />

            <TimerSettingsModal
                visible={timerVisible}
                initialMinutes={timerMinutes}
                onTimeChange={mins => setTimerMinutes(mins)}
                onClose={() => setTimerVisible(false)}
            />

            <SettingsModal
                visible={settingsVisible}
                onClose={() => setSettingsVisible(false)}
                onSuggestSound={() => { handleSuggestSound }}
                onRestorePurchases={() => {/* your handler */ }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    wrapper: { flex: 1, position: 'relative' },
    listContent: {
        padding: 8,
        paddingTop: 16,
        paddingBottom: 120,
    },
    bottomFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96,
        height: 50,
        zIndex: 1,
    },
});

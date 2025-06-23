// src/screens/Main.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Platform,
    UIManager,
    LayoutAnimation,
    ImageSourcePropType,
    Text,
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import Search from '../components/Search';
import Card from '../components/Card';
import CurrentSounds from '../components/CurrentSounds';
import Controls from '../components/Controls';
import SoundSettingsModal from '../components/SoundSettingsModal';
import TimerSettingsModal from '../components/TimerSettingsModal';
import { useTheme } from '../theme';
import { useAudioPlayer, CurrentSound as AudioSound } from '../hooks/useAudioPlayer';
import { usePersistedCurrentSounds, PersistedSound } from '../hooks/usePersistedCurrentSounds';
import { usePersistedFavorites } from '../hooks/usePersistedFavorites';
import { useCachedSounds } from '../hooks/useCachedSounds';

const categories = ['All sounds', 'Premium', 'Recently added'];
const MAX_SLOTS = 3;

type CurrentSoundUI = Omit<PersistedSound, 'backgroundImage'> & {
    backgroundImage: ImageSourcePropType | null;
};

export default function Main() {
    const theme = useTheme();

    // Enable LayoutAnimation on Android
    useEffect(() => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental?.(true);
        }
    }, []);

    // Fetch & cache
    const { sounds, loading } = useCachedSounds();

    // Preview state
    const previewRef = useRef<Audio.Sound | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    // Global play
    const [isPlaying, setIsPlaying] = useState(false);
    useEffect(() => {
        if (isPlaying && previewRef.current) {
            previewRef.current.stopAsync();
            previewRef.current.unloadAsync();
            previewRef.current = null;
            setPreviewIndex(null);
        }
    }, [isPlaying]);

    // Persisted slots & favorites
    const [persistedSounds, setPersistedSounds] = usePersistedCurrentSounds();
    const [favorites, setFavorites] = usePersistedFavorites();
    const currentSounds: CurrentSoundUI[] = persistedSounds.map(s => ({
        title: s.title,
        audioUrl: s.audioUrl,
        settings: s.settings,
        backgroundImage: s.backgroundImage ? { uri: s.backgroundImage } : null,
    }));

    // Global volume
    const [masterVolume, setMasterVolume] = useState<number>(1);

    // Timer settings
    const [timerMinutes, setTimerMinutes] = useState<number>(60);
    const [elapsedSec, setElapsedSec] = useState<number>(0);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const tickRef = useRef<NodeJS.Timeout | null>(null);

    // Drive global audio loops
    useAudioPlayer(
        currentSounds.map(s => ({ audioUrl: s.audioUrl, settings: s.settings })) as AudioSound[],
        isPlaying,
        masterVolume
    );

    // Timer countdown & elapsed display
    useEffect(() => {
        // clear any existing
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
        }
        setElapsedSec(0);
        setEndTime(null);

        if (isPlaying) {
            const now = new Date();
            const end = new Date(now.getTime() + timerMinutes * 60 * 1000);
            setEndTime(end);

            // schedule stop
            timerRef.current = setTimeout(() => {
                setIsPlaying(false);
            }, timerMinutes * 60 * 1000);
            // tick every second
            tickRef.current = setInterval(() => {
                setElapsedSec(sec => sec + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (tickRef.current) clearInterval(tickRef.current);
        };
    }, [isPlaying, timerMinutes]);

    // Modal states
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [timerVisible, setTimerVisible] = useState(false);

    // Cleanup preview
    useEffect(() => {
        return () => {
            previewRef.current?.stopAsync();
            previewRef.current?.unloadAsync();
        };
    }, []);

    // Card preview play/pause
    const handleCardPlay = async (idx: number, audioUrl: string) => {
        if (isPlaying) setIsPlaying(false);
        if (previewIndex === idx) {
            await previewRef.current?.stopAsync();
            await previewRef.current?.unloadAsync();
            previewRef.current = null;
            setPreviewIndex(null);
            return;
        }
        if (previewRef.current) {
            await previewRef.current.stopAsync();
            await previewRef.current.unloadAsync();
        }
        const sound = new Audio.Sound();
        try {
            await sound.loadAsync({ uri: audioUrl });
            await sound.playAsync();
            previewRef.current = sound;
            setPreviewIndex(idx);
        } catch (err) {
            console.error(err);
        }
    };

    // Favorites toggle
    const handleFavoriteToggle = (idx: number) => {
        const title = filtered[idx].title;
        setFavorites(prev =>
            prev.includes(title) ? prev.filter(f => f !== title) : [...prev, title]
        );
    };

    // Add to slots
    const handleSelect = (idx: number) => {
        const sound = filtered[idx];
        if (persistedSounds.length >= MAX_SLOTS) return;
        if (persistedSounds.some(s => s.title === sound.title)) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPersistedSounds(prev => [
            ...prev,
            {
                title: sound.title,
                audioUrl: sound.localAudio,
                backgroundImage: sound.localImage ?? undefined,
                settings: { volume: 1, soften: 0, oscillate: false },
            },
        ]);
    };

    // Remove slot
    const handleRemoveSlot = (idx: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPersistedSounds(prev => prev.filter((_, i) => i !== idx));
        setSelectedIndex(null);
    };

    // Filter + search
    const [category, setCategory] = useState(categories[0]);
    const [searchText, setSearchText] = useState('');
    const filtered = sounds
        .filter(s => s.title.toLowerCase().includes(searchText.toLowerCase()))
        .filter((_, i) => {
            if (category === 'Premium') return sounds[i].isPremium;
            if (category === 'Recently added') return i < 10;
            return true;
        });

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
                onSettingsPress={() => { }}
            />

            <View style={styles.wrapper}>
                <FlatList
                    data={filtered}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item, index }) => (
                        <Card
                            title={item.title}
                            backgroundImage={item.localImage ? { uri: item.localImage } : null}
                            isFavorite={favorites.includes(item.title)}
                            selected={currentSounds.some(cs => cs.title === item.title)}
                            isPlaying={previewIndex === index}
                            onFavoriteToggle={() => handleFavoriteToggle(index)}
                            onPlayToggle={() => handleCardPlay(index, item.localAudio)}
                            onPress={() => handleSelect(index)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={
                        <Search
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search sounds…"
                        />
                    }
                />

                {currentSounds.length > 0 && (
                    <LinearGradient
                        colors={["transparent", theme.background]}
                        start={[0, 0]}
                        end={[0, 1]}
                        style={styles.bottomFade}
                        pointerEvents="none"
                    />
                )}

                <CurrentSounds
                    sounds={currentSounds}
                    onPress={i => {
                        setSelectedIndex(i);
                        setSettingsVisible(true);
                    }}
                    onRemove={handleRemoveSlot}
                />
            </View>

            {currentSounds.length > 0 && (
                <>
                    <Controls
                        isPlaying={isPlaying}
                        onPlayPause={() => setIsPlaying(p => !p)}
                        volume={masterVolume}
                        onVolumeChange={setMasterVolume}
                        onTimerPress={() => setTimerVisible(true)}
                    />
                </>
            )}

            <SoundSettingsModal
                visible={settingsVisible}
                title={currentSounds[selectedIndex!]?.title ?? ''}
                volume={currentSounds[selectedIndex!]?.settings.volume ?? 1}
                soften={currentSounds[selectedIndex!]?.settings.soften ?? 0}
                oscillate={currentSounds[selectedIndex!]?.settings.oscillate ?? false}
                onVolumeChange={v => {
                    const idx = selectedIndex!;
                    setPersistedSounds(prev => {
                        const copy = [...prev];
                        copy[idx].settings.volume = v;
                        return copy;
                    });
                }}
                onSoftenChange={v => {
                    const idx = selectedIndex!;
                    setPersistedSounds(prev => {
                        const copy = [...prev];
                        copy[idx].settings.soften = v;
                        return copy;
                    });
                }}
                onOscillateChange={(on: boolean) => {
                    const idx = selectedIndex!;
                    setPersistedSounds(prev => {
                        const copy = [...prev];
                        copy[idx].settings.oscillate = on;
                        return copy;
                    });
                }}
                onClose={() => setSettingsVisible(false)}
            />

            <TimerSettingsModal
                visible={timerVisible}
                initialMinutes={timerMinutes}
                onTimeChange={mins => setTimerMinutes(mins)}
                onClose={() => setTimerVisible(false)}
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
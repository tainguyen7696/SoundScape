// src/screens/Main.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Platform,
    UIManager,
    LayoutAnimation,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../components/Header';
import Search from '../components/Search';
import Card from '../components/Card';
import CurrentSounds from '../components/CurrentSounds';
import Controls from '../components/Controls';
import SoundSettingsModal from '../components/SoundSettingsModal';
import { useTheme } from '../theme';
import { useAudioPlayer, CurrentSound as AudioSound } from '../hooks/useAudioPlayer';
import { usePersistedCurrentSounds, PersistedSound } from '../hooks/usePersistedCurrentSounds';
import { usePersistedFavorites } from '../hooks/usePersistedFavorites';
import { useCachedSounds, CachedSound } from '../hooks/useCachedSounds';

interface CurrentSound extends PersistedSound {
    backgroundImage: ImageSourcePropType | null;
}

const categories = ['All sounds', 'Premium', 'Recently added'];
const MAX_SLOTS = 3;

export default function Main() {
    const theme = useTheme();

    useEffect(() => {
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental?.(true);
        }
    }, []);

    const { sounds, loading } = useCachedSounds();
    const [category, setCategory] = useState(categories[0]);
    const [searchText, setSearchText] = useState('');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // global/master volume
    const [masterVolume, setMasterVolume] = useState(1);

    const [persistedSounds, setPersistedSounds] = usePersistedCurrentSounds();
    const [favorites, setFavorites] = usePersistedFavorites();

    const currentSounds: CurrentSound[] = persistedSounds.map(s => ({
        ...s,
        backgroundImage: s.backgroundImage ? { uri: s.backgroundImage } : null,
    }));

    // audio hook with masterVolume
    useAudioPlayer(
        currentSounds.map(s => ({ audioUrl: s.audioUrl, settings: s.settings })) as AudioSound[],
        isPlaying,
        masterVolume
    );

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    const filtered = sounds
        .filter(s => s.title.toLowerCase().includes(searchText.toLowerCase()))
        .filter((_, idx) => {
            if (category === 'Premium') return sounds[idx].isPremium;
            if (category === 'Recently added') return idx < 10;
            return true;
        });

    const handleFavoriteToggle = (idx: number) => {
        const title = filtered[idx].title;
        setFavorites(prev =>
            prev.includes(title) ? prev.filter(f => f !== title) : [...prev, title]
        );
    };

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
                backgroundImage: sound.localImage,
                settings: { volume: 1, soften: 0, oscillate: false },
            },
        ]);
    };

    const handleRemoveCurrent = (idx: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPersistedSounds(prev => {
            const next = prev.filter((_, i) => i !== idx);
            return next;
        });
        if (selectedIndex === idx) setSelectedIndex(null);
        else if (selectedIndex !== null && selectedIndex > idx)
            setSelectedIndex(selectedIndex - 1);
    };

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
                        <View style={styles.cardWrapper}>
                            <Card
                                title={item.title}
                                backgroundImage={item.localImage ? { uri: item.localImage } : null}
                                isFavorite={favorites.includes(item.title)}
                                selected={currentSounds.some(cs => cs.title === item.title)}
                                onFavoriteToggle={() => handleFavoriteToggle(index)}
                                onPlay={() => handleSelect(index)}
                            />
                        </View>
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

                {/* bottom fade over list */}
                {currentSounds.length > 0 && (
                <LinearGradient
                    colors={['transparent', theme.background]}
                    start={[0, 0]}
                    end={[0, 1]}
                    style={styles.bottomFade}
                    pointerEvents="none"
                    />)}

                <CurrentSounds
                    sounds={currentSounds}
                    onPress={i => { setSelectedIndex(i); setSettingsVisible(true); }}
                    onRemove={handleRemoveCurrent}
                />
            </View>

            {currentSounds.length > 0 && (
                <View style={styles.controlsContainer}>
                    <Controls
                        isPlaying={isPlaying}
                        onPlayPause={() => setIsPlaying(p => !p)}
                        volume={masterVolume}
                        onVolumeChange={setMasterVolume}
                    />
                </View>
            )}

            {selectedIndex !== null && (
                <SoundSettingsModal
                    visible={settingsVisible}
                    title={currentSounds[selectedIndex].title}
                    volume={currentSounds[selectedIndex].settings.volume}
                    soften={currentSounds[selectedIndex].settings.soften}
                    oscillate={currentSounds[selectedIndex].settings.oscillate}
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
                    onOscillateChange={v => {
                        const idx = selectedIndex!;
                        setPersistedSounds(prev => {
                            const copy = [...prev];
                            copy[idx].settings.oscillate = v;
                            return copy;
                        });
                    }}
                    onClose={() => { setSettingsVisible(false); setSelectedIndex(null); }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    wrapper: { flex: 1, position: 'relative' },
    listContent: {
        padding: 8,
        paddingTop: 16,
        paddingBottom: 200,
    },
    cardWrapper: { marginVertical: 4 },
    controlsContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    bottomFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96+96,  // height of CurrentSounds
        height: 50,
        zIndex: 1,
    },
});

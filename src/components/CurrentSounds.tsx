// src/components/CurrentSounds.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CurrentSoundItem from './CurrentSoundItem';
import { useTheme } from '../theme';
import type { CardProps } from './Card';

export interface CurrentSoundsProps {
    sounds: Omit<CardProps, 'onFavoriteToggle' | 'onPlay'>[];
    onPress: (index: number) => void;
    onRemove: (index: number) => void;
}

const MAX_ITEMS = 3;

const CurrentSounds: React.FC<CurrentSoundsProps> = ({ sounds, onPress, onRemove }) => {
    const theme = useTheme();
    const { width: windowWidth } = useWindowDimensions();

    const displaySounds = sounds.slice(0, MAX_ITEMS);
    const count = displaySounds.length;
    if (count === 0) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.controlBackground }]}>
            <View style={styles.row}>
                {displaySounds.map((s, i) => (
                    <View key={i} style={[styles.itemWrapper, { width: windowWidth / count }]}>
                        <CurrentSoundItem
                            title={s.title}
                            backgroundImage={s.backgroundImage}
                            onPress={() => onPress(i)}
                            onRemove={() => onRemove(i)}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

export default CurrentSounds;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 96,
        height: 96,
        overflow: 'hidden',
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    itemWrapper: {
        height: '100%',
        paddingHorizontal: 4,
        paddingTop: 8,
    },
});

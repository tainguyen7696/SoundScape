// src/components/CurrentSoundItem.tsx
import React from 'react';
import {
    TouchableOpacity,
    ImageBackground,
    Text,
    StyleSheet,
    ImageBackgroundProps,
    ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface CurrentSoundItemProps {
    title: string;
    backgroundImage?: number | string | null;
    /** the same color used by your Card when no image was provided */
    backgroundColor?: string;
    onRemove: () => void;
    onPress?: () => void;
}

const CurrentSoundItem: React.FC<CurrentSoundItemProps> = ({
    title,
    backgroundImage = null,
    backgroundColor,
    onRemove,
    onPress,
}) => {
    const theme = useTheme();

    // Decide final background style
    const bgStyle: ViewStyle = backgroundImage
        ? {}
        : { backgroundColor: backgroundColor ?? theme.primary };

    // Only pass `source` when there's an actual image
    const imageProps: Partial<ImageBackgroundProps> = backgroundImage
        ? { source: backgroundImage as any }
        : {};

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.wrapper, bgStyle]}
        >
            <ImageBackground
                {...imageProps}
                style={styles.wrapper}
                imageStyle={styles.image}
            >
                {/* “X” remove button */}
                <TouchableOpacity
                    onPress={onRemove}
                    style={styles.removeIcon}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <FontAwesome name="times" size={14} color={theme.text} />
                </TouchableOpacity>

                {/* Title at bottom-left */}
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {title}
                </Text>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default CurrentSoundItem;

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        height: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    image: {
        resizeMode: 'cover',
    },
    removeIcon: {
        position: 'absolute',
        top: 6,
        right: 10,
        zIndex: 2,
    },
    title: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        fontSize: 12,
        fontWeight: '500',
        zIndex: 2,
    },
});

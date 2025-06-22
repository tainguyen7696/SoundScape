// src/components/Card.tsx
import React, { useMemo } from 'react';
import {
    TouchableOpacity,
    ImageBackground,
    View,
    Text,
    StyleSheet,
    ImageBackgroundProps,
    ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

export interface CardProps {
    title: string;
    backgroundImage?: number | string | null;
    isFavorite?: boolean;
    selected?: boolean;          // ← new!
    onFavoriteToggle?: () => void;
    onPlay?: () => void;
}

const generateRandomColor = (): string => {
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += '0123456789ABCDEF'.charAt(
            Math.floor(Math.random() * 16)
        );
    }
    return color;
};

const Card: React.FC<CardProps> = ({
    title,
    backgroundImage = null,
    isFavorite = false,
    selected = false,
    onFavoriteToggle,
    onPlay,
}) => {
    const theme = useTheme();
    const randomBg = useMemo(() => generateRandomColor(), []);

    // always have your random or image bg
    const containerStyle: ViewStyle[] = [
        styles.card,
        { backgroundColor: randomBg },
    ];

    // add a primary‐colored border when selected
    if (selected) {
        containerStyle.push({
            borderWidth: 2,
            borderColor: theme.primary,
        });
    }

    const imageProps: Partial<ImageBackgroundProps> = backgroundImage
        ? { source: backgroundImage as any }
        : {};

    return (
        <TouchableOpacity
            style={styles.wrapper}
            activeOpacity={0.9}
            onPress={onPlay}
        >
            <ImageBackground
                {...imageProps}
                style={containerStyle}
                imageStyle={styles.image}
            >
                <LinearGradient
                    colors={[`${theme.background}CC`, 'transparent']}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={styles.fadeLeft}
                    pointerEvents="none"
                />
                <LinearGradient
                    colors={['transparent', `${theme.background}CC`]}
                    start={[0, 0]}
                    end={[1, 0]}
                    style={styles.fadeRight}
                    pointerEvents="none"
                />

                <View style={styles.overlay}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                    <View style={styles.icons}>
                        <TouchableOpacity onPress={onPlay}>
                            <FontAwesome name="volume-up" size={18} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onFavoriteToggle}>
                            <FontAwesome
                                name={isFavorite ? 'heart' : 'heart-o'}
                                size={18}
                                color={isFavorite ? '#FF0000' : theme.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default Card;

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        height: 60,
        marginVertical: 4,
    },
    card: {
        flex: 1,
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        position: 'relative',
    },
    image: {
        resizeMode: 'cover',
    },
    overlay: {
        position: 'absolute',
        left: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    icons: {
        flexDirection: 'row',
        width: 48,
        justifyContent: 'space-between',
    },
    fadeLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '40%',
        zIndex: 1,
    },
    fadeRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '40%',
        zIndex: 1,
    },
});

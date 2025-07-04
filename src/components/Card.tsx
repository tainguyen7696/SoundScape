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
    ImageSourcePropType,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

export interface CardProps {
    title: string;
    backgroundImage?: ImageSourcePropType | null;
    isFavorite?: boolean;
    isPlaying?: boolean;
    selected?: boolean;
    onFavoriteToggle?: () => void;
    onAdd?: () => void;
    onPreview?: () => void;
}

const generateRandomColor = (): string => {
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16));
    }
    return color;
};

const Card: React.FC<CardProps> = ({
    title,
    backgroundImage = null,
    isFavorite = false,
    isPlaying = false,
    onFavoriteToggle,
    onAdd,
    onPreview,
}) => {
    const theme = useTheme();
    const randomBg = useMemo(() => generateRandomColor(), []);

    const containerStyle: ViewStyle[] = [styles.card, { backgroundColor: randomBg }];
    if (isPlaying) {
        containerStyle.push({ borderWidth: 2, borderColor: theme.primary });
    }

    const imageProps: Partial<ImageBackgroundProps> =
        backgroundImage ? { source: backgroundImage as any } : {};

    return (
        <TouchableOpacity
            style={styles.wrapper}
            activeOpacity={0.9}
            onPress={onPreview}
        >
            <ImageBackground {...imageProps} style={containerStyle} imageStyle={styles.image}>
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
                        <TouchableOpacity
                            onPress={onFavoriteToggle}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <FontAwesome
                                name={isFavorite ? 'heart' : 'heart-o'}
                                size={20}
                                color={isFavorite ? '#FF0000' : theme.text}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onAdd}
                            style={styles.iconButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <FontAwesome
                                name="plus"
                                size={20}
                                color={theme.text}
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
        alignItems: 'center',
    },
    iconButton: {
        padding: 16,
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
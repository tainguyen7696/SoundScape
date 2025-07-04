// src/components/SceneItem.tsx
import React from 'react';
import {
    TouchableOpacity,
    ImageBackground,
    Text,
    StyleSheet,
    ImageBackgroundProps,
    ImageSourcePropType,
    ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

export interface SceneItemProps {
    title: string;
    backgroundImage?: ImageSourcePropType | null;
    backgroundColor?: string;
    onRemove: () => void;
    onPress?: () => void;
}

const SceneItem: React.FC<SceneItemProps> = ({
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

export default SceneItem;

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

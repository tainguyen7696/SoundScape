// src/components/Controls.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface ControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    volume: number;
    onVolumeChange: (v: number) => void;
}

const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    onPlayPause,
    volume,
    onVolumeChange,
    // currentTime and duration props remain but are not displayed
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.controlBackground }]}>
            <TouchableOpacity
                style={[styles.playButton, ]}
                onPress={onPlayPause}
            >
                <FontAwesome name={isPlaying ? 'pause' : 'play'} size={24} color={theme.text} />
            </TouchableOpacity>

            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                minimumTrackTintColor={theme.sliderThumb}
                maximumTrackTintColor={theme.sliderTrack}
                thumbTintColor={theme.sliderThumb}
                onValueChange={onVolumeChange}
            />

            {/* Timer icon replaces time text */}
            <FontAwesome name="clock-o" size={20} color={theme.text} />
        </View>
    );
};

export default Controls;

const styles = StyleSheet.create({
    container: {
        width: '100%', 
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        borderBottomWidth: 0,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    slider: {
        flex: 1,
        height: 40,
        marginRight: 12,
    },
});

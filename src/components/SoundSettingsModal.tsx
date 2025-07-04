// src/components/SoundSettingsModal.tsx
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../theme';
import PullUp from './Pullup';

interface SoundProps {
    visible: boolean;
    title: string;
    volume: number;
    warmth: number;
    onVolumeChange: (v: number) => void;
    onWarmthChange: (v: number) => void;
    onClose: () => void;
}

const SoundSettingsModal: React.FC<SoundProps> = ({
    visible,
    title,
    volume,
    warmth,
    onVolumeChange,
    onWarmthChange,
    onClose,
}) => {
    const theme = useTheme();
    return (
        <PullUp visible={visible} onClose={onClose} sheetHeightPercent={0.4}>
            <Text style={[styles.header, { color: theme.text }]}>{title}</Text>
            <View style={styles.row}>
                <Text style={[styles.label, { color: theme.text }]}>Volume</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={onVolumeChange}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.sliderTrack}
                    thumbTintColor={theme.sliderThumb}
                />
            </View>
            <View style={styles.row}>
                <Text style={[styles.label, { color: theme.text }]}>Warmth</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={warmth}
                    onValueChange={onWarmthChange}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.sliderTrack}
                    thumbTintColor={theme.sliderThumb}
                />
            </View>
        </PullUp>
    );
};

export default SoundSettingsModal;

const styles = StyleSheet.create({
    header: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    slider: {
        flex: 2,
        height: 40,
    },
});
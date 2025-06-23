// src/components/TimerSettingsModal.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../theme';
import PullUp from './Pullup';

interface TimerProps {
    visible: boolean;
    initialMinutes?: number;
    onTimeChange: (mins: number) => void;
    onClose: () => void;
}

const TimerSettingsModal: React.FC<TimerProps> = ({
    visible,
    initialMinutes = 10,
    onTimeChange,
    onClose,
}) => {
    const theme = useTheme();
    const [minutes, setMinutes] = useState(initialMinutes);

    // calculate and memoize the end time when minutes changes
    const endTime = useMemo(
        () => new Date(Date.now() + minutes * 60 * 1000),
        [minutes]
    );

    // always show hours & minutes with leading zeros on minutes
    const label = useMemo(() => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const hrLabel = `${hrs} hour${hrs !== 1 ? 's' : ''}`;
        const minLabel = `${mins.toString().padStart(2, '0')} minute${mins !== 1 ? 's' : ''}`;
        return `${hrLabel} ${minLabel}`;
    }, [minutes]);

    return (
        <PullUp
            visible={visible}
            onClose={() => {
                onClose();
                onTimeChange(minutes);
            }}
            sheetHeightPercent={0.3}
        >
            <Text style={[styles.header, { color: theme.text }]}>Timer</Text>

            {/* Always two-part label */}
            <Text style={[styles.subHeader, { color: theme.text }]}>
                {label}
            </Text>

            <View style={[styles.endContainer, { backgroundColor: theme.controlBackground }]}>
                <Text style={[styles.endText, { color: theme.text }]}>
                    Ends at: {endTime.toLocaleTimeString()}
                </Text>
            </View>

            <Slider
                style={styles.slider}
                minimumValue={15}          // 15 minutes
                maximumValue={8 * 60}      // 8 hours → 480 minutes
                step={15}                  // 15-minute increments
                value={minutes}
                onValueChange={setMinutes}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.sliderTrack}
                thumbTintColor={theme.sliderThumb}
            />
        </PullUp>
    );
};

export default TimerSettingsModal;

const styles = StyleSheet.create({
    header: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    endContainer: {
        width: '100%',
        padding: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    endText: {
        fontSize: 14,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});

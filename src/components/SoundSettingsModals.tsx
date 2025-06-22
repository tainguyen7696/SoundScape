// src/components/SoundSettingsModal.tsx
import React, { useEffect, useRef } from 'react';
import {
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Text,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../theme';

interface Props {
    visible: boolean;
    title: string;
    volume: number;
    soften: number;
    oscillate: number;
    onVolumeChange: (v: number) => void;
    onSoftenChange: (v: number) => void;
    onOscillateChange: (v: number) => void;
    onClose: () => void;
}

const SoundSettingsModal: React.FC<Props> = ({
    visible,
    title,
    volume,
    soften,
    oscillate,
    onVolumeChange,
    onSoftenChange,
    onOscillateChange,
    onClose,
}) => {
    const theme = useTheme();
    const slideAnim = useRef(new Animated.Value(0)).current;
    const { height } = Dimensions.get('window');

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height, height * 0.6], // 40% from top
    });

    const rows: { label: string; value: number; onChange: (v: number) => void }[] =
        [
            { label: 'Volume', value: volume, onChange: onVolumeChange },
            { label: 'Soften', value: soften, onChange: onSoftenChange },
            { label: 'Oscillate', value: oscillate, onChange: onOscillateChange },
        ];

    return (
        <Modal transparent visible={visible} animationType="none">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.controlBackground,
                        transform: [{ translateY }],
                    },
                ]}
            >
                <Text style={[styles.header, { color: theme.text }]}>
                    {title}
                </Text>
                {rows.map(({ label, value, onChange }) => (
                    <View style={styles.row} key={label}>
                        <Text style={[styles.label, { color: theme.text }]}>
                            {label}
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            value={value}
                            onValueChange={onChange}
                            minimumTrackTintColor={theme.primary}
                            maximumTrackTintColor={theme.sliderTrack}
                            thumbTintColor={theme.sliderThumb}
                        />
                    </View>
                ))}
            </Animated.View>
        </Modal>
    );
};

export default SoundSettingsModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '40%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
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

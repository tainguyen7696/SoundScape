// src/components/SoundSettingsModal.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    Animated,
    Dimensions,
    PanResponder,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
    Text,
    Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '../theme';

interface Props {
    visible: boolean;
    title: string;
    volume: number;
    soften: number;
    oscillate: boolean;
    onVolumeChange: (v: number) => void;
    onSoftenChange: (v: number) => void;
    onOscillateChange: (on: boolean) => void;
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
    const { height } = Dimensions.get('window');
    const openY = height * 0.6;
    const closedY = height;

    const panY = useRef(new Animated.Value(closedY)).current;
    const [show, setShow] = useState(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gs) => {
                const newY = openY + gs.dy;
                if (newY >= openY) panY.setValue(newY);
            },
            onPanResponderRelease: (_, gs) => {
                if (gs.dy > 100) {
                    hide();
                } else {
                    Animated.spring(panY, {
                        toValue: openY,
                        friction: 5,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            setShow(true);
            panY.setValue(closedY);
            Animated.timing(panY, {
                toValue: openY,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const hide = () => {
        Animated.timing(panY, {
            toValue: closedY,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setShow(false);
            onClose();
        });
    };

    if (!show) return null;

    return (
        <Modal transparent visible animationType="none">
            <TouchableWithoutFeedback onPress={hide}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <Animated.View
                {...panResponder.panHandlers}
                style={[
                    styles.sheet,
                    {
                        backgroundColor: theme.controlBackground,
                        transform: [{ translateY: panY }],
                    },
                ]}
            >
                <View style={[styles.handle, { backgroundColor: theme.sliderTrack }]} />

                <Text style={[styles.header, { color: theme.text }]}>
                    {title}
                </Text>

                {/* Volume Slider */}
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

                {/* Soften Slider */}
                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.text }]}>Soften</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={1}
                        value={soften}
                        onValueChange={onSoftenChange}
                        minimumTrackTintColor={theme.primary}
                        maximumTrackTintColor={theme.sliderTrack}
                        thumbTintColor={theme.sliderThumb}
                    />
                </View>

                {/* Oscillate Toggle */}
                <View style={styles.row}>
                    <Text style={[styles.label, { color: theme.text }]}>Oscillate</Text>
                    <Switch
                        value={oscillate}
                        onValueChange={onOscillateChange}
                        trackColor={{ true: theme.primary, false: theme.sliderTrack }}
                        thumbColor={oscillate ? theme.sliderThumb : theme.sliderThumb}
                    />
                </View>
            </Animated.View>
        </Modal>
    );
};

export default SoundSettingsModal;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: '40%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 8,
        paddingHorizontal: 16,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
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
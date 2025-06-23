// src/components/Pullup.tsx
import React, { useEffect, useRef, useState, ReactNode } from 'react';
import {
    Modal,
    Animated,
    Dimensions,
    PanResponder,
    TouchableWithoutFeedback,
    View,
    StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';

interface PullUpProps {
    visible: boolean;
    onClose: () => void;
    children: ReactNode;
    /** Fraction of screen height for sheet, e.g. 0.4 = 40% */
    sheetHeightPercent?: number;
}

const PullUp: React.FC<PullUpProps> = ({
    visible,
    onClose,
    children,
    sheetHeightPercent = 0.4,
}) => {
    const theme = useTheme();
    const { height } = Dimensions.get('window');
    const sheetHeight = height * sheetHeightPercent;
    const openY = height - sheetHeight;
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
                        height: sheetHeight,
                    },
                ]}
            >
                <View style={[styles.handle, { backgroundColor: theme.sliderTrack }]} />
                {children}
            </Animated.View>
        </Modal>
    );
};

export default PullUp;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
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
});
// src/components/SettingsModal.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import PullUp from './Pullup';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    onSuggestSound: () => void;
    onRestorePurchases: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    onSuggestSound,
    onRestorePurchases,
}) => {
    const theme = useTheme();

    return (
        <PullUp visible={visible} onClose={onClose} sheetHeightPercent={0.7}>
            <Text style={[styles.title, { color: theme.text }]}>
                SoundScape
            </Text>
            <View style={styles.buttonsWrapper}>
                <TouchableOpacity onPress={onSuggestSound} style={styles.button}>
                    <Text style={[styles.buttonText, { color: theme.primary }]}>
                        Suggest Sound
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onRestorePurchases} style={styles.button}>
                    <Text style={[styles.buttonText, { color: theme.primary }]}>
                        Restore Purchases
                    </Text>
                </TouchableOpacity>
            </View>
        </PullUp>
    );
};

export default SettingsModal;

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonsWrapper: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    button: {
        paddingVertical: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '500',
    },
});

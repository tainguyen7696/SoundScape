// src/components/Header.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface HeaderProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    onSettingsPress: () => void;
}

const Header: React.FC<HeaderProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    onSettingsPress,
}) => {
    const theme = useTheme();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: theme.controlBackground }]}>
            <View style={styles.spacer} />

            <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setDropdownVisible(true)}
            >
                <Text style={[styles.dropdownText, { color: theme.text }]}>
                    {selectedCategory}
                </Text>
                <FontAwesome name="chevron-down" size={16} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onSettingsPress}>
                <FontAwesome name="cog" size={24} color={theme.text} />
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal
                transparent
                visible={dropdownVisible}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>
                <View style={[styles.dropdownMenu, { backgroundColor: theme.controlBackground }]}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={styles.menuItem}
                            onPress={() => {
                                onCategoryChange(cat);
                                setDropdownVisible(false);
                            }}
                        >
                            <Text style={[styles.menuText, { color: theme.text }]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    container: {
        height: 86,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 32,
    },
    spacer: {
        width: 24, // to balance right icon
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 6,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 56,
        alignSelf: 'center',
        borderRadius: 8,
        paddingVertical: 4,
        minWidth: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    menuItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    menuText: {
        fontSize: 14,
    },
});

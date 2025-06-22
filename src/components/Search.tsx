// src/components/Search.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface SearchProps extends Omit<TextInputProps, 'style'> {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

const Search: React.FC<SearchProps> = ({
    value,
    onChangeText,
    placeholder = 'Search…',
    ...rest
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
            <FontAwesome name="search" size={16} color={theme.text} style={styles.icon} />
            <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder={placeholder}
                placeholderTextColor={theme.text + '99'}
                value={value}
                onChangeText={onChangeText}
                {...rest}
            />
        </View>
    );
};

export default Search;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        padding: 0,
        margin: 0,
    },
});

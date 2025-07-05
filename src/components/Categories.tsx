// src/components/Categories.tsx
import React from 'react';
import {
    SectionList,
    Text,
    View,
    StyleSheet,
} from 'react-native';
import Card from './Card';
import Search from './Search';
import { useTheme } from '../theme';
import { SceneSound } from '../hooks/useScenePlayer';

export interface SoundItem {
    title: string;
    localAudio: string;
    localImage?: string | null;
    isPremium: boolean;
    category?: string;
}

export interface Section {
    title: string;
    data: SoundItem[];
}

interface CategoriesProps {
    searchValue: string;
    onSearchChange: (text: string) => void;
    placeholder?: string;

    sections: Section[];
    favorites: string[];
    scene: SceneSound[];
    previewTitle: string | null;

    onFavoriteToggle: (title: string) => void;
    onAdd: (title: string) => void;
    onPreview: (title: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({
    searchValue,
    onSearchChange,
    placeholder = 'Search…',

    sections,
    favorites,
    scene,
    previewTitle,
    onFavoriteToggle,
    onAdd,
    onPreview,
}) => {
    const theme = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <Search
                value={searchValue}
                onChangeText={onSearchChange}
                placeholder={placeholder}
            />

            <SectionList
                sections={sections}
                keyExtractor={(item, idx) => item.title + idx}
                contentContainerStyle={styles.listContent}
                renderSectionHeader={({ section: { title } }) => (
                    <View
                        style={[
                            styles.headerContainer,
                            { backgroundColor: theme.background },
                        ]}
                    >
                        <Text style={[styles.headerText, { color: theme.textDim}]}>
                            {title}
                        </Text>
                    </View>
                )}
                renderItem={({ item }) => {
                    const isPlaying = previewTitle === item.title;
                    const isSelected = scene.some(s => s.title === item.title);

                    return (
                        <Card
                            title={item.title}
                            backgroundImage={
                                item.localImage ? { uri: item.localImage } : null
                            }
                            isFavorite={favorites.includes(item.title)}
                            isPlaying={isPlaying}
                            selected={isSelected}
                            isPremium={item.isPremium}   
                            onFavoriteToggle={() => onFavoriteToggle(item.title)}
                            onPreview={() => onPreview(item.title)}
                            onAdd={() => onAdd(item.title)}
                        />
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingVertical: 16,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '300',
    },
    listContent: {
        paddingBottom: 120,
        marginHorizontal: 8,
    },
});

export default Categories;

// src/theme.ts
import { useColorScheme } from 'react-native';

export type Theme = {
    background: string;
    cardBackground: string;
    text: string;
    primary: string;
    overlay: string;
    controlBackground: string;
    sliderTrack: string;
    sliderThumb: string;
};

const LightTheme: Theme = {
    background: '#f9f9f9',
    cardBackground: '#e0e0e0',
    text: '#000000',
    primary: '#007bff',
    overlay: 'rgba(0,0,0,0.5)',
    controlBackground: '#ffffff',
    sliderTrack: '#ccc',
    sliderThumb: '#000',
};

const DarkTheme: Theme = {
    background: '#121212',
    cardBackground: '#1e1e1e',
    text: '#ffffff',
    primary: '#007bff',
    overlay: 'rgba(0,0,0,0.7)',
    controlBackground: '#1e1e1e',
    sliderTrack: '#555',
    sliderThumb: '#ffffff',
};


// Force dark theme only
export const useTheme = (): Theme => DarkTheme;
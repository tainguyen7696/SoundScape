// src/hooks/useScenePlayer.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// detect Expo Go vs. native runtime
const isExpoGo = Constants.appOwnership === 'expo' && Platform.OS !== 'web';

export type SceneSound = import('./useScenePlayerExpo').SceneSound;

// re-export whichever hook matches the runtime
export const useScenePlayer = isExpoGo
    ? require('./useScenePlayerExpo').useScenePlayerExpo
    : require('./useScenePlayerNative').useScenePlayerNative;

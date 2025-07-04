// src/voice/VoiceCommandContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { SpeechService } from './SpeechService';
import { parseIntent, Intent } from './IntentParser';
import audioEngine from '../audio/audioEngine';

interface ContextValue {
    lastCommand: Intent | null;
    state: { scene: string | null; layers: string[] };
}

const VoiceCommandContext = createContext<ContextValue>({
    lastCommand: null,
    state: { scene: null, layers: [] },
});

export const VoiceCommandProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [lastCommand, setLastCommand] = useState<Intent | null>(null);
    const [state, setState] = useState({
        scene: null as string | null,
        layers: [] as string[],
    });

    const isExpoGo =
        Constants.appOwnership === 'expo' && Platform.OS !== 'web';

    useEffect(() => {
        if (isExpoGo) {
            console.warn('[VoiceCommandProvider] skipping voice in Expo Go');
            return;
        }

        SpeechService.init();

        SpeechService.onSpeechResults = (results) => {
            const spoken = results[0];
            const intent = parseIntent(spoken);
            if (intent) {
                handleIntent(intent);
                setLastCommand(intent);
            }
            SpeechService.startListening();
        };

        SpeechService.onSpeechError = () => {
            SpeechService.startListening();
        };

        SpeechService.startListening();

        return () => {
            SpeechService.destroy();
        };
    }, []);

    const handleIntent = async (intent: Intent) => {
        // … your existing switch/case …
    };

    return (
        <VoiceCommandContext.Provider value={{ lastCommand, state }}>
            {children}
        </VoiceCommandContext.Provider>
    );
};

export const useVoiceCommand = () => useContext(VoiceCommandContext);

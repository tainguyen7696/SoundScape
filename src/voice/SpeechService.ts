// src/voice/SpeechService.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Detect Expo Go (managed) vs custom/dev/prod build
const isExpoGo = Constants.appOwnership === 'expo' && Platform.OS !== 'web';

let NativeVoice: typeof import('@react-native-voice/voice').default | null = null;

if (!isExpoGo) {
    try {
        // only require in a native build
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        NativeVoice = require('@react-native-voice/voice').default;
    } catch (e) {
        console.warn('[SpeechService] could not load native voice module:', e);
    }
}

export class SpeechService {
    static onSpeechResults: ((results: string[]) => void) | null = null;
    static onSpeechError: ((error: any) => void) | null = null;

    static init() {
        if (isExpoGo || !NativeVoice) {
            console.warn('[SpeechService] init skipped in Expo Go');
            return;
        }
        NativeVoice.onSpeechResults = (e: any) => {
            if (SpeechService.onSpeechResults && e.value) {
                SpeechService.onSpeechResults(e.value);
            }
        };
        NativeVoice.onSpeechError = (e: any) => {
            if (SpeechService.onSpeechError) {
                SpeechService.onSpeechError(e);
            }
        };
    }

    static async startListening() {
        if (isExpoGo || !NativeVoice) {
            console.warn('[SpeechService] startListening no-op in Expo Go');
            return;
        }
        try {
            await NativeVoice.start('en-US');
        } catch (e) {
            console.warn('[SpeechService] startListening error:', e);
        }
    }

    static async stopListening() {
        if (isExpoGo || !NativeVoice) {
            return;
        }
        try {
            await NativeVoice.stop();
        } catch {
            // ignore
        }
    }

    static destroy() {
        if (isExpoGo || !NativeVoice) {
            return;
        }
        NativeVoice.destroy().then(() => {
            NativeVoice?.removeAllListeners();
        });
    }
}

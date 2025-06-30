import Voice from '@react-native-voice/voice'

export class SpeechService {
    static onSpeechResults: ((results: string[]) => void) | null = null
    static onSpeechError: ((error: any) => void) | null = null

    static init() {
        Voice.onSpeechResults = (e) => {
            if (this.onSpeechResults && e.value) {
                this.onSpeechResults(e.value)
            }
        }
        Voice.onSpeechError = (e) => {
            if (this.onSpeechError) this.onSpeechError(e)
        }
    }

    static async startListening() {
        try {
            await Voice.start('en-US')
        } catch (e) {
            console.warn('Speech start error', e)
        }
    }

    static async stopListening() {
        try {
            await Voice.stop()
        } catch { }
    }

    static destroy() {
        Voice.destroy().then(Voice.removeAllListeners)
    }
}

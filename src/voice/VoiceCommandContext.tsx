import React, { createContext, useContext, useEffect, useState } from 'react'
import { SpeechService } from './SpeechService'
import { parseIntent, Intent } from './IntentParser'
import audioEngine from '../audio/audioEngine'

interface ContextValue {
    lastCommand: Intent | null
    state: { scene: string | null; layers: string[] }
}

const VoiceCommandContext = createContext<ContextValue>({
    lastCommand: null,
    state: { scene: null, layers: [] },
})

export const VoiceCommandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lastCommand, setLastCommand] = useState<Intent | null>(null)
    const [state, setState] = useState({ scene: null as string | null, layers: [] as string[] })

    useEffect(() => {
        SpeechService.init()

        SpeechService.onSpeechResults = (results) => {
            const spoken = results[0]
            const intent = parseIntent(spoken)
            if (intent) {
                handleIntent(intent)
                setLastCommand(intent)
            }
            // keep listening
            SpeechService.startListening()
        }

        SpeechService.onSpeechError = () => {
            // restart on error
            SpeechService.startListening()
        }

        // kick off continuous listening
        SpeechService.startListening()

        return () => {
            SpeechService.destroy()
        }
    }, [])

    const handleIntent = async (intent: Intent) => {
        switch (intent.type) {
            case 'PlayScene':
                await audioEngine.playScene(intent.scene)
                setState({ scene: intent.scene, layers: [] })
                break
            case 'PlaySceneWithLayer':
                await audioEngine.playScene(intent.scene)
                await audioEngine.addLayer(intent.layer)
                setState({ scene: intent.scene, layers: [intent.layer] })
                break
            case 'AddLayer':
                await audioEngine.addLayer(intent.layer)
                setState((s) => ({ ...s, layers: [...s.layers, intent.layer] }))
                break
            case 'RemoveLayer':
                await audioEngine.removeLayer(intent.layer)
                setState((s) => ({ ...s, layers: s.layers.filter(l => l !== intent.layer) }))
                break
            case 'QueryState':
                const st = audioEngine.getState()
                // here you could TTS st back to user
                break
        }
    }

    return (
        <VoiceCommandContext.Provider value={{ lastCommand, state }}>
            {children}
        </VoiceCommandContext.Provider>
    )
}

export const useVoiceCommand = () => useContext(VoiceCommandContext)

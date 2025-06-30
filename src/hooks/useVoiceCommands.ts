import { useVoiceCommand } from '../voice/VoiceCommandContext'

export const useVoiceCommands = () => {
    const { lastCommand, state } = useVoiceCommand()
    return { lastCommand, state }
}

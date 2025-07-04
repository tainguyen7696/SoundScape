import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useVoiceCommands } from '../hooks/useVoiceCommands'

export const VoiceCommandListener: React.FC = () => {
    const { lastCommand, state } = useVoiceCommands()
    return null;
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', bottom: 20, left: 20,
        backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 8,
    },
    text: { color: 'white', fontSize: 12 },
})

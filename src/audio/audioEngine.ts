// src/audio/audioEngine.ts
import { Audio } from 'expo-av'
import { supabase } from '../lib/supabase'

/**
 * Represents one row in your Supabase `sounds` table.
 */
interface SoundEntry {
    title: string
    url: string
}

type PlaybackState = { scene: string | null; layers: string[] }

class AudioEngine {
    private currentScene: string | null = null
    private layers = new Set<string>()
    private loadedSounds: Record<string, Audio.Sound> = {}
    private soundMap: Record<string, string> = {}

    /**
     * Fetches all sound metadata from Supabase.
     * Call once (e.g. in App.tsx useEffect) before any playScene/addLayer calls.
     */
    async init() {
        const { data, error } = await supabase
            .from<SoundEntry>('sounds')
            .select('title, audio_url')

        if (error) {
            console.error('AudioEngine.init(): failed to fetch sounds', error)
            return
        }

        // Build an in-memory map: key -> remote URL
        data?.forEach(({ key, url }) => {
            this.soundMap[key] = url
        })
    }

    /** Play a standalone “scene” (clears any existing layers) */
    async playScene(scene: string) {
        if (this.currentScene && this.currentScene !== scene) {
            await this.unload(this.currentScene)
        }
        this.currentScene = scene
        this.layers.clear()
        await this.loadAndPlay(scene, { loop: true })
    }

    /** Layer an additional loop on top of the current scene */
    async addLayer(layer: string) {
        if (!this.layers.has(layer)) {
            await this.loadAndPlay(layer, { loop: true })
            this.layers.add(layer)
        }
    }

    /** Remove a previously added layer */
    async removeLayer(layer: string) {
        if (this.layers.has(layer)) {
            await this.unload(layer)
            this.layers.delete(layer)
        }
    }

    /** Query the current playback state */
    getState(): PlaybackState {
        return {
            scene: this.currentScene,
            layers: Array.from(this.layers),
        }
    }

    /** Clean up all sounds (optional) */
    async resetAll() {
        if (this.currentScene) {
            await this.unload(this.currentScene)
            this.currentScene = null
        }
        for (const layer of this.layers) {
            await this.unload(layer)
        }
        this.layers.clear()
    }

    // ——— Private helpers ———

    /** Load from URL and start playback */
    private async loadAndPlay(
        key: string,
        options: { loop: boolean }
    ) {
        const uri = this.soundMap[key]
        if (!uri) {
            console.warn(`AudioEngine: no URL for key "${key}"`)
            return
        }

        const sound = new Audio.Sound()
        await sound.loadAsync({ uri }, { shouldPlay: true, isLooping: options.loop })
        this.loadedSounds[key] = sound
    }

    /** Stop + unload from memory */
    private async unload(key: string) {
        const sound = this.loadedSounds[key]
        if (sound) {
            await sound.stopAsync()
            await sound.unloadAsync()
            delete this.loadedSounds[key]
        }
    }
}

export default new AudioEngine()

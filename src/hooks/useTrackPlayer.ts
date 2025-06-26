// src/hooks/useTrackPlayer.ts
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';

export interface CurrentSound {
    id: string;
    url: string;
    title: string;
}

export function useTrackPlayer(
    sounds: CurrentSound[],
    isPlaying: boolean,
    masterVolume: number
) {
    // whenever the sound list itself changes, reset the queue
    useEffect(() => {
        (async () => {
            await TrackPlayer.reset();
            await TrackPlayer.add(
                sounds.map(s => ({
                    id: s.id,
                    url: s.url,
                    title: s.title,
                    artist: '',
                    artwork: ''
                }))
            );
            // ensure volume matches immediately
            await TrackPlayer.setVolume(masterVolume);
            if (isPlaying) {
                await TrackPlayer.play();
            }
        })();
    }, [sounds.map(s => s.id).join('|')]);

    // play/pause toggle
    useEffect(() => {
        if (isPlaying) TrackPlayer.play();
        else TrackPlayer.pause();
    }, [isPlaying]);

    // master volume updates
    useEffect(() => {
        TrackPlayer.setVolume(masterVolume);
    }, [masterVolume]);

    return null;
}

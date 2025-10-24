import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Repeat,
    Shuffle,
} from 'lucide-react';
import type { Track } from '../types/playlist';

interface UnifiedPlayerProps {
    tracks: Track[];
    persistKey?: string;
    onTrackChange?: (index: number) => void;
}

export const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
    tracks = [],
    persistKey,
    onTrackChange,
}) => {
    // --- Helpers ---
    const getSavedPosition = (): number => {
        if (!persistKey) return 0;
        try
        {
            const saved = localStorage.getItem(`player_position_${persistKey}`);
            return saved ? parseInt(saved, 10) : 0;
        } catch
        {
            return 0;
        }
    };

    // --- State ---
    const [currentIndex, setCurrentIndex] = useState<number>(getSavedPosition());
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const noTracks = !tracks || tracks.length === 0;
    const currentTrack = !noTracks ? tracks[currentIndex] || tracks[0] : null;

    // --- Hooks ---
    useEffect(() => {
        if (currentIndex >= tracks.length)
        {
            setCurrentIndex(0);
        }
    }, [tracks, currentIndex]);

    useEffect(() => {
        if (persistKey)
        {
            localStorage.setItem(`player_position_${persistKey}`, currentIndex.toString());
        }
        if (onTrackChange)
        {
            onTrackChange(currentIndex);
        }
    }, [currentIndex, persistKey, onTrackChange]);

    const playNext = () => {
        if (tracks.length <= 1) return;
        let nextIndex;
        if (isShuffle)
        {
            let randomIndex;
            do
            {
                randomIndex = Math.floor(Math.random() * tracks.length);
            } while (tracks.length > 1 && randomIndex === currentIndex);
            nextIndex = randomIndex;
        } else
        {
            nextIndex = (currentIndex + 1) % tracks.length;
        }
        setCurrentIndex(nextIndex);
    };

    const playPrevious = () => {
        if (tracks.length <= 1) return;
        if (progress > 3 && audioRef.current)
        {
            audioRef.current.currentTime = 0;
            setProgress(0);
            return;
        }
        const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
        setCurrentIndex(prevIndex);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setProgress(audio.currentTime);
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            audio.volume = isMuted ? 0 : volume;
        };
        const handleEnded = () => {
            if (isRepeat)
            {
                audio.currentTime = 0;
                void audio.play();
            } else
            {
                playNext();
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };

    }, [volume, isMuted, isRepeat]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;


        if (['local', 'r2', 'external'].includes(currentTrack.source))
        {
            audio.src = currentTrack.uri;
            audio.load();
            setProgress(0);
            if (isPlaying) void audio.play().catch(console.error);
        }
    }, [currentTrack, currentIndex, isPlaying]);

    // --- Handlers ---
    const togglePlayPause = () => {
        if (!currentTrack) return;


        if (['local', 'r2', 'external'].includes(currentTrack.source))
        {
            const audio = audioRef.current;
            if (!audio) return;
            if (isPlaying) audio.pause();
            else void audio.play().catch(console.error);
        } else if (currentTrack.source === 'spotify')
        {
            window.open(
                currentTrack.uri.includes('spotify:track:')
                    ? `https://open.spotify.com/track/${currentTrack.uri.split(':').pop()}`
                    : `https://open.spotify.com/track/${currentTrack.uri}`,
                '_blank'
            );
        } else if (currentTrack.source === 'youtube')
        {
            window.open(`https://www.youtube.com/watch?v=${currentTrack.uri}`, '_blank');
        }

        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const seekTime = Number(e.target.value);
        if (audioRef.current)
        {
            audioRef.current.currentTime = seekTime;
            setProgress(seekTime);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) audioRef.current.volume = newVolume;
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (audioRef.current) audioRef.current.volume = isMuted ? volume : 0;
        setIsMuted(!isMuted);
    };

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')} `;
    };

    // --- Conditional Render ---
    if (noTracks)
    {
        return (<div className="p-6 bg-white/10 backdrop-blur-md rounded-xl text-center">
            No tracks available to play </div>
        );
    }

    // --- UI ---
    return (
        <motion.div
            className="w-full bg-gradient-to-br from-blue-100/60 to-blue-300/40 dark:from-gray-900/60 dark:to-gray-800/40 rounded-2xl shadow-2xl p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        >
            {/* Track info */} <div className="flex items-center gap-4 mb-6">
                <motion.div
                    className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {currentTrack?.thumbnail ? (<img
                        src={currentTrack.thumbnail}
                        alt={currentTrack.name}
                        className="w-full h-full object-cover"
                    />
                    ) : (<svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /> </svg>
                    )}
                </motion.div>


                < div >
                    <motion.h3
                        className="text-xl font-bold"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {currentTrack?.name || 'Unknown Track'}
                    </motion.h3>

                    <motion.p
                        className="text-sm text-gray-600 dark:text-gray-400"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        {currentTrack?.artist || 'Unknown Artist'}
                    </motion.p>

                    <motion.div
                        className="flex items-center gap-2 mt-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${currentTrack?.source === 'local'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : currentTrack?.source === 'r2'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                        : currentTrack?.source === 'spotify'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : currentTrack?.source === 'youtube'
                                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                }`}
                        >
                            {currentTrack?.source?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </motion.div>
                </div >
            </div >

            {/* Progress bar */}
            {
                ['local', 'r2', 'external'].includes(currentTrack?.source ?? '') && (
                    <div className="mb-4">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={progress}
                            onChange={handleSeek}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-blue-200 dark:bg-gray-700"
                            style={{
                                background: duration
                                    ? `linear-gradient(to right, #3b82f6 ${(progress / duration) * 100}%, #bfdbfe ${(progress / duration) * 100}%)`
                                    : undefined,
                            }}
                        />
                        <div className="flex justify-between text-xs mt-1">
                            <span className="text-gray-600 dark:text-gray-400">{formatTime(progress)}</span>
                            <span className="text-gray-600 dark:text-gray-400">{formatTime(duration)}</span>
                        </div>
                    </div>
                )
            }

            {/* Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-2 rounded-full ${isShuffle
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                        title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
                    >
                        <Shuffle size={18} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={playPrevious}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/20"
                        title="Previous"
                    >
                        <SkipBack size={24} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlayPause}
                        className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={playNext}
                        className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white/20"
                        title="Next"
                    >
                        <SkipForward size={24} />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`p-2 rounded-full ${isRepeat
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                        title={isRepeat ? 'Repeat On' : 'Repeat Off'}
                    >
                        <Repeat size={18} />
                    </motion.button>
                </div>

                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleMute}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white/20"
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </motion.button>

                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 appearance-none bg-blue-200 dark:bg-gray-700 rounded-lg"
                    />
                </div>
            </div>

            {
                currentTrack?.source === 'spotify' && (
                    <p className="text-center text-xs mt-4 text-gray-500">Click play to open in Spotify</p>
                )
            }
            {
                currentTrack?.source === 'youtube' && (
                    <p className="text-center text-xs mt-4 text-gray-500">Click play to watch on YouTube</p>
                )
            }

            <audio ref={audioRef} preload="metadata" />
        </motion.div >
    );
};

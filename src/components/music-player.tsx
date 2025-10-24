import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/theme-provider';

interface MusicPlayerProps {
  mood?: string;
}

const FAVORITES_KEY = 'skybuddy_favorite_tracks';

function getStoredFavorites(): string[] {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

// Dummy track data for now
const demoTracks = [
  {
    title: 'Rainy Mood',
    artist: 'SkyBuddy',
    url: '/demo/rainy-mood.mp3',
    cover: '/demo/rainy.jpg',
    mood: 'Rain',
  },
  {
    title: 'Sunny Vibes',
    artist: 'SkyBuddy',
    url: '/demo/sunny-vibes.mp3',
    cover: '/demo/sunny.jpg',
    mood: 'Happy',
  },
];

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ mood }) => {
  const { theme } = useTheme?.() || { 
    theme: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  };
  const isDarkMode = theme === 'dark';

  // Filter tracks by mood if provided
  const tracks = mood ? demoTracks.filter(t => t.mood === mood) : demoTracks;
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => getStoredFavorites());
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Favorite/unfavorite current track
  function handleToggleFavorite() {
    const trackId = tracks[current]?.title + tracks[current]?.artist;
    let updated: string[];
    if (favorites.includes(trackId)) {
      updated = favorites.filter(f => f !== trackId);
    } else {
      updated = [...favorites, trackId];
    }
    setFavorites(updated);
    saveFavorites(updated);
  }

  // Keep favorites in sync with localStorage
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const playPause = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  const next = () => {
    if (shuffle) {
      let nextIdx = Math.floor(Math.random() * tracks.length);
      // Avoid repeating the same track
      if (tracks.length > 1 && nextIdx === current) {
        nextIdx = (nextIdx + 1) % tracks.length;
      }
      setCurrent(nextIdx);
    } else {
      setCurrent((prev) => (prev + 1) % tracks.length);
    }
    setPlaying(false);
    setProgress(0);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + tracks.length) % tracks.length);
    setPlaying(false);
    setProgress(0);
  };

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Progress bar animation
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      setProgress(audio.currentTime);
    };
    const setAudioDuration = () => {
      setDuration(audio.duration || 0);
    };
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioDuration);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioDuration);
    };
  }, [current]);

  // Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setProgress(seekTime);
    }
  };

  // Icon helper for Material Icons
  const Icon = ({
    name,
    className = "",
    style = {},
    ...props
  }: React.HTMLAttributes<HTMLElement> & { name: string }) => (
    <i className={`material-icons ${className}`} style={style} {...props}>{name}</i>
  );

  // Volume icon logic
  const getVolumeIcon = () => {
    if (volume === 0) return "volume_off";
    if (volume < 0.5) return "volume_down";
    return "volume_up";
  };

  return (
    <motion.div
      className="relative w-full max-w-md mx-auto backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-6 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Updated glowing background effect that works well in both modes */}
      <div className="absolute inset-0 z-[-1] overflow-hidden rounded-2xl">
        <div className={`
          absolute inset-0 opacity-80 
          ${isDarkMode 
            ? 'bg-gradient-radial from-indigo-900/40 via-purple-900/20 to-transparent' 
            : 'bg-gradient-radial from-indigo-300/30 via-purple-200/20 to-transparent'
          }
        `}></div>
        <div className={`
          absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-slow-spin opacity-40
          ${isDarkMode
            ? 'bg-gradient-conic from-violet-600/10 via-indigo-500/5 to-purple-600/10'
            : 'bg-gradient-conic from-violet-300/20 via-indigo-300/10 to-purple-300/20'
          }
        `}></div>
      </div>
      
      {/* Music card with frosted glass effect */}
      <div className={`
        absolute inset-0 z-[-1] 
        ${isDarkMode
          ? 'bg-gray-900/60'
          : 'bg-white/60'
        }
        backdrop-blur-md rounded-2xl
      `}></div>
      
      {tracks.length > 0 ? (
        <>
          <motion.div
            className="relative w-52 h-52 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <img
              src={tracks[current].cover}
              alt="cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </motion.div>
          
          <motion.div 
            className="text-center w-full"
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {tracks[current].title}
              </h2>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className={
                  favorites.includes(tracks[current].title + tracks[current].artist)
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }
                title={favorites.includes(tracks[current].title + tracks[current].artist) ? 'Unfavorite' : 'Favorite'}
                onClick={handleToggleFavorite}
              >
                <Icon name={favorites.includes(tracks[current].title + tracks[current].artist) ? "favorite" : "favorite_border"} style={{ fontSize: 24 }} />
              </motion.button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{tracks[current].artist}</p>
          </motion.div>
          
          <audio ref={audioRef} src={tracks[current].url} onEnded={next} />
          
          {/* Animated Progress Bar */}
          <motion.div 
            className="w-full flex flex-col items-center gap-2" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.3 }}
          >
            <motion.input
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
              step="0.1"
              whileFocus={{ scale: 1.03 }}
              style={{
                background: `linear-gradient(90deg, 
                  rgba(99, 102, 241, 0.8) ${(progress / (duration || 1)) * 100}%, 
                  rgba(229, 231, 235, 0.3) ${(progress / (duration || 1)) * 100}%)`
              }}
            />
            <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </motion.div>
          
          {/* Controls */}
          <motion.div 
            className="flex gap-6 items-center mt-2" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => setShuffle(s => !s)}
              className={`p-2 rounded-full ${
                shuffle 
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Shuffle"
            >
              <Icon name="shuffle" style={{ fontSize: 22 }} />
            </motion.button>
            
            <motion.button
              onClick={prev}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Previous"
            >
              <Icon name="skip_previous" style={{ fontSize: 28 }} />
            </motion.button>
            
            <motion.button
              onClick={playPause}
              className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={playing ? 'Pause' : 'Play'}
            >
              <Icon name={playing ? "pause" : "play_arrow"} style={{ fontSize: 32 }} />
            </motion.button>
            
            <motion.button
              onClick={next}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Next"
            >
              <Icon name="skip_next" style={{ fontSize: 28 }} />
            </motion.button>
            
            <motion.button
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title={volume > 0 ? "Mute" : "Unmute"}
            >
              <Icon name={getVolumeIcon()} style={{ fontSize: 22 }} />
            </motion.button>
          </motion.div>
          
          {/* Volume */}
          <motion.div 
            className="flex items-center gap-4 w-full mt-4 px-4" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5 }}
          >
            <Icon name="volume_down" className="text-gray-500 dark:text-gray-400" style={{ fontSize: 18 }} />
            <motion.input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700"
              whileFocus={{ scale: 1.03 }}
              style={{
                background: `linear-gradient(90deg, 
                  rgba(99, 102, 241, 0.8) ${volume * 100}%, 
                  rgba(229, 231, 235, 0.3) ${volume * 100}%)`
              }}
            />
            <Icon name="volume_up" className="text-gray-500 dark:text-gray-400" style={{ fontSize: 18 }} />
          </motion.div>
        </>
      ) : (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          <Icon name="music_off" style={{ fontSize: 48, opacity: 0.5 }} className="mb-4" />
          <p>No tracks available for this mood.</p>
          <button 
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-full text-sm hover:bg-indigo-600 transition-colors"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      )}
    </motion.div>
  );
  
  // Helper to format time in mm:ss
  function formatTime(sec: number) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
};

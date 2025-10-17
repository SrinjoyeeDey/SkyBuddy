import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MusicPlayerProps {
  mood?: string;
}

const FAVORITES_KEY = 'skybuddy_favorite_tracks';

function getStoredFavorites(): string[] {
  try
  {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch
  {
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
    if (favorites.includes(trackId))
    {
      updated = favorites.filter(f => f !== trackId);
    } else
    {
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
    if (playing)
    {
      audioRef.current?.pause();
    } else
    {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  const next = () => {
    if (shuffle)
    {
      let nextIdx = Math.floor(Math.random() * tracks.length);
      // Avoid repeating the same track
      if (tracks.length > 1 && nextIdx === current)
      {
        nextIdx = (nextIdx + 1) % tracks.length;
      }
      setCurrent(nextIdx);
    } else
    {
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
    if (audioRef.current)
    {
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
    if (audioRef.current)
    {
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
      className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-100/60 to-blue-300/40 dark:from-gray-900/60 dark:to-gray-800/40 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      {tracks.length > 0 ? (
        <>
          <motion.img
            src={tracks[current].cover}
            alt="cover"
            className="w-36 h-36 rounded-xl object-cover mb-2 shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          />
          <motion.div className="text-xl font-bold flex items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {tracks[current].title}
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={
                favorites.includes(tracks[current].title + tracks[current].artist)
                  ? 'text-red-500'
                  : 'text-gray-400'
              }
              title={favorites.includes(tracks[current].title + tracks[current].artist) ? 'Unfavorite' : 'Favorite'}
              onClick={handleToggleFavorite}
            >
              <Icon name={favorites.includes(tracks[current].title + tracks[current].artist) ? "favorite" : "favorite_border"} style={{ fontSize: 22 }} />
            </motion.button>
          </motion.div>
          <div className="text-sm text-gray-500 dark:text-gray-300 mb-2">{tracks[current].artist}</div>
          <audio ref={audioRef} src={tracks[current].url} onEnded={next} />
          {/* Animated Progress Bar */}
          <motion.div className="w-full flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <motion.input
              type="range"
              min={0}
              max={duration}
              value={progress}
              onChange={handleSeek}
              className="w-full accent-blue-500 h-2 rounded-lg cursor-pointer"
              step="0.1"
              whileFocus={{ scale: 1.03 }}
              style={{ background: `linear-gradient(90deg, #3b82f6 ${(progress / (duration || 1)) * 100}%, #e5e7eb ${(progress / (duration || 1)) * 100}%)` }}
            />
            <div className="flex justify-between w-full text-xs text-gray-400">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </motion.div>
          {/* Controls */}
          <motion.div className="flex gap-4 items-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <motion.button
              onClick={prev}
              className="p-2 hover:bg-blue-200/60 dark:hover:bg-gray-700/40 rounded-full"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Previous"
            >
              <Icon name="fast_rewind" style={{ fontSize: 28 }} />
            </motion.button>
            <motion.button
              onClick={playPause}
              className="p-4 bg-blue-500 text-white rounded-full shadow-lg text-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={playing ? 'Pause' : 'Play'}
            >
              <Icon name={playing ? "pause" : "play_arrow"} style={{ fontSize: 34 }} />
            </motion.button>
            <motion.button
              onClick={next}
              className="p-2 hover:bg-blue-200/60 dark:hover:bg-gray-700/40 rounded-full"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Next"
            >
              <Icon name="fast_forward" style={{ fontSize: 28 }} />
            </motion.button>
            <motion.button
              onClick={() => setShuffle(s => !s)}
              className={`p-2 rounded-full ${shuffle ? 'bg-blue-500 text-white' : 'bg-blue-100/60 dark:bg-gray-700/40 text-blue-500 dark:text-gray-300'}`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              title="Shuffle"
            >
              <Icon name="shuffle" style={{ fontSize: 22 }} />
            </motion.button>
          </motion.div>
          {/* Volume */}
          <motion.div className="flex items-center gap-2 w-full mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Icon name={getVolumeIcon()} className="text-gray-400" style={{ fontSize: 22 }} />
            <motion.input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 rounded-lg cursor-pointer"
              whileFocus={{ scale: 1.03 }}
            />
            {/* Invisible icon for alignment */}
            <Icon name="volume_up" className="text-gray-400" style={{ fontSize: 22, opacity: 0 }} aria-hidden />
          </motion.div>
        </>
      ) : (
        <div className="text-center text-gray-400">No tracks for this mood.</div>
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
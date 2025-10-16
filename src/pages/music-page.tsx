import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeolocation } from '../hooks/use-geolocation';
import { useWeatherQuery } from '../hooks/use-weather';
import { MusicPlayer } from '../components/music-player';
import { PlaylistManager } from '../components/playlist-manager';
import { getRecommendedPlaylists } from '../lib/playlist-data';
import type { MoodType } from '../types/playlist';

// Placeholder for dynamic background based on weather
const getWeatherBackground = (weather: string) => {
  switch (weather) {
    case 'Rain':
      return 'bg-gradient-to-br from-blue-400 to-gray-700';
    case 'Snow':
      return 'bg-gradient-to-br from-blue-200 to-white';
    case 'Clouds':
      return 'bg-gradient-to-br from-gray-400 to-gray-700';
    case 'Clear':
      return 'bg-gradient-to-br from-yellow-200 to-blue-400';
    default:
      return 'bg-gradient-to-br from-gray-200 to-gray-500';
  }
};

// Helper component for playlist detail and local player
// Persistent local audio management for each playlist
interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  spotifyUrl: string;
}

function PlaylistDetailWithLocalPlayer({ playlist }: { playlist: Playlist }) {
  const LOCAL_AUDIO_KEY = `skybuddy_local_audio_${playlist.id}`;
  const [audioList, setAudioList] = React.useState<{ name: string; url: string }[]>(() => {
    try {
      const data = localStorage.getItem(LOCAL_AUDIO_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
  const [playingIdx, setPlayingIdx] = React.useState<number | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [volume, setVolume] = React.useState(0.7);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Add uploaded audio to persistent list
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAudio = { name: file.name, url };
      const updated = [...audioList, newAudio];
      setAudioList(updated);
      localStorage.setItem(LOCAL_AUDIO_KEY, JSON.stringify(updated));
      // Reset file input so user can re-upload same file after delete
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Delete audio from list
  function handleDeleteAudio(idx: number) {
    // Revoke object URL to free memory
    if (audioList[idx]?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(audioList[idx].url);
    }
    const updated = audioList.filter((_, i) => i !== idx);
    setAudioList(updated);
    localStorage.setItem(LOCAL_AUDIO_KEY, JSON.stringify(updated));
    if (playingIdx === idx) {
      setPlayingIdx(null);
      setIsPlaying(false);
      setProgress(0);
    } else if (playingIdx !== null && playingIdx > idx) {
      setPlayingIdx(playingIdx - 1); // adjust index if needed
    }
    // Reset file input so user can re-upload same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Play/pause logic
  function handlePlayPause(idx: number) {
    if (playingIdx === idx) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setPlayingIdx(idx);
      setIsPlaying(true);
    }
  }

  // Next/Prev with shuffle
  function handleNext() {
    if (!audioList.length) return;
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * audioList.length);
      if (audioList.length > 1 && nextIdx === playingIdx) {
        nextIdx = (nextIdx + 1) % audioList.length;
      }
    } else {
      nextIdx = playingIdx !== null ? (playingIdx + 1) % audioList.length : 0;
    }
    setPlayingIdx(nextIdx);
    setIsPlaying(true);
    setProgress(0);
  }
  function handlePrev() {
    if (!audioList.length) return;
    const prevIdx = playingIdx !== null ? (playingIdx - 1 + audioList.length) % audioList.length : 0;
    setPlayingIdx(prevIdx);
    setIsPlaying(true);
    setProgress(0);
  }

  // When playingIdx changes, set src and play if needed
  React.useEffect(() => {
    if (playingIdx !== null && audioRef.current) {
      audioRef.current.src = audioList[playingIdx]?.url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
    // eslint-disable-next-line
  }, [playingIdx]);

  // Volume control
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // When isPlaying changes, play or pause
  React.useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  function handleTimeUpdate() {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  }
  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setProgress(audioRef.current.currentTime);
    }
  }
  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
      setProgress(Number(e.target.value));
    }
  }

  // Demo fallback
  const localAudioMap: Record<string, { name: string; url: string }> = {
    '37i9dQZF1DXdPec7aLTmlC': { name: 'Sunny Vibes', url: '/demo/sunny-vibes.mp3' },
    '37i9dQZF1DX2v8AuSe3vVh': { name: 'Rainy Mood', url: '/demo/rainy-mood.mp3' },
  };
  const demoAudio = localAudioMap[playlist.id];

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="w-full max-w-lg bg-white/10 rounded-xl shadow-lg p-6 flex flex-col items-center"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <motion.img
          src={playlist.imageUrl}
          alt={playlist.name}
          className="w-40 h-40 rounded-lg object-cover mb-2 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        />
        <motion.div
          className="text-2xl font-bold mb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {playlist.name}
        </motion.div>
        <motion.div
          className="text-sm text-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {playlist.description}
        </motion.div>
        <motion.div className="flex gap-4 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <motion.a
            href={playlist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Open in Spotify
          </motion.a>
          <motion.label
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Add Song
            <input type="file" accept="audio/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
          </motion.label>
        </motion.div>
        {/* Spotify Embed */}
        <motion.div className="w-full mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <iframe
            src={`https://open.spotify.com/embed/playlist/${playlist.id}`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify Playlist Embed"
            className="rounded"
          ></iframe>
          <div className="text-xs text-red-500 mt-2">Note: Spotify embed may only play a 15s preview unless the user is logged in to Spotify Premium.</div>
        </motion.div>
        {/* Local Audio List */}
        <motion.div className="w-full mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="text-base font-semibold mb-2">Your Uploaded Songs</div>
          {audioList.length === 0 && !demoAudio && (
            <div className="text-xs text-gray-400">No local audio available for this playlist.</div>
          )}
          <AnimatePresence>
            <ul className="space-y-2">
              {audioList.map((audio, idx) => (
                <motion.li
                  key={audio.url}
                  className="flex flex-col gap-2 bg-gradient-to-br from-blue-100/60 to-blue-300/40 dark:from-gray-900/60 dark:to-gray-800/40 rounded-2xl p-4 shadow-lg"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
                >
                  <div className="flex items-center gap-3">
                    <motion.button
                      className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white/60 dark:bg-gray-800/60 shadow transition-colors duration-200 text-xl ${playingIdx === idx && isPlaying ? 'ring-2 ring-blue-400' : 'hover:bg-gray-200/60 dark:hover:bg-gray-700/40'}`}
                      onClick={() => handlePlayPause(idx)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      title={playingIdx === idx && isPlaying ? 'Pause' : 'Play'}
                    >
                      {playingIdx === idx && isPlaying ? <span className="material-icons">pause</span> : <span className="material-icons">play_arrow</span>}
                    </motion.button>
                    <span className="flex-1 truncate font-medium text-lg">🎵 {audio.name}</span>
                    <motion.button
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white/60 dark:bg-gray-800/60 shadow text-red-400 hover:text-red-600 text-xl"
                      onClick={() => handleDeleteAudio(idx)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </motion.button>
                  </div>
                  {playingIdx === idx && (
                    <>
                      {/* Animated Progress bar */}
                      <motion.div className="w-full flex flex-col items-center gap-2 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
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
                      <motion.div className="flex gap-4 items-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <motion.button
                          onClick={handlePrev}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white/60 dark:bg-gray-800/60 shadow text-xl hover:bg-gray-200/60 dark:hover:bg-gray-700/40"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          title="Previous"
                        >
                          <span className="material-icons">skip_previous</span>
                        </motion.button>
                        <motion.button
                          onClick={() => handlePlayPause(idx)}
                          className={`w-14 h-14 flex items-center justify-center rounded-full border-2 border-blue-400 bg-white/80 dark:bg-gray-900/80 shadow-lg text-3xl ${isPlaying ? 'ring-2 ring-blue-400' : ''}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <span className="material-icons">pause</span> : <span className="material-icons">play_arrow</span>}
                        </motion.button>
                        <motion.button
                          onClick={handleNext}
                          className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white/60 dark:bg-gray-800/60 shadow text-xl hover:bg-gray-200/60 dark:hover:bg-gray-700/40"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          title="Next"
                        >
                          <span className="material-icons">skip_next</span>
                        </motion.button>
                        <motion.button
                          onClick={() => setShuffle(s => !s)}
                          className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 shadow ${shuffle ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-500' : 'bg-white/60 dark:bg-gray-800/60 text-gray-400'}`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          title="Shuffle"
                        >
                          <span className="material-icons">shuffle</span>
                        </motion.button>
                      </motion.div>
                      {/* Volume */}
                      <motion.div className="flex items-center gap-2 w-full mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <span className="text-gray-400">🔉</span>
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
                        <span className="text-gray-400">🔊</span>
                      </motion.div>
                    </>
                  )}
                </motion.li>
              ))}
              {/* Demo fallback */}
              {audioList.length === 0 && demoAudio && (
                <motion.li
                  className="flex items-center gap-3 bg-white/20 rounded p-2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                >
                  <span className="flex-1 truncate font-medium">🎵 {demoAudio.name} (Demo)</span>
                </motion.li>
              )}
            </ul>
          </AnimatePresence>
          {/* Hidden audio element for playback */}
          <audio
            ref={audioRef}
            style={{ display: 'none' }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => { setIsPlaying(false); setPlayingIdx(null); setProgress(0); }}
          />
        </motion.div>
      </motion.div>
    </div>
  );

  function formatTime(sec: number) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

const MusicPage: React.FC = () => {
  const { coordinates } = useGeolocation();
  const weatherQuery = useWeatherQuery(coordinates);
  const weatherMain = weatherQuery.data?.weather?.[0]?.main || 'Clear';
  const background = getWeatherBackground(weatherMain);

  // Get mood and playlist from query params
  const [searchParams] = useSearchParams();
  const moodParam = searchParams.get('mood') || 'Happy';
  // Normalize mood to MoodType
  const mood = moodParam.toLowerCase() as MoodType;
  const playlistId = searchParams.get('playlist');

  // Get recommended playlists for current weather and mood
  const recommendedPlaylists = getRecommendedPlaylists(weatherMain, mood);
  const selectedPlaylist = playlistId
    ? recommendedPlaylists.find((p) => p.id === playlistId)
    : undefined;

  return (
    <motion.div
      className={`min-h-screen w-full ${background} transition-colors duration-700`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="container mx-auto py-8 px-4 flex flex-col gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 18, delay: 0.1 }}
      >
        <motion.h1
          className="text-3xl font-bold text-center mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Mood Playlist: {mood}
        </motion.h1>
        {selectedPlaylist ? (
          <PlaylistDetailWithLocalPlayer playlist={selectedPlaylist} />
        ) : (
          <>
            <MusicPlayer mood={mood} />
            <PlaylistManager mood={mood} />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MusicPage;
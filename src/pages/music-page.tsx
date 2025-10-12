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
import type { Playlist } from '../types/playlist';

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
                  className="flex items-center gap-3 bg-white/20 rounded p-2"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                  whileHover={{ scale: 1.02, boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)' }}
                >
                  <motion.button
                    className={`px-3 py-1 rounded-full font-semibold shadow transition-colors duration-200 ${playingIdx === idx && isPlaying ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    onClick={() => handlePlayPause(idx)}
                    whileTap={{ scale: 0.95 }}
                  >
                    {playingIdx === idx && isPlaying ? 'Pause' : 'Play'}
                  </motion.button>
                  <span className="flex-1 truncate font-medium">🎵 {audio.name}</span>
                  <motion.button
                    className="text-red-400 hover:text-red-600 text-xs font-semibold"
                    onClick={() => handleDeleteAudio(idx)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                  {playingIdx === idx && (
                    <div className="flex items-center gap-2 w-64">
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={progress}
                        onChange={handleSeek}
                        className="w-32 accent-blue-500"
                        step="0.01"
                      />
                      <span className="text-xs tabular-nums w-16 text-right">{formatTime(progress)} / {formatTime(duration)}</span>
                    </div>
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

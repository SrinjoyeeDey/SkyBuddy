import React, { useRef, useState } from 'react';

interface MusicPlayerProps {
  mood?: string;
}
import { motion } from 'framer-motion';

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
  const audioRef = useRef<HTMLAudioElement>(null);

  const playPause = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  const next = () => {
    setCurrent((prev) => (prev + 1) % tracks.length);
    setPlaying(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + tracks.length) % tracks.length);
    setPlaying(false);
  };

  return (
    <motion.div className="w-full max-w-md mx-auto bg-white/10 rounded-xl shadow-lg p-6 flex flex-col items-center gap-4">
      {tracks.length > 0 ? (
        <>
          <img src={tracks[current].cover} alt="cover" className="w-32 h-32 rounded-lg object-cover mb-2" />
          <div className="text-lg font-semibold">{tracks[current].title}</div>
          <div className="text-sm text-gray-300 mb-2">{tracks[current].artist}</div>
          <audio ref={audioRef} src={tracks[current].url} onEnded={next} />
          <div className="flex gap-4 items-center">
            <button onClick={prev} className="p-2 hover:bg-gray-200/20 rounded-full">⏮️</button>
            <button onClick={playPause} className="p-3 bg-blue-500 text-white rounded-full shadow-lg">
              {playing ? '⏸️' : '▶️'}
            </button>
            <button onClick={next} className="p-2 hover:bg-gray-200/20 rounded-full">⏭️</button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400">No tracks for this mood.</div>
      )}
    </motion.div>
  );
};

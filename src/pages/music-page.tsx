import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Music } from 'lucide-react';
import { useGeolocation } from '../hooks/use-geolocation';
import { useWeatherQuery } from '../hooks/use-weather';
import { getRecommendedPlaylists } from '../lib/playlist-data';
import { usePlaylist } from '../hooks/use-playlist';
import { MusicPlayer } from '../components/music-player';
import { UnifiedPlayer } from '../components/unified-player';
import type { MoodType, Playlist } from '../types/playlist';
import { PlaylistManager } from '../components/playlist-manager';

// Weather background helper
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

// Playlist Detail Component
function PlaylistDetail({ playlist }: { playlist: Playlist }) {
  if (!playlist) {
    return (
      <div className="text-center p-12 bg-white/10 backdrop-blur-md rounded-xl">
        <Music className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium">Playlist not found</h3>
        <p className="text-gray-500 mt-2">This playlist may have been deleted or is unavailable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        {playlist.imageUrl && (
          <img 
            src={playlist.imageUrl} 
            alt={playlist.name}
            className="w-32 h-32 rounded-xl object-cover shadow-lg" 
          />
        )}
        
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{playlist.name}</h2>
          {playlist.description && (
            <p className="text-lg text-gray-600 dark:text-gray-400">{playlist.description}</p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
              {playlist.mood || 'general'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {playlist.tracks?.length || 0} tracks
            </span>
          </div>
        </div>
      </div>
      
      {playlist.tracks?.length > 0 ? (
        <UnifiedPlayer tracks={playlist.tracks} persistKey={`playlist-${playlist.id}`} />
      ) : (
        <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-xl">
          <p className="text-gray-600 dark:text-gray-400">
            This playlist doesn't have any tracks yet. Add some tracks to get started!
          </p>
        </div>
      )}
    </div>
  );
}

const MusicPage: React.FC = () => {
  const { coordinates } = useGeolocation();
  const weatherQuery = useWeatherQuery(coordinates);
  const weatherMain = weatherQuery.data?.weather?.[0]?.main || 'Clear';
  const background = getWeatherBackground(weatherMain);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const moodParam = searchParams.get('mood');
  const playlistId = searchParams.get('playlist');
  
  const mood = moodParam?.toLowerCase() as MoodType | undefined;
  const { playlists } = usePlaylist();
  
  // Combine recommended and user playlists
  const recommendedPlaylists = getRecommendedPlaylists(weatherMain, mood);
  
  // Find selected playlist (either from recommended or user playlists)
  const selectedPlaylist = playlistId
    ? recommendedPlaylists.find((p) => p.id === playlistId) || 
      playlists.find((p) => p.id === playlistId)
    : undefined;
  
  // Handle playlist selection
  const handleSelectPlaylist = (id: string) => {
    setSearchParams({ ...Object.fromEntries(searchParams), playlist: id });
  };
  
  // Go back to playlist list
  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('playlist');
    setSearchParams(params);
  };
  
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
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {mood ? `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes` : 'Your Music'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            {mood ? `Perfect tracks to match your ${mood} mood` : 'Discover and manage your playlists'}
          </p>
        </motion.div>
        
        {selectedPlaylist ? (
          <>
            <div className="flex justify-between items-center">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to playlists
              </button>
            </div>
            
            <PlaylistDetail playlist={selectedPlaylist} />
          </>
        ) : (
          <>
            <MusicPlayer mood={mood} />
            {/* Make sure PlaylistManager has the correct props interface */}
            <PlaylistManager 
              mood={mood} 
              onSelectPlaylist={handleSelectPlaylist} 
            />
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MusicPage;
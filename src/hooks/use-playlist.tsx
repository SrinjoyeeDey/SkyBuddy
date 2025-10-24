import { useContext } from 'react';
import { PlaylistContext } from '../context/playlist-context';

// Hook to use the playlist context
export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
}

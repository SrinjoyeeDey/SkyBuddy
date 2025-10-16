import { createContext } from 'react';
import type { Playlist } from './playlist-provider';

export interface PlaylistContextType {
  // State
  playlists: Playlist[];
  favorites: string[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createPlaylist: (name: string, mood: string, description?: string) => Promise<Playlist>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  
  // Track management
  addTrack: (playlistId: string, trackName: string, artist?: string) => void;
  updateTrack: (playlistId: string, trackId: string, updates: Partial<Track>) => void;
  deleteTrack: (playlistId: string, trackId: string) => void;
  
  // Favorites
  toggleFavorite: (trackId: string) => void;
  
  // Playlist operations
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  sharePlaylist: (id: string) => Promise<string>;
  getSharedPlaylist: (shareId: string) => Promise<Playlist | null>;
  importSharedPlaylist: (shareId: string) => Promise<boolean>;
  getPlaylistsByMood: (mood: string) => Playlist[];
  
  // Storage management
  refreshFromCloud: () => Promise<void>;
  getStorageStatus: () => Promise<{ cloudConnected: boolean; lastSync: number | null }>;
}

export interface Track {
  id: string;
  name: string;
  artist?: string;
  duration?: number;
  url?: string;
  isLocal?: boolean;
}

export const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

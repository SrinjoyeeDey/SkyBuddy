import React, { useReducer, useEffect } from 'react';
import { 
  PlaylistCloudStorage, 
  getStorageService, 
  initializeCloudflareStorage, 
  getCloudflareConfig 
} from '../api/cloudflare-storage';
import { PlaylistContext, type PlaylistContextType, type Track } from './playlist-context';

export interface Playlist {
  id: string;
  name: string;
  mood: string;
  tracks: Track[];
  createdAt: number;
  updatedAt: number;
  isShared?: boolean;
  shareId?: string;
  description?: string;
  coverImage?: string;
}

interface PlaylistState {
  playlists: Playlist[];
  favorites: string[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  error: string | null;
}

type PlaylistAction =
  | { type: 'SET_PLAYLISTS'; payload: Playlist[] }
  | { type: 'ADD_PLAYLIST'; payload: Playlist }
  | { type: 'UPDATE_PLAYLIST'; payload: { id: string; updates: Partial<Playlist> } }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'ADD_TRACK'; payload: { playlistId: string; track: Track } }
  | { type: 'UPDATE_TRACK'; payload: { playlistId: string; trackId: string; updates: Partial<Track> } }
  | { type: 'DELETE_TRACK'; payload: { playlistId: string; trackId: string } }
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_CURRENT_PLAYLIST'; payload: Playlist | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// User identification (in production this would come from auth)
function getUserId(): string {
  let userId = localStorage.getItem('skybuddy_user_id');
  if (!userId) {
    userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    localStorage.setItem('skybuddy_user_id', userId);
  }
  return userId;
}

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateShareId(): string {
  return Math.random().toString(36).substr(2, 8);
}

// Cloud storage instance
let cloudStorage: PlaylistCloudStorage | null = null;

// Initialize cloud storage with fallback to localStorage
async function initializeStorage(): Promise<PlaylistCloudStorage | null> {
  try {
    const config = getCloudflareConfig();
    
    // Check if Cloudflare config is available
    if (config.accountId && config.accessKeyId && config.bucketName) {
      initializeCloudflareStorage(config);
      const service = getStorageService();
      return new PlaylistCloudStorage(service);
    } else {
      console.warn('Cloudflare R2 config not found, falling back to localStorage');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize cloud storage:', error);
    return null;
  }
}

// Fallback localStorage functions
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Reducer
function playlistReducer(state: PlaylistState, action: PlaylistAction): PlaylistState {
  switch (action.type) {
    case 'SET_PLAYLISTS':
      return { ...state, playlists: action.payload };
    
    case 'ADD_PLAYLIST':
      return { ...state, playlists: [...state.playlists, action.payload] };
    
    case 'UPDATE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === action.payload.id
            ? { ...p, ...action.payload.updates, updatedAt: Date.now() }
            : p
        )
      };
    
    case 'DELETE_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.filter(p => p.id !== action.payload),
        currentPlaylist: state.currentPlaylist?.id === action.payload ? null : state.currentPlaylist
      };
    
    case 'ADD_TRACK':
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === action.payload.playlistId
            ? { ...p, tracks: [...p.tracks, action.payload.track], updatedAt: Date.now() }
            : p
        )
      };
    
    case 'UPDATE_TRACK':
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === action.payload.playlistId
            ? {
                ...p,
                tracks: p.tracks.map(t =>
                  t.id === action.payload.trackId ? { ...t, ...action.payload.updates } : t
                ),
                updatedAt: Date.now()
              }
            : p
        )
      };
    
    case 'DELETE_TRACK':
      return {
        ...state,
        playlists: state.playlists.map(p =>
          p.id === action.payload.playlistId
            ? { ...p, tracks: p.tracks.filter(t => t.id !== action.payload.trackId), updatedAt: Date.now() }
            : p
        )
      };
    
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
      case 'TOGGLE_FAVORITE': {
      const favorites = state.favorites.includes(action.payload)
        ? state.favorites.filter(f => f !== action.payload)
        : [...state.favorites, action.payload];
      return { ...state, favorites };
    }
    
    case 'SET_CURRENT_PLAYLIST':
      return { ...state, currentPlaylist: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}



// Provider component
interface PlaylistProviderProps {
  children: React.ReactNode;
}

export function PlaylistProvider({ children }: PlaylistProviderProps) {
  const [state, dispatch] = useReducer(playlistReducer, {
    playlists: [],
    favorites: [],
    currentPlaylist: null,
    isLoading: false,
    error: null,
  });
  // Initialize cloud storage and load data
  useEffect(() => {
    const initializeAndLoad = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Initialize cloud storage
        cloudStorage = await initializeStorage();
        const userId = getUserId();

        if (cloudStorage) {
          // Load from cloud storage
          const [playlistsResult, favoritesResult] = await Promise.all([
            cloudStorage.getPlaylists(userId),
            cloudStorage.getFavorites(userId)
          ]);

          if (playlistsResult.success && playlistsResult.data) {
            dispatch({ type: 'SET_PLAYLISTS', payload: playlistsResult.data });
          }

          if (favoritesResult.success && favoritesResult.data) {
            dispatch({ type: 'SET_FAVORITES', payload: favoritesResult.data });
          }
        } else {
          // Fallback to localStorage
          const playlists = loadFromLocalStorage<Playlist[]>('skybuddy_playlists_v2', []);
          const favorites = loadFromLocalStorage<string[]>('skybuddy_favorite_tracks', []);
          
          dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
          dispatch({ type: 'SET_FAVORITES', payload: favorites });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load playlists' });
        
        // Fallback to localStorage on error
        const playlists = loadFromLocalStorage<Playlist[]>('skybuddy_playlists_v2', []);
        const favorites = loadFromLocalStorage<string[]>('skybuddy_favorite_tracks', []);
        
        dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAndLoad();
  }, []);

  // Auto-save to cloud storage when state changes
  useEffect(() => {
    const saveData = async () => {
      if (!cloudStorage) {
        // Fallback to localStorage
        saveToLocalStorage('skybuddy_playlists_v2', state.playlists);
        return;
      }

      try {
        const userId = getUserId();
        await cloudStorage.storePlaylists(userId, state.playlists);
      } catch (error) {
        console.error('Failed to save playlists to cloud:', error);
        // Fallback to localStorage
        saveToLocalStorage('skybuddy_playlists_v2', state.playlists);
      }
    };

    if (state.playlists.length > 0) {
      saveData();
    }
  }, [state.playlists]);

  useEffect(() => {
    const saveFavorites = async () => {
      if (!cloudStorage) {
        // Fallback to localStorage
        saveToLocalStorage('skybuddy_favorite_tracks', state.favorites);
        return;
      }

      try {
        const userId = getUserId();
        await cloudStorage.storeFavorites(userId, state.favorites);
      } catch (error) {
        console.error('Failed to save favorites to cloud:', error);
        // Fallback to localStorage
        saveToLocalStorage('skybuddy_favorite_tracks', state.favorites);
      }
    };

    saveFavorites();
  }, [state.favorites]);

  // Actions
  const actions = {
    createPlaylist: async (name: string, mood: string, description?: string): Promise<Playlist> => {
      const playlist: Playlist = {
        id: generateId(),
        name: name.trim(),
        mood,
        description,
        tracks: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      dispatch({ type: 'ADD_PLAYLIST', payload: playlist });
      return playlist;
    },

    updatePlaylist: (id: string, updates: Partial<Playlist>) => {
      dispatch({ type: 'UPDATE_PLAYLIST', payload: { id, updates } });
    },

    deletePlaylist: (id: string) => {
      dispatch({ type: 'DELETE_PLAYLIST', payload: id });
    },

    addTrack: (playlistId: string, trackName: string, artist?: string) => {
      const track: Track = {
        id: generateId(),
        name: trackName.trim(),
        artist: artist?.trim(),
        isLocal: true,
      };
      
      dispatch({ type: 'ADD_TRACK', payload: { playlistId, track } });
    },

    updateTrack: (playlistId: string, trackId: string, updates: Partial<Track>) => {
      dispatch({ type: 'UPDATE_TRACK', payload: { playlistId, trackId, updates } });
    },

    deleteTrack: (playlistId: string, trackId: string) => {
      dispatch({ type: 'DELETE_TRACK', payload: { playlistId, trackId } });
    },

    toggleFavorite: (trackId: string) => {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: trackId });
    },

    setCurrentPlaylist: (playlist: Playlist | null) => {
      dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: playlist });
    },    sharePlaylist: async (playlistId: string): Promise<string> => {
      const playlist = state.playlists.find(p => p.id === playlistId);
      if (!playlist) throw new Error('Playlist not found');

      const shareId = generateShareId();
      const shareData = {
        ...playlist,
        shareId,
        isShared: true,
      };

      try {
        if (cloudStorage) {
          // Store in cloud storage
          const result = await cloudStorage.storeSharedPlaylist(shareId, shareData);
          if (!result.success) {
            throw new Error(result.error || 'Failed to store shared playlist');
          }
        } else {
          // Fallback to localStorage
          const sharedPlaylists = loadFromLocalStorage<Record<string, Playlist>>('skybuddy_shared_playlists', {});
          sharedPlaylists[shareId] = shareData;
          saveToLocalStorage('skybuddy_shared_playlists', sharedPlaylists);
        }

        // Update the original playlist to mark it as shared
        dispatch({ type: 'UPDATE_PLAYLIST', payload: { id: playlistId, updates: { isShared: true, shareId } } });

        return shareId;
      } catch (error) {
        console.error('Failed to share playlist:', error);
        throw error;
      }
    },

    getSharedPlaylist: async (shareId: string): Promise<Playlist | null> => {
      try {        if (cloudStorage) {
          // Get from cloud storage
          const result = await cloudStorage.getSharedPlaylist(shareId);
          return result.success ? result.data || null : null;
        } else {
          // Fallback to localStorage
          const sharedPlaylists = loadFromLocalStorage<Record<string, Playlist>>('skybuddy_shared_playlists', {});
          return sharedPlaylists[shareId] || null;
        }
      } catch (error) {
        console.error('Failed to get shared playlist:', error);
        return null;
      }
    },

    importSharedPlaylist: async (shareId: string): Promise<boolean> => {
      try {
        const sharedPlaylist = await actions.getSharedPlaylist(shareId);
        if (!sharedPlaylist) return false;

        // Create a new playlist based on the shared one
        const newPlaylist: Playlist = {
          ...sharedPlaylist,
          id: generateId(),
          name: `${sharedPlaylist.name} (Imported)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isShared: false,
          shareId: undefined,
        };

        dispatch({ type: 'ADD_PLAYLIST', payload: newPlaylist });
        return true;
      } catch {
        return false;
      }
    },

    getPlaylistsByMood: (mood: string): Playlist[] => {
      return state.playlists.filter(p => p.mood.toLowerCase() === mood.toLowerCase());
    },
  };  const contextValue: PlaylistContextType = {
    // State
    playlists: state.playlists,
    favorites: state.favorites,
    currentPlaylist: state.currentPlaylist,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions (mapping from the actions object)
    createPlaylist: actions.createPlaylist,
    updatePlaylist: actions.updatePlaylist,
    deletePlaylist: actions.deletePlaylist,
    addTrack: actions.addTrack,
    updateTrack: actions.updateTrack,
    deleteTrack: actions.deleteTrack,
    toggleFavorite: actions.toggleFavorite,
    setCurrentPlaylist: actions.setCurrentPlaylist,
    sharePlaylist: actions.sharePlaylist,
    getSharedPlaylist: actions.getSharedPlaylist,
    importSharedPlaylist: actions.importSharedPlaylist,
    getPlaylistsByMood: actions.getPlaylistsByMood,
    refreshFromCloud: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (cloudStorage) {
          const result = await cloudStorage.getPlaylists(getUserId());
          if (result.success && result.data) {
            dispatch({ type: 'SET_PLAYLISTS', payload: result.data });
          }
        }
      } catch (error) {
        console.error('Failed to refresh from cloud:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    getStorageStatus: async () => {
      return {
        cloudConnected: cloudStorage !== null,
        lastSync: null // Could be enhanced to track actual sync times
      };
    }
  };

  return (
    <PlaylistContext.Provider value={contextValue}>
      {children}
    </PlaylistContext.Provider>
  );
}



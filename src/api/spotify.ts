// Future Spotify API integration
// This is a placeholder for when we implement real Spotify API integration

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  duration_ms: number;
  preview_url: string | null;
  external_urls: { spotify: string };
  album: {
    name: string;
    images: Array<{ url: string; width: number; height: number }>;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; width: number; height: number }>;
  tracks: {
    total: number;
    items: Array<{ track: SpotifyTrack }>;
  };
  external_urls: { spotify: string };
}

// Mock Spotify API client for demonstration
export class SpotifyAPI {
  private accessToken: string | null = null;

  // In a real implementation, this would handle OAuth flow
  async authenticate(): Promise<boolean> {
    // Mock authentication - in real app this would use Spotify OAuth
    this.accessToken = 'mock_token';
    return true;
  }

  // Search for tracks (mock implementation)
  async searchTracks(query: string, limit: number = 20): Promise<SpotifyTrack[]> {
    // Mock data for demonstration
    return [
      {
        id: 'mock_track_1',
        name: `Search result for "${query}"`,
        artists: [{ name: 'Mock Artist' }],
        duration_ms: 180000,
        preview_url: null,
        external_urls: { spotify: 'https://open.spotify.com/track/mock_track_1' },
        album: {
          name: 'Mock Album',
          images: [{ url: '/demo/sunny.jpg', width: 640, height: 640 }]
        }
      }
    ];
  }

  // Get playlist details (mock implementation)
  async getPlaylist(playlistId: string): Promise<SpotifyPlaylist | null> {
    // Mock playlist data
    return {
      id: playlistId,
      name: 'Mock Playlist',
      description: 'A mock playlist for demonstration',
      images: [{ url: '/demo/rainy.jpg', width: 640, height: 640 }],
      tracks: {
        total: 1,
        items: [
          {
            track: {
              id: 'mock_track_1',
              name: 'Mock Song',
              artists: [{ name: 'Mock Artist' }],
              duration_ms: 180000,
              preview_url: null,
              external_urls: { spotify: 'https://open.spotify.com/track/mock_track_1' },
              album: {
                name: 'Mock Album',
                images: [{ url: '/demo/sunny.jpg', width: 640, height: 640 }]
              }
            }
          }
        ]
      },
      external_urls: { spotify: `https://open.spotify.com/playlist/${playlistId}` }
    };
  }

  // Create playlist (mock implementation)
  async createPlaylist(name: string, description?: string): Promise<SpotifyPlaylist | null> {
    // In real implementation, this would create a playlist on Spotify
    return {
      id: 'new_playlist_' + Date.now(),
      name,
      description: description || '',
      images: [],
      tracks: { total: 0, items: [] },
      external_urls: { spotify: 'https://open.spotify.com/playlist/new_playlist' }
    };
  }

  // Add tracks to playlist (mock implementation)
  async addTracksToPlaylist(playlistId: string, trackIds: string[]): Promise<boolean> {
    // Mock success
    return true;
  }
}

// Singleton instance
export const spotifyAPI = new SpotifyAPI();

// Helper functions for converting between our internal format and Spotify format
export function convertSpotifyTrackToInternal(spotifyTrack: SpotifyTrack) {
  return {
    id: spotifyTrack.id,
    name: spotifyTrack.name,
    artist: spotifyTrack.artists[0]?.name,
    duration: Math.floor(spotifyTrack.duration_ms / 1000),
    url: spotifyTrack.preview_url || undefined,
    isLocal: false
  };
}

export function convertSpotifyPlaylistToInternal(spotifyPlaylist: SpotifyPlaylist) {
  return {
    id: spotifyPlaylist.id,
    name: spotifyPlaylist.name,
    description: spotifyPlaylist.description,
    tracks: spotifyPlaylist.tracks.items.map(item => convertSpotifyTrackToInternal(item.track)),
    mood: 'General', // Would need to be determined by other means
    createdAt: Date.now(),
    updatedAt: Date.now(),
    coverImage: spotifyPlaylist.images[0]?.url
  };
}

export type MoodType = 'happy' | 'relaxed' | 'focused' | 'energetic' | 'calm';

export type WeatherConditionType = 
  | 'Clear' 
  | 'Clouds' 
  | 'Rain' 
  | 'Drizzle' 
  | 'Thunderstorm' 
  | 'Snow' 
  | 'Mist' 
  | 'Smoke' 
  | 'Haze' 
  | 'Dust' 
  | 'Fog' 
  | 'Sand' 
  | 'Ash' 
  | 'Squall' 
  | 'Tornado';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  spotifyUrl: string;
  trackCount: number;
  genre: string;
}

export interface WeatherPlaylistMapping {
  weather: WeatherConditionType;
  emoji: string;
  playlists: SpotifyPlaylist[];
  description: string;
}

export type Playlist = SpotifyPlaylist;
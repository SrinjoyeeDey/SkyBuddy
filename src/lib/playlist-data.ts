import type { WeatherPlaylistMapping, MoodType, SpotifyPlaylist } from '@/types/playlist';

// Curated Spotify playlists for different weather conditions
export const weatherPlaylistMappings: WeatherPlaylistMapping[] = [
  {
    weather: 'Rain',
    emoji: '🌧️',
    description: 'Cozy vibes for a rainy day',
    playlists: [
      {
        id: '37i9dQZF1DX2v8AuSe3vVh',
        name: 'Rainy Day',
        description: 'Cozy up with acoustic and indie tracks',
        imageUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2v8AuSe3vVh',
        trackCount: 100,
        genre: 'Acoustic/Indie'
      },
      {
        id: '37i9dQZF1DX4PP3DA4J0N8',
        name: 'Jazz Vibes',
        description: 'Smooth jazz for a relaxing rainy afternoon',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4PP3DA4J0N8',
        trackCount: 140,
        genre: 'Jazz'
      },
      {
        id: '37i9dQZF1DWZqd5JICZI0u',
        name: 'Lofi Beats',
        description: 'Chill lofi hip hop beats',
        imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u',
        trackCount: 220,
        genre: 'Lo-fi'
      }
    ]
  },
  {
    weather: 'Clear',
    emoji: '☀️',
    description: 'Energetic tracks to match the sunshine',
    playlists: [
      {
        id: '37i9dQZF1DXdPec7aLTmlC',
        name: 'Happy Hits!',
        description: 'Hit the feels with these happy tunes',
        imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC',
        trackCount: 150,
        genre: 'Pop'
      },
      {
        id: '37i9dQZF1DX3rxVfibe1L0',
        name: 'Mood Booster',
        description: 'Get happy with this playlist',
        imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
        trackCount: 130,
        genre: 'Pop/Dance'
      },
      {
        id: '37i9dQZF1DX0XUsuxWHRQd',
        name: 'RapCaviar',
        description: 'New music from top hip-hop artists',
        imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
        trackCount: 50,
        genre: 'Hip-Hop'
      }
    ]
  },
  {
    weather: 'Snow',
    emoji: '❄️',
    description: 'Calm and peaceful winter melodies',
    playlists: [
      {
        id: '37i9dQZF1DX4sWSpwq3LiO',
        name: 'Peaceful Piano',
        description: 'Relax and indulge with beautiful piano pieces',
        imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
        trackCount: 200,
        genre: 'Classical'
      },
      {
        id: '37i9dQZF1DWVFeEut75IAL',
        name: 'Winter Acoustic',
        description: 'Cozy acoustic covers and chill vibes',
        imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWVFeEut75IAL',
        trackCount: 90,
        genre: 'Acoustic'
      },
      {
        id: '37i9dQZF1DX8NTLI2TtZa6',
        name: 'Ambient Relaxation',
        description: 'Calming ambient soundscapes',
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
        trackCount: 120,
        genre: 'Ambient'
      }
    ]
  },
  {
    weather: 'Thunderstorm',
    emoji: '⛈️',
    description: 'Intense and powerful electronic beats',
    playlists: [
      {
        id: '37i9dQZF1DX4dyzvuaRJ0n',
        name: 'mint',
        description: 'The music hitting right now',
        imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4dyzvuaRJ0n',
        trackCount: 100,
        genre: 'Electronic'
      },
      {
        id: '37i9dQZF1DX0hvqKTPJYMa',
        name: 'Beast Mode',
        description: 'Aggressive rap to fuel your workouts',
        imageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0hvqKTPJYMa',
        trackCount: 70,
        genre: 'Hip-Hop/Rap'
      },
      {
        id: '37i9dQZF1DX4JAvHpjipBk',
        name: 'New Music Friday',
        description: 'New music from around the world',
        imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4JAvHpjipBk',
        trackCount: 100,
        genre: 'Various'
      }
    ]
  },
  {
    weather: 'Clouds',
    emoji: '☁️',
    description: 'Mellow and contemplative tunes',
    playlists: [
      {
        id: '37i9dQZF1DX3YSRoSdA634',
        name: 'Evening Acoustic',
        description: 'Gentle acoustic songs for easy listening',
        imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634',
        trackCount: 120,
        genre: 'Acoustic'
      },
      {
        id: '37i9dQZF1DWXe9gFZP0gtP',
        name: 'Relax & Unwind',
        description: 'Ease into relaxation with gentle tunes',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWXe9gFZP0gtP',
        trackCount: 110,
        genre: 'Chill'
      }
    ]
  },
  {
    weather: 'Drizzle',
    emoji: '🌦️',
    description: 'Soft and soothing melodies',
    playlists: [
      {
        id: '37i9dQZF1DX2v8AuSe3vVh',
        name: 'Rainy Day',
        description: 'Cozy up with acoustic and indie tracks',
        imageUrl: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400&h=400&fit=crop',
        spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX2v8AuSe3vVh',
        trackCount: 100,
        genre: 'Acoustic/Indie'
      }
    ]
  }
];

// Mood-based playlist refinements
export const moodPlaylists: Record<MoodType, SpotifyPlaylist[]> = {
  happy: [
    {
      id: '37i9dQZF1DXdPec7aLTmlC',
      name: 'Happy Hits!',
      description: 'Feel-good favorites to lift your spirits',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC',
      trackCount: 150,
      genre: 'Pop'
    }
  ],
  relaxed: [
    {
      id: '37i9dQZF1DWZqd5JICZI0u',
      name: 'Lofi Beats',
      description: 'Chill lofi hip hop beats to relax',
      imageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u',
      trackCount: 220,
      genre: 'Lo-fi'
    }
  ],
  focused: [
    {
      id: '37i9dQZF1DX8NTLI2TtZa6',
      name: 'Deep Focus',
      description: 'Keep calm and stay focused',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6',
      trackCount: 180,
      genre: 'Ambient'
    }
  ],
  energetic: [
    {
      id: '37i9dQZF1DX3rxVfibe1L0',
      name: 'Mood Booster',
      description: 'Get energized with upbeat tracks',
      imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0',
      trackCount: 130,
      genre: 'Pop/Dance'
    }
  ],
  calm: [
    {
      id: '37i9dQZF1DX4sWSpwq3LiO',
      name: 'Peaceful Piano',
      description: 'Relax and indulge with beautiful piano pieces',
      imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&h=400&fit=crop',
      spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
      trackCount: 200,
      genre: 'Classical'
    }
  ]
};

// Helper function to get playlists based on weather
export function getPlaylistsForWeather(weatherCondition: string): WeatherPlaylistMapping | null {
  return weatherPlaylistMappings.find(
    mapping => mapping.weather.toLowerCase() === weatherCondition.toLowerCase()
  ) || null;
}

// Helper function to combine weather and mood playlists
export function getRecommendedPlaylists(
  weatherCondition: string,
  mood?: MoodType
): SpotifyPlaylist[] {
  const weatherMapping = getPlaylistsForWeather(weatherCondition);
  const weatherPlaylists = weatherMapping?.playlists || [];
  
  if (mood && moodPlaylists[mood]) {
    // Combine and deduplicate
    const combined = [...weatherPlaylists, ...moodPlaylists[mood]];
    const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
    return unique;
  }
  
  return weatherPlaylists;
}
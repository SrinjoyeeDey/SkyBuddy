import { useState } from 'react';
import { Music } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/api/types';
import type { MoodType } from '@/types/playlist';
import { getPlaylistsForWeather, getRecommendedPlaylists } from '@/lib/playlist-data';
import PlaylistCard from './playlist-card';
import MoodSelector from './mood-selector';

interface WeatherPlaylistsProps {
  data: WeatherData;
}

const WeatherPlaylists = ({ data }: WeatherPlaylistsProps) => {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  
  const weatherCondition = data.weather[0]?.main || 'Clear';
  const weatherMapping = getPlaylistsForWeather(weatherCondition);
  const recommendedPlaylists = getRecommendedPlaylists(weatherCondition, selectedMood);

  if (!weatherMapping && recommendedPlaylists.length === 0) {
    return null;
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-primary" />
          <div>
            <CardTitle>Your Weather Playlist {weatherMapping?.emoji}</CardTitle>
            <CardDescription>
              {weatherMapping?.description || 'Curated music for the current weather'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mood Selector */}
        <MoodSelector 
          selectedMood={selectedMood} 
          onMoodChange={setSelectedMood} 
        />

        {/* Playlist Grid */}
        {recommendedPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedPlaylists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No playlists available for this weather condition yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherPlaylists;
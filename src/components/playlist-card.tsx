import { ExternalLink, Music2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { SpotifyPlaylist } from '@/types/playlist';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
}

const PlaylistCard = ({ playlist }: PlaylistCardProps) => {
  const [imageError, setImageError] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Try to get mood from search params, fallback to undefined
  const mood = searchParams.get('mood') || undefined;

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to /music?mood=...&playlist=...
    navigate(`/music?mood=${encodeURIComponent(mood || '')}&playlist=${encodeURIComponent(playlist.id)}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <CardContent className="p-0">
        <a 
          href="#"
          onClick={handleCardClick}
          className="block"
        >
          {/* Playlist Image - Smaller with fallback */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {!imageError ? (
              <img
                src={playlist.imageUrl}
                alt={playlist.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Music2 className="w-16 h-16 text-primary/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
            </div>
          </div>

          {/* Playlist Info - Compact */}
          <div className="p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                {playlist.name}
              </h3>
              <Music2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">
              {playlist.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span className="font-medium">{playlist.genre}</span>
              <span>{playlist.trackCount} tracks</span>
            </div>

            {/* Listen Button - Compact */}
            <div className="pt-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary group-hover:underline">
                Listen on Spotify
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  );
};

export default PlaylistCard;
// src/components/playlist-stats.tsx
import React from 'react';
import { Clock, Music, Calendar } from 'lucide-react';
import type { Track } from '../types/playlist';

interface PlaylistStatsProps {
  tracks: Track[];
  createdAt?: number;
}

export const PlaylistStats: React.FC<PlaylistStatsProps> = ({ tracks, createdAt }) => {
  // Calculate total duration (for local/r2 tracks with duration)
  const totalDurationSeconds = tracks.reduce((total, track) => {
    return total + (track.duration || 0);
  }, 0);
  
  const hours = Math.floor(totalDurationSeconds / 3600);
  const minutes = Math.floor((totalDurationSeconds % 3600) / 60);
  
  // Format created date
  const createdDate = createdAt 
    ? new Date(createdAt).toLocaleDateString() 
    : 'Unknown date';
  
  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <Music size={16} />
        <span>{tracks.length} tracks</span>
      </div>
      
      {totalDurationSeconds > 0 && (
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>
            {hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`}
          </span>
        </div>
      )}
      
      {createdAt && (
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>Created on {createdDate}</span>
        </div>
      )}
    </div>
  );
};
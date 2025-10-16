// src/types/playlist.ts
export type TrackSource = 'local' | 'r2' | 'spotify' | 'youtube' | 'external';

export interface Track {
  id: string;
  name: string;
  artist?: string;
  album?: string;
  duration?: number;
  source: TrackSource;
  uri: string; // file blob URL, CDN URL, spotify URI, youtube video ID, or external URL
  thumbnail?: string;
  isLocal?: boolean;
  metadata?: {
    fileSize?: number;
    uploadedAt?: string;
    format?: string;
    bitrate?: number;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  mood?: MoodType;
  imageUrl: string;
  tracks: Track[];
  createdAt: number;
  isShared?: boolean;
  shareId?: string;
}

export type MoodType = 'happy' | 'sad' | 'energetic' | 'calm' | 'romantic' | 'focus';
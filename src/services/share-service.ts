// src/services/share-service.ts
import type { Playlist } from '../types/playlist';

export async function generateShareLink(playlist: Playlist): Promise<string> {
  // This could store the playlist in your database/Cloudflare KV
  // and return a shareable ID
  
  try {
    // Example implementation - would need proper backend
    const response = await fetch('/api/share-playlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: playlist.name,
        description: playlist.description,
        mood: playlist.mood,
        tracks: playlist.tracks
      })
    });
    
    const { id } = await response.json();
    
    // Return shareable URL
    return `${window.location.origin}/shared/playlist/${id}`;
  } catch (error) {
    console.error('Failed to generate share link:', error);
    throw new Error('Failed to create shared link');
  }
}

export async function getSharedPlaylist(id: string): Promise<Playlist> {
  // Fetch shared playlist from backend
  const response = await fetch(`/api/shared-playlist/${id}`);
  
  if (!response.ok) {
    throw new Error('Playlist not found or no longer available');
  }
  
  return response.json();
}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Share2, Music } from 'lucide-react';
import { usePlaylist } from '../hooks/use-playlist';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { Playlist } from '../context/playlist-provider';

interface PlaylistManagerProps {
  mood?: string;
}

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({ mood }) => {
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    addTrack,
    sharePlaylist
  } = usePlaylist();
  
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [trackInputs, setTrackInputs] = useState<{ [playlistId: string]: string }>({});

  // Filter playlists by mood if provided
  const filteredPlaylists = mood
    ? playlists.filter((p: Playlist) => p.mood.toLowerCase() === mood.toLowerCase())
    : playlists;

  // Handle creating new playlist
  const handleCreatePlaylist = async () => {
    if (!newName.trim()) return;
    
    try {
      await createPlaylist(newName.trim(), mood || 'General', newDescription.trim() || undefined);
      setNewName('');
      setNewDescription('');
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  // Handle adding track to playlist
  const handleAddTrack = (playlistId: string) => {
    const trackName = trackInputs[playlistId]?.trim();
    if (!trackName) return;
    
    try {
      addTrack(playlistId, trackName);
      setTrackInputs(prev => ({ ...prev, [playlistId]: '' }));
    } catch (error) {
      console.error('Failed to add track:', error);
    }
  };

  // Handle sharing
  const handleShare = async (playlistId: string) => {
    try {
      const shareId = await sharePlaylist(playlistId);
      const shareUrl = `${window.location.origin}/playlist/shared/${shareId}`;
      
      // Copy to clipboard if available
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      } else {
        prompt('Copy this share link:', shareUrl);
      }
    } catch (error) {
      console.error('Failed to share playlist:', error);
      alert('Failed to share playlist');
    }
  };
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl">Your Music Collection</div>
              {mood && <div className="text-sm font-medium text-muted-foreground capitalize">{mood} vibes</div>}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Playlists */}
          <div className="space-y-4">            {filteredPlaylists.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No playlists yet</h3>
                <p className="text-muted-foreground">
                  {mood ? `No playlists found for "${mood}" mood.` : 'Create your first playlist below to get started!'}
                </p>
              </div>
            ) : (
              filteredPlaylists.map((playlist: Playlist) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300"
                >
                  {/* Playlist Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{playlist.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <span>Mood: {playlist.mood}</span>
                        {playlist.description && <span> • {playlist.description}</span>}
                        <span> • {playlist.tracks.length} tracks</span>
                        {playlist.isShared && <span> • Shared</span>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(playlist.id)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tracks */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Tracks:</h5>
                    
                    {playlist.tracks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No tracks yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {playlist.tracks.map((track: { id: string; name: string; artist?: string }) => (
                          <div key={track.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{track.name}</span>
                              {track.artist && (
                                <span className="text-xs text-muted-foreground">- {track.artist}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Track Input */}
                    <div className="flex gap-2 mt-3">
                      <input
                        placeholder="Track name (e.g., 'Artist - Song Title')"
                        value={trackInputs[playlist.id] || ''}
                        onChange={(e) => setTrackInputs(prev => ({ ...prev, [playlist.id]: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTrack(playlist.id); }}
                        className="flex-1 p-2 text-sm bg-background rounded border"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddTrack(playlist.id)}
                        disabled={!trackInputs[playlist.id]?.trim()}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Track
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>          {/* Create New Playlist */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Create New Playlist</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Playlist Name</label>
                  <input
                    placeholder="Enter a catchy name..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <input
                    placeholder="What's this playlist about? (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
                
                <Button
                  onClick={handleCreatePlaylist}
                  disabled={!newName.trim()}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Playlist
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

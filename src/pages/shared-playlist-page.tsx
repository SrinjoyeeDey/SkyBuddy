import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Download, ArrowLeft, Clock } from 'lucide-react';
import { usePlaylist } from '../hooks/use-playlist';
import type { Playlist } from '../context/playlist-provider';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const SharedPlaylistPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();  const { getSharedPlaylist, importSharedPlaylist } = usePlaylist();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadSharedPlaylist = async () => {
      if (!shareId) {
        setError('Invalid share ID');
        setLoading(false);
        return;
      }

      try {
        const sharedPlaylist = await getSharedPlaylist(shareId);
        if (sharedPlaylist) {
          setPlaylist(sharedPlaylist);
        } else {
          setError('Playlist not found or link expired');
        }
      } catch (err) {
        setError('Failed to load shared playlist');
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSharedPlaylist();
  }, [shareId, getSharedPlaylist]);
  const handleImport = async () => {
    if (!shareId) return;
    
    setImporting(true);
    try {
      const success = await importSharedPlaylist(shareId);
      if (success) {
        setImported(true);
        setTimeout(() => {
          navigate('/music');
        }, 2000);
      } else {
        setError('Failed to import playlist');
      }
    } catch (err) {
      setError('Failed to import playlist');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shared playlist...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto">
              <Music className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
              Playlist Not Found
            </h2>
            <p className="text-red-600 dark:text-red-400">
              {error || 'The shared playlist could not be found.'}
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to SkyBuddy
            </Button>
            
            {imported && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
              >
                ✓ Imported Successfully
              </motion.div>
            )}
          </div>

          {/* Playlist Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Music className="w-8 h-8" />
                    {playlist.name}
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    A shared mood playlist for you to enjoy
                  </CardDescription>
                </div>
                
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {playlist.mood}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Playlist Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Music className="w-4 h-4" />
                  <span>{playlist.tracks.length} tracks</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDate(playlist.createdAt)}</span>
                </div>
              </div>

              {playlist.description && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{playlist.description}</p>
                </div>
              )}

              {/* Track List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Tracks</h3>
                
                {playlist.tracks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    This playlist doesn't have any tracks yet.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {playlist.tracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{track.name}</div>
                          {track.artist && (
                            <div className="text-sm text-muted-foreground">{track.artist}</div>
                          )}
                        </div>
                        {track.isLocal && (
                          <div className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                            Local
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Import Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleImport}
                  disabled={importing || imported}
                  className="w-full"
                  size="lg"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : imported ? (
                    <>
                      ✓ Imported to Your Collection
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Import to My Playlists
                    </>
                  )}
                </Button>
                
                {!imported && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This will add a copy of this playlist to your collection
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SkyBuddy Branding */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Powered by{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary hover:underline font-medium"
              >
                SkyBuddy
              </button>{' '}
              Music for every mood and weather
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedPlaylistPage;

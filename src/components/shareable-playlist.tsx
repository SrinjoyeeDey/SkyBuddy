import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, ExternalLink, Import, QrCode } from 'lucide-react';
import { usePlaylist } from '../hooks/use-playlist';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { Playlist } from '../context/playlist-provider';

interface ShareablePlaylistProps {
  playlistId?: string;
  onClose?: () => void;
}

export const ShareablePlaylist: React.FC<ShareablePlaylistProps> = ({ playlistId, onClose }) => {
  const { playlists, sharePlaylist, importSharedPlaylist } = usePlaylist();
  const [shareUrl, setShareUrl] = useState<string>('');
  const [importUrl, setImportUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const playlist = playlistId ? playlists.find((p: Playlist) => p.id === playlistId) : null;
  const handleShare = async () => {
    if (!playlist) return;
    
    setIsSharing(true);
    setError('');
    
    try {
      const shareId = await sharePlaylist(playlist.id);
      const url = `${window.location.origin}/playlist/shared/${shareId}`;
      setShareUrl(url);
    } catch (err) {
      setError('Failed to create shareable link');
      console.error('Share error:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    
    setIsImporting(true);
    setError('');
    
    try {
      // Extract share ID from URL
      const urlParts = importUrl.trim().split('/');
      const shareId = urlParts[urlParts.length - 1];
      
      if (!shareId) {
        throw new Error('Invalid share URL format');
      }
        const success = await importSharedPlaylist(shareId);
      if (success) {
        setImportUrl('');
        alert('Playlist imported successfully!');
      } else {
        throw new Error('Playlist not found or invalid share ID');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import playlist');
    } finally {
      setIsImporting(false);
    }
  };

  const generateQRCode = () => {
    if (!shareUrl) return;
    
    // Using a simple QR code service for demo purposes
    // In production, you might want to use a proper QR library
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share Playlists
        </CardTitle>
        <CardDescription>
          Share your mood playlists with friends or import shared playlists
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Share Section */}
        {playlist && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-2">Share "{playlist.name}"</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Mood: {playlist.mood} • {playlist.tracks.length} tracks
              </p>
              
              {!shareUrl ? (
                <Button 
                  onClick={handleShare} 
                  disabled={isSharing}
                  className="w-full"
                >
                  {isSharing ? 'Creating Link...' : 'Generate Share Link'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      className="flex-1 p-2 text-xs bg-muted rounded border"
                    />
                    <Button
                      size="sm"
                      onClick={handleCopy}
                      variant="outline"
                      className="px-3"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Copy className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={generateQRCode}
                      className="flex-1"
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      QR Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(shareUrl, '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Import Section */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Import Shared Playlist</h3>
            <div className="flex gap-2">
              <input
                placeholder="Paste share URL here..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                className="flex-1 p-2 text-xs bg-background rounded border"
              />
              <Button
                size="sm"
                onClick={handleImport}
                disabled={!importUrl.trim() || isImporting}
              >
                <Import className="w-4 h-4 mr-1" />
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Shared playlists include all tracks and metadata</p>
          <p>• Share links work across devices and browsers</p>
          <p>• Imported playlists become part of your collection</p>
        </div>

        {onClose && (
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

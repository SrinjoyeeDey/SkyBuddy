// src/components/track-upload-form.tsx
import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Link, Music2 as MusicIcon } from 'lucide-react';
import { uploadAudioToR2 } from '../services/storage-service';
import type { TrackSource } from '../types/playlist';

interface TrackUploadFormProps {
  onUploadComplete: (track: {
    name: string;
    artist: string;
    source: TrackSource;
    uri: string;
  }) => void;
  onCancel: () => void;
}

export const TrackUploadForm: React.FC<TrackUploadFormProps> = ({ 
  onUploadComplete, 
  onCancel 
}) => {
  const [name, setName] = useState('');
  const [artist, setArtist] = useState('');
  const [source, setSource] = useState<TrackSource>('local');
  const [uri, setUri] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Auto-populate name from filename
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setName(fileName);
    
    // Create local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setUri(objectUrl);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a track name');
      return;
    }
    
    try {
      let finalUri = uri;
      let finalSource = source;
      
      // Handle file upload to R2
      if (source === 'local' && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        setIsUploading(true);
        
        try {
          const result = await uploadAudioToR2(file, {
            onProgress: setUploadProgress
          });
          finalUri = result.cdnUrl;
          finalSource = 'r2';
        } catch (error) {
          console.error('Upload failed:', error);
          toast.error('Failed to upload file');
          setIsUploading(false);
          return;
        }
        
        setIsUploading(false);
      } else if (source === 'spotify') {
        // Extract Spotify URI/ID
        const spotifyMatch = uri.match(/(?:spotify:track:|open\.spotify\.com\/track\/)([a-zA-Z0-9]{22})/);
        finalUri = spotifyMatch ? spotifyMatch[1] : uri;
      } else if (source === 'youtube') {
        // Extract YouTube video ID
        const ytMatch = uri.match(/(?:youtube\.com\/watch\?v=|youtube\.be\/)([a-zA-Z0-9_-]{11})/);
        finalUri = ytMatch ? ytMatch[1] : uri;
      }
      
      // Send back the track info to parent
      onUploadComplete({
        name: name.trim(),
        artist: artist.trim() || 'Unknown',
        source: finalSource,
        uri: finalUri
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Track Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white/80 dark:bg-gray-800/80"
          placeholder="Enter track name"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Artist (Optional)</label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full p-2 border rounded-lg bg-white/80 dark:bg-gray-800/80"
          placeholder="Artist name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSource('local')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              source === 'local' 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                : 'bg-white/50 dark:bg-gray-800/50'
            }`}
          >
            <Upload size={16} />
            <span>Local File</span>
          </button>
          
          <button
            type="button"
            onClick={() => setSource('spotify')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              source === 'spotify' 
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                : 'bg-white/50 dark:bg-gray-800/50'
            }`}
          >
            <MusicIcon size={16} />
            <span>Spotify</span>
          </button>
          
          <button
            type="button"
            onClick={() => setSource('youtube')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              source === 'youtube' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                : 'bg-white/50 dark:bg-gray-800/50'
            }`}
          >
            <MusicIcon size={16} />
            <span>YouTube</span>
          </button>
          
          <button
            type="button"
            onClick={() => setSource('external')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              source === 'external' 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                : 'bg-white/50 dark:bg-gray-800/50'
            }`}
          >
            <Link size={16} />
            <span>External URL</span>
          </button>
        </div>
      </div>
      
      {source === 'local' ? (
        <div>
          <label className="block text-sm font-medium mb-1">Upload Audio File</label>
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            onChange={handleFileSelect}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
          
          {isUploading && (
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded">
                <div 
                  className="h-full bg-blue-500 rounded" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-center mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-1">
            {source === 'spotify' ? 'Spotify Track URL' :
             source === 'youtube' ? 'YouTube Video URL' :
             'External Audio URL'}
          </label>
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            className="w-full p-2 border rounded-lg bg-white/80 dark:bg-gray-800/80"
            placeholder={
              source === 'spotify' ? 'https://open.spotify.com/track/...' :
              source === 'youtube' ? 'https://www.youtube.com/watch?v=...' :
              'https://example.com/audio.mp3'
            }
            required
          />
        </div>
      )}
      
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isUploading ? 'Uploading...' : 'Add Track'}
        </button>
      </div>
    </form>
  );
};
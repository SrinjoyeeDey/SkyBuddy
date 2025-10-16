// src/services/storage-service.ts
import { toast } from 'sonner';

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  folder?: string;
}

export interface UploadResult {
  cdnUrl: string;
  fileSize: number;
  fileName: string;
  uploadedAt: string;
}

export async function uploadAudioToR2(
  file: File, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, folder = 'audio' } = options;
  const formData = new FormData();
  
  // Clean the filename to be URL-safe
  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
    
  const uniqueFileName = `${folder}/${Date.now()}-${safeFileName}`;
  formData.append('file', file);
  formData.append('path', uniqueFileName);
  
  try {
    // Upload to your Cloudflare Worker endpoint that handles R2 uploads
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      // Report upload progress if requested
      ...(onProgress && {
        onUploadProgress: (progressEvent: ProgressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // The worker should return a CDN URL 
    return {
      cdnUrl: result.cdnUrl, // URL from your CDN
      fileSize: file.size,
      fileName: safeFileName,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload audio file');
    throw error;
  }
}
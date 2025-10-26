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

// Add this to enable development mode without a real R2 bucket
const USE_MOCK_UPLOAD = import.meta.env.MODE !== 'production' || import.meta.env?.DEV;

// Add to storage-service.ts
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      console.warn(`Upload attempt ${attempt + 1} failed:`, error);
      lastError = error;
      // Wait before retrying (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  
  throw lastError;
}

export async function uploadAudioToR2(
  file: File, 
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, folder = 'audio' } = options;
  
  // Add to uploadAudioToR2 function in storage-service.ts
  if (!file.type.startsWith('audio/')) {
    toast.error('Only audio files are supported');
    throw new Error('Invalid file type. Only audio files are supported.');
  }

  // Add size limit
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  if (file.size > MAX_FILE_SIZE) {
    toast.error('File too large (maximum 20MB)');
    throw new Error('File too large. Maximum size is 20MB.');
  }
  
  // Clean the filename to be URL-safe
  const safeFileName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
    
  const uniqueFileName = `${folder}/${Date.now()}-${safeFileName}`;
  
  // Mock implementation for development
  if (USE_MOCK_UPLOAD) {
    // Simulate upload progress
    if (onProgress) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        onProgress(progress);
      }, 300);
    }
    
    // Return mock result after delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      cdnUrl: URL.createObjectURL(file), // Use local object URL for preview
      fileSize: file.size,
      fileName: safeFileName,
      uploadedAt: new Date().toISOString()
    };
  }
  
  // Real implementation for production
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', uniqueFileName);
  
  try {
    // Upload to your Cloudflare Worker endpoint that handles R2 uploads
    const response = await fetchWithRetry('/api/upload', { // Use a relative path that your app can proxy
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
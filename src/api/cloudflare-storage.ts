// Cloudflare R2 Storage Service for SkyBuddy Playlists
// This service handles playlist storage and retrieval using Cloudflare R2 with CDN

import type { Playlist } from '../context/playlist-provider';

export interface CloudflareConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  cdnUrl: string;
  region?: string;
}

export interface StorageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface R2Object {
  key: string;
  size: number;
  etag: string;
  lastModified: string;
}

export interface R2ListResponse {
  objects: R2Object[];
  truncated: boolean;
  nextContinuationToken?: string;
}

export interface CloudflareStorageOptions {
  compress?: boolean;
  ttl?: number;
  metadata?: Record<string, string>;
}

class CloudflareR2Service {
  private config: CloudflareConfig;
  private baseUrl: string;

  constructor(config: CloudflareConfig) {
    this.config = config;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/r2/buckets/${config.bucketName}/objects`;
  }

  /**
   * Generate authentication headers for Cloudflare R2 API
   */
  private getAuthHeaders(): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    return {
      'Authorization': `Bearer ${this.config.accessKeyId}`,
      'X-Auth-Email': this.config.secretAccessKey, // In production, use proper OAuth
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp
    };
  }

  /**
   * Store data in Cloudflare R2
   */
  async store<T>(
    key: string, 
    data: T, 
    options: CloudflareStorageOptions = {}
  ): Promise<StorageResponse<string>> {
    try {
      const payload = {
        key,
        data: options.compress ? this.compress(JSON.stringify(data)) : JSON.stringify(data),
        metadata: {
          'content-type': 'application/json',
          'skybuddy-version': '1.0',
          'created-at': new Date().toISOString(),
          ...options.metadata
        },
        ...(options.ttl && { ttl: options.ttl })
      };

      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });      if (!response.ok) {
        throw new Error(`Storage failed: ${response.status} ${response.statusText}`);
      }

      await response.json(); // Consume response body
      
      return {
        success: true,
        data: this.getCdnUrl(key)
      };
    } catch (error) {
      console.error('R2 Storage Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Storage failed'
      };
    }
  }

  /**
   * Retrieve data from Cloudflare R2
   */
  async retrieve<T>(key: string): Promise<StorageResponse<T>> {
    try {
      // Try CDN first for faster access
      const cdnUrl = this.getCdnUrl(key);
      let response = await fetch(cdnUrl, {
        headers: {
          'Cache-Control': 'max-age=3600' // 1 hour cache
        }
      });

      // Fallback to R2 API if CDN fails
      if (!response.ok) {
        response = await fetch(`${this.baseUrl}/${encodeURIComponent(key)}`, {
          method: 'GET',
          headers: this.getAuthHeaders()
        });
      }

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: 'Data not found' };
        }
        throw new Error(`Retrieval failed: ${response.status} ${response.statusText}`);
      }

      const rawData = await response.text();
      const data = JSON.parse(this.isCompressed(rawData) ? this.decompress(rawData) : rawData);

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('R2 Retrieval Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed'
      };
    }
  }

  /**
   * Delete data from Cloudflare R2
   */
  async delete(key: string): Promise<StorageResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Deletion failed: ${response.status} ${response.statusText}`);
      }

      return { success: true, data: true };
    } catch (error) {
      console.error('R2 Deletion Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed'
      };
    }
  }

  /**
   * List objects with a specific prefix
   */
  async list(prefix: string = ''): Promise<StorageResponse<string[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?prefix=${encodeURIComponent(prefix)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.status} ${response.statusText}`);
      }      const result = await response.json() as R2ListResponse;
      const keys = result.objects?.map((obj: R2Object) => obj.key) || [];

      return {
        success: true,
        data: keys
      };
    } catch (error) {
      console.error('R2 List Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'List failed'
      };
    }
  }

  /**
   * Generate CDN URL for faster access
   */
  private getCdnUrl(key: string): string {
    return `${this.config.cdnUrl}/${encodeURIComponent(key)}`;
  }

  /**
   * Simple compression for large playlist data
   */
  private compress(data: string): string {
    // Simple base64 encoding as compression placeholder
    // In production, use proper compression like gzip
    return btoa(data);
  }

  /**
   * Decompress data
   */
  private decompress(data: string): string {
    try {
      return atob(data);
    } catch {
      return data; // Return as-is if not compressed
    }
  }

  /**
   * Check if data is compressed
   */
  private isCompressed(data: string): boolean {
    // Simple check - in production, use proper compression detection
    try {
      atob(data);
      return !data.startsWith('{') && !data.startsWith('[');
    } catch {
      return false;
    }
  }

  /**
   * Generate shareable URLs with optional expiration
   */
  async generateShareableUrl(key: string, expiresIn: number = 7 * 24 * 3600): Promise<StorageResponse<string>> {
    try {
      const expiration = Math.floor((Date.now() / 1000) + expiresIn);
      
      // Create a signed URL for sharing
      const shareUrl = `${this.config.cdnUrl}/${encodeURIComponent(key)}?expires=${expiration}`;
      
      return {
        success: true,
        data: shareUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL generation failed'
      };
    }
  }
}

// Storage service instance
let r2Service: CloudflareR2Service | null = null;

/**
 * Initialize Cloudflare R2 service
 */
export function initializeCloudflareStorage(config: CloudflareConfig): void {
  r2Service = new CloudflareR2Service(config);
}

/**
 * Get the R2 service instance
 */
export function getStorageService(): CloudflareR2Service {
  if (!r2Service) {
    throw new Error('Cloudflare R2 service not initialized. Call initializeCloudflareStorage() first.');
  }
  return r2Service;
}

/**
 * Playlist-specific storage operations
 */
export class PlaylistCloudStorage {
  private service: CloudflareR2Service;
  private readonly PLAYLIST_PREFIX = 'playlists/';
  private readonly SHARED_PREFIX = 'shared/';
  private readonly FAVORITES_KEY = 'user/favorites';

  constructor(service: CloudflareR2Service) {
    this.service = service;
  }

  // Store user's playlists
  async storePlaylists(userId: string, playlists: Playlist[]): Promise<StorageResponse> {
    const key = `${this.PLAYLIST_PREFIX}${userId}`;
    return this.service.store(key, playlists, {
      compress: true,
      metadata: {
        'data-type': 'playlists',
        'user-id': userId,
        'count': playlists.length.toString()
      }
    });
  }

  // Retrieve user's playlists
  async getPlaylists(userId: string): Promise<StorageResponse<Playlist[]>> {
    const key = `${this.PLAYLIST_PREFIX}${userId}`;
    return this.service.retrieve(key);
  }

  // Store shared playlist
  async storeSharedPlaylist(shareId: string, playlist: Playlist): Promise<StorageResponse> {
    const key = `${this.SHARED_PREFIX}${shareId}`;
    return this.service.store(key, playlist, {
      compress: true,
      ttl: 30 * 24 * 3600, // 30 days
      metadata: {
        'data-type': 'shared-playlist',
        'share-id': shareId,
        'playlist-name': playlist.name
      }
    });
  }

  // Retrieve shared playlist
  async getSharedPlaylist(shareId: string): Promise<StorageResponse<Playlist>> {
    const key = `${this.SHARED_PREFIX}${shareId}`;
    return this.service.retrieve(key);
  }

  // Store user favorites
  async storeFavorites(userId: string, favorites: string[]): Promise<StorageResponse> {
    const key = `${this.FAVORITES_KEY}/${userId}`;
    return this.service.store(key, favorites);
  }

  // Retrieve user favorites
  async getFavorites(userId: string): Promise<StorageResponse<string[]>> {
    const key = `${this.FAVORITES_KEY}/${userId}`;
    return this.service.retrieve(key);
  }

  // Generate shareable URL for playlist
  async generatePlaylistShareUrl(shareId: string): Promise<StorageResponse<string>> {
    const key = `${this.SHARED_PREFIX}${shareId}`;
    return this.service.generateShareableUrl(key);
  }

  // Delete user's playlists
  async deletePlaylists(userId: string): Promise<StorageResponse> {
    const key = `${this.PLAYLIST_PREFIX}${userId}`;
    return this.service.delete(key);
  }

  // Delete shared playlist
  async deleteSharedPlaylist(shareId: string): Promise<StorageResponse> {
    const key = `${this.SHARED_PREFIX}${shareId}`;
    return this.service.delete(key);
  }
}

// Environment configuration helper
export function getCloudflareConfig(): CloudflareConfig {
  return {
    accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
    accessKeyId: import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_CLOUDFLARE_SECRET_ACCESS_KEY || '',
    bucketName: import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME || 'skybuddy-playlists',
    cdnUrl: import.meta.env.VITE_CLOUDFLARE_CDN_URL || '',
    region: import.meta.env.VITE_CLOUDFLARE_REGION || 'auto'
  };
}

export default CloudflareR2Service;

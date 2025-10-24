// Environment configuration
export const config = {
  r2: {
    // This can be overridden by environment variables in production
    uploadEndpoint: import.meta.env?.VITE_R2_UPLOAD_ENDPOINT || '/api/upload',
    
    // Whether to use mock uploads (automatically detected in dev mode)
    useMockUploads: import.meta.env.MODE !== 'production' || import.meta.env?.DEV
  }
};
import React, { useState, useEffect } from 'react';
import { Cloud, HardDrive, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StorageStatusProps {
  className?: string;
}

type StorageType = 'cloud' | 'local' | 'checking';
type ConnectionStatus = 'online' | 'offline' | 'checking';

export const StorageStatus: React.FC<StorageStatusProps> = ({ className = '' }) => {
  const [storageType, setStorageType] = useState<StorageType>('checking');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    checkStorageStatus();
    checkConnectionStatus();

    // Set up connection monitoring
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkStorageStatus = async () => {
    try {
      // Check if Cloudflare config is available
      const hasCloudflareConfig = !!(
        import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID &&
        import.meta.env.VITE_CLOUDFLARE_ACCESS_KEY_ID &&
        import.meta.env.VITE_CLOUDFLARE_BUCKET_NAME
      );

      if (hasCloudflareConfig && navigator.onLine) {
        // Try to ping the storage service
        await fetch(import.meta.env.VITE_CLOUDFLARE_CDN_URL || '', {
          method: 'HEAD',
          mode: 'no-cors'
        }).catch(() => null);

        setStorageType('cloud');
      } else {
        setStorageType('local');
      }
    } catch {
      setStorageType('local');
    }
  };

  const checkConnectionStatus = () => {
    setConnectionStatus(navigator.onLine ? 'online' : 'offline');
  };

  const getStorageIcon = () => {
    switch (storageType) {
      case 'cloud':
        return <Cloud className="w-4 h-4" />;
      case 'local':
        return <HardDrive className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4 animate-pulse bg-gray-300 rounded" />;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'online':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 animate-pulse bg-gray-300 rounded" />;
    }
  };

  const getStatusColor = () => {
    if (storageType === 'cloud' && connectionStatus === 'online') {
      return 'text-green-600 dark:text-green-400';
    } else if (storageType === 'local' || connectionStatus === 'offline') {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusText = () => {
    if (storageType === 'checking' || connectionStatus === 'checking') {
      return 'Checking...';
    }

    if (storageType === 'cloud' && connectionStatus === 'online') {
      return 'Cloud Storage';
    } else if (connectionStatus === 'offline') {
      return 'Offline Mode';
    } else {
      return 'Local Storage';
    }
  };

  const getDetailedStatus = () => {
    if (storageType === 'cloud' && connectionStatus === 'online') {
      return {
        title: 'Cloud Storage Active',
        description: 'Your playlists are synced to Cloudflare R2 with CDN acceleration',
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      };
    } else if (connectionStatus === 'offline') {
      return {
        title: 'Offline Mode',
        description: 'Working offline. Changes will sync when connection is restored',
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
      };
    } else {
      return {
        title: 'Local Storage',
        description: 'Data is stored locally in your browser. Cloud sync unavailable',
        icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
      };
    }
  };

  const detailedStatus = getDetailedStatus();

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors ${getStatusColor()}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {getStorageIcon()}
        {getConnectionIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 bg-background border rounded-lg shadow-lg p-4 w-80 z-50"
          >
            <div className="flex items-start gap-3">
              {detailedStatus.icon}
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-sm">{detailedStatus.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {detailedStatus.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    {storageType === 'cloud' ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                    )}
                    <span>Storage: {storageType === 'cloud' ? 'Cloud' : 'Local'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {connectionStatus === 'online' ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                    <span>Network: {connectionStatus}</span>
                  </div>
                </div>

                {storageType === 'local' && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded text-xs">
                    <strong>Note:</strong> To enable cloud storage, configure Cloudflare R2 credentials in your environment variables.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

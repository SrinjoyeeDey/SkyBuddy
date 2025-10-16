// src/hooks/use-favorites.ts
import { useState, useEffect } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('skybuddy_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('skybuddy_favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  const addFavorite = (trackId: string) => {
    setFavorites(prev => [...prev, trackId]);
  };
  
  const removeFavorite = (trackId: string) => {
    setFavorites(prev => prev.filter(id => id !== trackId));
  };
  
  const toggleFavorite = (trackId: string) => {
    if (favorites.includes(trackId)) {
      removeFavorite(trackId);
    } else {
      addFavorite(trackId);
    }
  };
  
  const isFavorite = (trackId: string) => favorites.includes(trackId);
  
  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };
}
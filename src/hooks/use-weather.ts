// src/hooks/useWeather.ts
import type {
    Coordinates,
    WeatherResponse,
    ForecastResponse,
    LocationResponse,
    SearchResponse,
    AQIResponse,
    UVIndexResponse,
    PollenResponse,
  } from "@/api/types";
  import { weatherAPI } from "@/api/weather";
  import { useQuery } from "@tanstack/react-query";
  
  // ---------------- Query Keys ----------------
  export const WEATHER_KEYS = {
    weather: (coords: Coordinates) => ["weather", coords] as const,
    forecast: (coords: Coordinates) => ["forecast", coords] as const,
    location: (coords: Coordinates) => ["location", coords] as const,
    search: (query: string) => ["location-search", query] as const,
  } as const;
  
  // ---------------- Weather & Forecast ----------------
  export function useWeatherQuery(coordinates: Coordinates | null) {
    return useQuery<WeatherResponse | null>({
      queryKey: WEATHER_KEYS.weather(coordinates ?? { lat: 0, lon: 0 }),
      queryFn: () => (coordinates ? weatherAPI.getCurrentWeather(coordinates) : null),
      enabled: !!coordinates,
    });
  }
  
  export function useForecastQuery(coordinates: Coordinates | null) {
    return useQuery<ForecastResponse | null>({
      queryKey: WEATHER_KEYS.forecast(coordinates ?? { lat: 0, lon: 0 }),
      queryFn: () => (coordinates ? weatherAPI.getForecast(coordinates) : null),
      enabled: !!coordinates,
    });
  }
  
  // ---------------- Reverse Geocoding & Search ----------------
  export function useReverseGeocodeQuery(coordinates: Coordinates | null) {
    return useQuery<LocationResponse | null>({
      queryKey: WEATHER_KEYS.location(coordinates ?? { lat: 0, lon: 0 }),
      queryFn: () => (coordinates ? weatherAPI.reverseGeocode(coordinates) : null),
      enabled: !!coordinates,
    });
  }
  
  export function useLocationSearch(query: string) {
    return useQuery<SearchResponse | null>({
      queryKey: WEATHER_KEYS.search(query),
      queryFn: () => (query.length >= 3 ? weatherAPI.searchLocations(query) : null),
      enabled: query.length >= 3,
    });
  }
  
  // ---------------- Health Queries ----------------
  export const HEALTH_KEYS = {
    aqi: (coords: Coordinates) => ["aqi", coords] as const,
    uv: (coords: Coordinates) => ["uv", coords] as const,
    pollen: (coords: Coordinates) => ["pollen", coords] as const,
  } as const;
  
  export function useAQIQuery(coordinates: Coordinates | null) {
    return useQuery<AQIResponse | null>({
      queryKey: HEALTH_KEYS.aqi(coordinates ?? { lat: 0, lon: 0 }),
      queryFn: () => (coordinates ? weatherAPI.getAQI(coordinates) : null),
      enabled: !!coordinates,
    });
  }
  
  export function useUVIndexQuery(coordinates: Coordinates | null) {
    return useQuery<UVIndexResponse | null>({
      queryKey: HEALTH_KEYS.uv(coordinates ?? { lat: 0, lon: 0 }),
      queryFn: () => (coordinates ? weatherAPI.getUVIndex(coordinates) : null),
      enabled: !!coordinates,
    });
  }
  
  export function usePollenQuery(coordinates: Coordinates | null) {
    return useQuery<PollenResponse | null>({
      queryKey: HEALTH_KEYS.pollen(coordinates ?? { lat: 0, lon: 0 }),
      queryFn: () => (coordinates ? weatherAPI.getPollen(coordinates) : null),
      enabled: !!coordinates,
    });
  }
  
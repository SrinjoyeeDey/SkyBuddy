// src/api/types.ts

// ---------------- Coordinates ----------------
export interface Coordinates {
    lat: number;
    lon: number;
  }
  
  // ---------------- AQI ----------------
  export interface AQIData {
    coord: Coordinates;
    list: Array<{
      main: {
        aqi: number; // 1-5 scale
      };
      components: {
        co: number;
        no: number;
        no2: number;
        o3: number;
        so2: number;
        pm2_5: number;
        pm10: number;
        nh3: number;
      };
      dt: number;
    }>;
  }
  
  export interface AQIResponse extends AQIData {}

  
  
  // ---------------- UV Index ----------------
  export interface UVIndexData {
    lat: number;
    lon: number;
    date_iso: string;
    value: number;
  }
  
  export interface UVIndexResponse extends UVIndexData {}
  
  // ---------------- Pollen ----------------
  export interface PollenData {
    coord: Coordinates;
    pollen_types: Array<{
      type: string;
      index: number;
      risk: string;
    }>;
    dt: number;
  }
  
  export interface PollenResponse extends PollenData {}
  
  // ---------------- Weather ----------------
  export interface WeatherCondition {
    id: number;
    main: string;
    description: string;
    icon: string;
  }
  
  export interface WeatherData {
    coord: Coordinates;
    weather: WeatherCondition[];
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    sys: {
      sunrise: number;
      sunset: number;
      country: string;
    };
    name: string;
    dt: number;
  }
  
  export interface WeatherResponse extends WeatherData {}
  
  // ---------------- Forecast ----------------
  export interface ForecastData {
    list: Array<{
      dt: number;
      main: WeatherData['main'];
      weather: WeatherData['weather'];
      wind: WeatherData['wind'];
      dt_txt: string;
    }>;
    city: {
      name: string;
      country: string;
      sunrise: number;
      sunset: number;
    };
  }
  
  export interface ForecastResponse extends ForecastData {}
  
  // ---------------- Geocoding / Location ----------------
  export interface GeocodingResponse {
    name: string;
    local_names?: Record<string, string>;
    lat: number;
    lon: number;
    country: string;
    state?: string;
  }
  
  export type LocationResponse = GeocodingResponse[];
  
  // ---------------- Search ----------------
  export type SearchResponse = GeocodingResponse[];
  
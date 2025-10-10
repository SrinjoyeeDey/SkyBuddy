import { API_CONFIG } from "./config"
import type { AQIData, Coordinates, ForecastData, GeocodingResponse, WeatherData } from "./types";

type UVIndexData = {
    lat: number;
    lon: number;
    date_iso: string;
    date: number;
    value: number;
};

class WeatherAPI{
    async getAQI({lat, lon}: Coordinates) {
        const url = this.createUrl(`${API_CONFIG.BASE_URL}/air_pollution`, {
            lat: lat.toString(),
            lon: lon.toString(),
            appid: import.meta.env.VITE_OPENWEATHER_API_KEY
        });
        return this.fetchData<AQIData>(url);
    }

    async getUVIndex({lat, lon}: Coordinates) {
        const url = this.createUrl(`https://api.openweathermap.org/data/2.5/uvi`, {
            lat: lat.toString(),
            lon: lon.toString(),
            appid: import.meta.env.VITE_OPENWEATHER_API_KEY
        });
        return this.fetchData<UVIndexData>(url);
    }

    async getPollen({lat, lon}: Coordinates) {
        return Promise.resolve({
            coord: { lat, lon },
            pollen_types: [
                { type: 'tree', index: 2, risk: 'moderate' },
                { type: 'grass', index: 1, risk: 'low' },
                { type: 'weed', index: 3, risk: 'high' }
            ],
            dt: Date.now() / 1000
        });
    }
    private createUrl(endpoint: string, params: Record<string, string | number>) {
        // Convert all values to string for URLSearchParams
        const stringParams: Record<string, string> = {};
        for (const key in params) {
            stringParams[key] = String(params[key]);
        }
        const searchParams = new URLSearchParams(stringParams);
        return `${endpoint}?${searchParams.toString()}`;
    }
    private async fetchData<T>(url:string):Promise<T>{
        const response=await fetch(url);

        if(!response.ok){
            throw new Error(`Weather API Error: ${response.statusText}`);
        }
        return response.json();
    }
    async getCurrentWeather({lat,lon}:Coordinates):Promise<WeatherData>{
        const url=this.createUrl(`${API_CONFIG.BASE_URL}/weather`,{
            lat:lat.toString(),
            lon:lon.toString(),
            units:API_CONFIG.DEFAULT_PARAMS.units,
            appid: import.meta.env.VITE_OPENWEATHER_API_KEY
        });
        return this.fetchData<WeatherData>(url);
    }

    async getForecast({lat,lon}:Coordinates):Promise<ForecastData>{
        const url=this.createUrl(`${API_CONFIG.BASE_URL}/forecast`,{
            lat:lat.toString(),
            lon:lon.toString(),
            units:API_CONFIG.DEFAULT_PARAMS.units,
            appid: import.meta.env.VITE_OPENWEATHER_API_KEY
        });
        return this.fetchData<ForecastData>(url);
    }

    async reverseGeocode({lat,lon}:Coordinates):Promise<GeocodingResponse[]>{
        const url=this.createUrl(`${API_CONFIG.GEO}/reverse`,{
            lat:lat.toString(),
            lon:lon.toString(),
            limit:1,
            appid: import.meta.env.VITE_OPENWEATHER_API_KEY
        });
        return this.fetchData<GeocodingResponse[]>(url);
    }


    async searchLocations(query:string):Promise<GeocodingResponse[]>{
        const url=this.createUrl(`${API_CONFIG.GEO}/direct`,{
            q:query,
            limit:'5',
            appid: import.meta.env.VITE_OPENWEATHER_API_KEY
        });
        return this.fetchData<GeocodingResponse[]>(url);
    }
}

export const weatherAPI=new WeatherAPI();
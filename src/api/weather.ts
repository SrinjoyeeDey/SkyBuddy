import { API_CONFIG } from "./config"
import type { Coordinates, ForecastData, GeocodingResponse, WeatherData } from "./types";

class WeatherAPI{
    private createUrl(endpoint:string,params:Record<string,string | number>)
    {
        const searchParams=new URLSearchParams({
            appid:API_CONFIG.API_KEY,
            ...params //taking all params
        })
        return `${endpoint}?${searchParams.toString()}`
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
            units:API_CONFIG.DEFAULT_PARAMS.units
        });
        
        return this.fetchData<WeatherData>(url);
    }

    async getForecast({lat,lon}:Coordinates):Promise<ForecastData>{
        const url=this.createUrl(`${API_CONFIG.BASE_URL}/forecast`,{
            lat:lat.toString(),
            lon:lon.toString(),
            units:API_CONFIG.DEFAULT_PARAMS.units,
        });
        
        return this.fetchData<ForecastData>(url);
    }

    // It will be an array
    async reverseGeocode({lat,lon}:Coordinates):Promise<GeocodingResponse[]>{
        const url=this.createUrl(`${API_CONFIG.GEO}/reverse`,{
            lat:lat.toString(),
            lon:lon.toString(),
            limit:1,
        });
        
        return this.fetchData<GeocodingResponse[]>(url);
    }


    async searchLocations(query:string):Promise<GeocodingResponse[]>{
        const url=this.createUrl(`${API_CONFIG.GEO}/direct`,{
            q:query,
            limit:'5',
        });
        
        return this.fetchData<GeocodingResponse[]>(url);
    }
}

export const weatherAPI=new WeatherAPI();
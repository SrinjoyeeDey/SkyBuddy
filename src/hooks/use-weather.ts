// React query uses a hook called useQuery to fetch data

import type { Coordinates } from "@/api/types";
import { weatherAPI } from "@/api/weather";
import { useQuery } from "@tanstack/react-query";

export const WEATHER_KEYS={
    weather:(coords:Coordinates)=>['weather',coords] as const,
    forecast:(coords:Coordinates)=>['forecast',coords] as const,
    location:(coords:Coordinates)=>['location',coords] as const,
    search:(query:string)=>['location-search',query] as const,
} as const;

//for loading and navigating to different cities , if we visit the same city page within 5/6 mins we dont want to fetch entire weather data again, but to see the previous data

export function useWeatherQuery(coordinates:Coordinates | null){
    return useQuery({
        queryKey: WEATHER_KEYS.weather(coordinates ?? {lat:0,lon:0}),
        queryFn:()=>coordinates?weatherAPI.getCurrentWeather(coordinates):null, //weatherAPI class we created
        enabled:!!coordinates,

    })
}

export function useForecastQuery(coordinates:Coordinates | null){
    return useQuery({
        queryKey: WEATHER_KEYS.forecast(coordinates ?? {lat:0,lon:0}),
        queryFn:()=>coordinates?weatherAPI.getForecast(coordinates):null, //weatherAPI class we created
        enabled:!!coordinates,

    })
}

export function useReverseGeocodeQuery(coordinates:Coordinates | null){
    return useQuery({
        queryKey: WEATHER_KEYS.location(coordinates ?? {lat:0,lon:0}),
        queryFn:()=>coordinates?weatherAPI.reverseGeocode(coordinates):null, //weatherAPI class we created
        enabled:!!coordinates,

    })
}

export function useLocationSearch(query:string){
    return useQuery({
        queryKey: WEATHER_KEYS.search(query),
        queryFn:()=>weatherAPI.searchLocations(query), 
        enabled:query.length>=3,

    })
}
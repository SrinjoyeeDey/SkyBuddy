import CurrentWeather from "@/components/currentWeather";
import HourlyTemp from "@/components/hourly-temp";
import WeatherSkeleton from "@/components/loading-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useForecastQuery, useWeatherQuery, useAQIQuery, useUVIndexQuery, usePollenQuery } from "@/hooks/use-weather";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import WeatherDetails from "@/components/weather-details";
import WeatherForecast from "@/components/weather-forecast";
import { useState } from "react";
import FavoriteButton from "@/components/favorite-button";
import HealthRecommendations from "@/components/healthRecommendations";

const CityPage = () => {
  
  const [searchParams]=useSearchParams();
  const params=useParams();
  const lat=parseFloat(searchParams.get('lat')|| '0'); //to takeout anything from search params
  const lon=parseFloat(searchParams.get('lon')|| '0');

  const coordinates={lat,lon};

  const weatherQuery=useWeatherQuery(coordinates);
  const forecastQuery=useForecastQuery(coordinates);
  const aqiQuery = useAQIQuery(coordinates);
  const uvQuery = useUVIndexQuery(coordinates);
  const pollenQuery = usePollenQuery(coordinates);


  if(weatherQuery.error || forecastQuery.error){
    return (<Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription className="flex flex-col gap-4">
              <p>Failed to load weather data. Please try again.</p>
            </AlertDescription>
          </Alert>
    )
  }

  if(!weatherQuery.data || !forecastQuery.data || !params.cityName){
    return <WeatherSkeleton />
  }

  // Extract AQI, UV, and pollen values for health recommendations
  const aqi = aqiQuery.data?.list?.[0]?.main?.aqi;
  const uv = uvQuery.data?.value;
  const pollen = pollenQuery.data?.pollen_types;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{params.cityName},{weatherQuery.data.sys.country}</h1>
        <div className="">
          {/* favorite button */}
          <FavoriteButton data={{...weatherQuery.data,name:params.cityName}}/>
        </div>
      </div>

      {/* Health Recommendations for searched city */}
      <HealthRecommendations aqi={aqi} uv={uv} pollen={pollen} />

      <div className="grid gap-6">
        <div className="flex flex-col gap-4">
            <CurrentWeather data={weatherQuery.data} />
            <HourlyTemp data={forecastQuery.data} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-start">
            {/* details */}
            <WeatherDetails data={weatherQuery.data} />
            {/* forecast */}
            <WeatherForecast data={forecastQuery.data} />
        </div>
      </div>
    </div>
  );
}

export default CityPage;

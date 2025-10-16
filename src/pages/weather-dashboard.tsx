import { useAQIQuery, useUVIndexQuery, usePollenQuery } from "@/hooks/use-weather";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AlertTriangle, MapPin, RefreshCcw } from "lucide-react";
import WeatherSkeleton from '@/components/loading-skeleton'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useForecastQuery, useReverseGeocodeQuery, useWeatherQuery } from "@/hooks/use-weather";
import CurrentWeather from "@/components/currentWeather";
import HourlyTemp from "@/components/hourly-temp";
import WeatherDetails from "@/components/weather-details";
import WeatherForecast from "@/components/weather-forecast";
import FavoriteCities from "@/components/favorite-cities";
import HealthRecommendations from "@/components/healthRecommendations";
import WeatherPlaylists from "@/components/weather-playlist";

const WeatherDashboard = () => {
  const {coordinates,error:locationError,getLocation,isLoading:locationLoading}=useGeolocation();

  const locationQuery=useReverseGeocodeQuery(coordinates);
  const weatherQuery = useWeatherQuery(coordinates);
  const forecastQuery = useForecastQuery(coordinates);
  const aqiQuery = useAQIQuery(coordinates);
  const uvQuery = useUVIndexQuery(coordinates);
  const pollenQuery = usePollenQuery(coordinates);

  const handleRefresh=()=>{
    getLocation();
  };
  
  if(locationLoading){
    return <WeatherSkeleton />
  }
  if(locationError){
    return <Alert variant="destructive">{/* ...error JSX... */}</Alert>;
  }
  if(!coordinates){
    return <Alert variant="destructive">{/* ...error JSX... */}</Alert>;
  }
  const locationName=locationQuery.data?.[0];
  if(weatherQuery.error || forecastQuery.error){
    return (<Alert variant="destructive">{/* ...error JSX... */}</Alert>)
  }
  if(!weatherQuery.data || !forecastQuery.data) {
    return <WeatherSkeleton />
  }

  const aqi = aqiQuery.data?.list?.[0]?.main?.aqi;
  const uv = uvQuery.data?.value;
  const pollen = pollenQuery.data?.pollen_types;

  return (
    <div className="space-y-4">
      <FavoriteCities />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">My Location</h1>
        <Button variant={'outline'} size={'icon'} onClick={handleRefresh}
          disabled={weatherQuery.isFetching || forecastQuery.isFetching}
        >
          <RefreshCcw className={`h-4 w-4 ${weatherQuery.isFetched ? 'animate-spin' : ''}`}/>
        </Button>
      </div>

      <HealthRecommendations aqi={aqi} uv={uv} pollen={pollen} />


      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {weatherQuery.data && (
            <>
              <CurrentWeather data={weatherQuery.data} locationName={locationName} isLoading={weatherQuery.isFetching || locationQuery.isFetching} />
              {forecastQuery.data && <HourlyTemp data={forecastQuery.data} />}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <WeatherDetails data={weatherQuery.data} />
        <WeatherForecast data={forecastQuery.data} />
      </div>
      
      <WeatherPlaylists data={weatherQuery.data} />
    </div>
  );
}

export default WeatherDashboard;


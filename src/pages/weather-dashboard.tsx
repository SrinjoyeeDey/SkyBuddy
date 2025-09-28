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

const WeatherDashboard = () => {
  const {coordinates,error:locationError,getLocation,isLoading:locationLoading}=useGeolocation();

  const locationQuery=useReverseGeocodeQuery(coordinates);
  console.log('Reverse geocode data:', locationQuery.data);
  const weatherQuery=useWeatherQuery(coordinates);
  const forecastQuery=useForecastQuery(coordinates);

  console.log(weatherQuery.data)

  const handleRefresh=()=>{
    getLocation();
    if(coordinates){

    }
  };
  if(locationLoading){
     return <WeatherSkeleton />
  }
  if(locationError){
    return <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error!</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{locationError}</p>
        <Button onClick={getLocation} variant={'outline'} className="w-fit">
           <MapPin className="mr-2 h-4 w-4" />
          Enable Location
        </Button>
      </AlertDescription>
    </Alert>;
  }

  if(!coordinates){
    return <Alert variant="destructive">
      <AlertTitle>Location required</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <p>Please enable loaction access tp see your local weather</p>
          <Button onClick={getLocation} variant={'outline'} className="w-fit">
            <MapPin className="mr-2 h-4 w-4" />
            Enable Location
          </Button>
        </AlertDescription>
    </Alert>;
  }

  const locationName=locationQuery.data?.[0];

  if(weatherQuery.error || forecastQuery.error){
    return (<Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error!</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>Failed to fetch weather data. Please try again.</p>
        <Button onClick={handleRefresh} variant={'outline'} className="w-fit">
           <RefreshCcw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
    )
  }

  if(!weatherQuery.data || !forecastQuery.data) {
    return <WeatherSkeleton />
  }

  return (
    <div className="space-y-4">

      <FavoriteCities />
      <div className="flex items-center justify-between">
        
        <h1 className="text-xl font-bold tracking-tight">My Location</h1>
        <Button variant={'outline'} size={'icon'} onClick={handleRefresh}
        disabled={weatherQuery.isFetching || forecastQuery.isFetching}

        >
          <RefreshCcw className={`h-4 w-4 ${weatherQuery.isFetched?'animate-spin':''}`}/> 
        </Button>
      </div>

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
              {/* details */}
              <WeatherDetails data={weatherQuery.data} />
              {/* forecast */}

              <WeatherForecast data={forecastQuery.data} />
          </div>
      </div>
  )
}

export default WeatherDashboard;

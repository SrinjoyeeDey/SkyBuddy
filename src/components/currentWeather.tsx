import type { GeocodingResponse, WeatherData } from "@/api/types";
import { Card, CardContent } from "./ui/card";
import { ArrowDown, ArrowUp, Droplets, Wind } from "lucide-react";

interface CurrentWeatherProps {
  data?: WeatherData;
  locationName?: GeocodingResponse;
  isLoading?: boolean;
}

const CurrentWeather = ({ data, locationName, isLoading }: CurrentWeatherProps) => {
  // Show skeleton / placeholder while loading
  if (isLoading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardContent className="p-6">
          <div className="h-60 bg-gray-200 rounded-md" />
        </CardContent>
      </Card>
    );
  }


  // Debug: log the received data
  console.log('CurrentWeather data:', data);

  const formatTemp = (t?: number) => (t !== undefined && t !== null ? `${Math.round(t)}°` : "--");

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left side: location + temp */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-end gap-1">
                <h2 className="text-2xl font-bold tracking-tighter">
                  {locationName?.name }
                </h2>
                {locationName?.state && <span className="text-muted-foreground">, {locationName.state}</span>}
              </div>
              <p className="text-sm text-muted-foreground">{locationName?.country }</p>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-7xl font-bold tracking-tighter">{formatTemp(data?.main?.temp)}</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Feels like {formatTemp(data?.main?.feels_like)}
                </p>
                <div className="flex gap-2 text-sm font-medium">
                  <span className="flex items-center gap-1 text-blue-500">
                    <ArrowDown className="h-3 w-3" /> {formatTemp(data?.main?.temp_min)}
                  </span>
                  <span className="flex items-center gap-1 text-blue-500">
                    <ArrowUp className="h-3 w-3" /> {formatTemp(data?.main?.temp_max)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Humidity</p>
                  <p className="text-sm text-muted-foreground">{data?.main?.humidity !== undefined && data?.main?.humidity !== null ? data.main.humidity : "--"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-blue-500" />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Wind Speed</p>
                  <p className="text-sm text-muted-foreground">{data?.wind?.speed !== undefined && data?.wind?.speed !== null ? data.wind.speed : "--"} m/s</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: weather icon + description */}
          <div className="flex items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[200px] items-center justify-center">
              {data?.weather?.[0] ? (
                <>
                  <img
                    src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`}
                    alt={data.weather[0].description}
                    className="w-45 h-45"
                  />
                  <div className="absolute bottom-0 text-center">
                    <p className="text-sm font-medium capitalize">{data.weather[0].description}</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Weather info unavailable</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeather;

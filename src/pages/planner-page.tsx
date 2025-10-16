import { useForecastQuery } from "@/hooks/use-weather";
import { useGeolocation } from "@/hooks/use-geolocation";
import { PersonalPlanner } from "@/components/PersonalPlanner";
import WeatherSkeleton from "@/components/loading-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const PlannerPage = () => {
  // This page needs its own location and forecast data
  const { coordinates, error: locationError, getLocation, isLoading: locationLoading } = useGeolocation();
  const forecastQuery = useForecastQuery(coordinates);

  const renderContent = () => {
    if (locationLoading || (coordinates && forecastQuery.isLoading)) {
      return <WeatherSkeleton />;
    }

    if (locationError || !coordinates) {
      return (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Location Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>Please enable location access to use the Personal Planner.</p>
            <Button onClick={getLocation} variant={'outline'} className="w-fit">
              <MapPin className="mr-2 h-4 w-4" />
              Enable Location
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (forecastQuery.error) {
      return <Alert variant="destructive" className="mt-6">Error loading forecast data.</Alert>;
    }

    if (forecastQuery.data) {
      return <PersonalPlanner forecastData={forecastQuery.data} />;
    }
    
    return null; // Should not be reached
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="outline" size="sm">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">Personal Planner</h1>
      {renderContent()}
    </div>
  );
};

export default PlannerPage;

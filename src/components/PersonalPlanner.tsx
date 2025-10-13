// src/components/PersonalPlanner.tsx
import type { ForecastData } from "@/api/types";
import { CalendarConnect } from "./ui/CalendarConnect";
import { UnifiedPlannerView } from "./UnifiedPlannerView"; // <-- Import the new component

interface PersonalPlannerProps {
  forecastData: ForecastData;
}

export const PersonalPlanner = ({ forecastData }: PersonalPlannerProps) => {
  const hasCalendarToken = !!localStorage.getItem('google_access_token');

  // If the user is not connected, show the connect button
  if (!hasCalendarToken) {
    return <CalendarConnect />;
  }

  // If connected, show the new unified planner view
  return <UnifiedPlannerView forecastData={forecastData} />;
};

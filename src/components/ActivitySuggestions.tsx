// src/components/ActivitySuggestions.tsx
import type { DailyForecast } from "@/lib/suggestion-engine";
import type { ForecastData, ForecastListItem } from "@/api/types";
import { getActivitySuggestion } from "@/lib/suggestion-engine";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ActivitySuggestionsProps {
  data: ForecastData;
}

// Helper to get the day of the week (e.g., "Tuesday")
const getDayOfWeek = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', { weekday: 'long' });
};

export const ActivitySuggestions = ({ data }: ActivitySuggestionsProps) => {
  // 2. PROCESS THE 3-HOUR LIST INTO A 5-DAY LIST
  // We filter the list to get only one forecast per day (at noon).
  const dailyForecasts: DailyForecast[] = data.list
    .filter((item: ForecastListItem) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  const suggestions = dailyForecasts.map((day: DailyForecast) => ({
    day: getDayOfWeek(day.dt),
    suggestion: getActivitySuggestion(day),
    icon: day.weather[0].icon
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>💡 Activity Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {suggestions.map((item, index: number) => ( // 3. Add types for parameters
            <li key={index} className="flex items-center text-sm">
               <img
                  src={`https://openweathermap.org/img/wn/${item.icon}.png`}
                  alt="weather icon"
                  className="w-8 h-8 mr-2"
                />
              <span className="font-semibold w-24">{item.day}:</span>
              <span>{item.suggestion}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
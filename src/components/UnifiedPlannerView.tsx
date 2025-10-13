import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ForecastData, ForecastListItem } from "@/api/types";
import { useCalendarEvents } from "@/hooks/use-calendar";
import type { DailyForecast } from "@/lib/suggestion-engine";
import { getActivitySuggestion } from "@/lib/suggestion-engine";
import { generateSuggestedEventLink, generateCustomEventLink } from "@/lib/calendar-link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "./ui/SignOutButton";
import { RefreshCcw } from 'lucide-react'; // 1. IMPORT THE REFRESH ICON

interface UnifiedPlannerViewProps {
  forecastData: ForecastData;
}

const formatFullDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export const UnifiedPlannerView = ({ forecastData }: UnifiedPlannerViewProps) => {
  const accessToken = localStorage.getItem('google_access_token');
  // 2. GET THE REFETCH FUNCTION and isFetching state from the hook
  const { data: events, isLoading, refetch, isFetching } = useCalendarEvents(accessToken);

  const [customEventTitle, setCustomEventTitle] = useState('');
  const [customEventDate, setCustomEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEventTime, setCustomEventTime] = useState('13:00');

  const dailyForecasts: DailyForecast[] = forecastData.list
    .filter((item: ForecastListItem) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  const combinedItems = dailyForecasts.map(day => {
    const date = new Date(day.dt * 1000).toDateString();
    const eventsForDay = events?.filter((event: any) =>
      new Date(event.start.dateTime || event.start.date).toDateString() === date
    );
    const suggestion = getActivitySuggestion(day);
    return {
      date: day.dt,
      events: eventsForDay || [],
      suggestion: {
        text: suggestion,
        addLink: generateSuggestedEventLink(suggestion, day),
      },
    };
  });

  const handleAddCustomEvent = () => {
    if (!customEventTitle || !customEventDate || !customEventTime) return;
    const dateTimeString = `${customEventDate}T${customEventTime}`;
    const link = generateCustomEventLink(customEventTitle, new Date(dateTimeString));
    window.open(link, '_blank');
    setCustomEventTitle('');
  };

  if (isLoading) return <Card><CardHeader><CardTitle>Loading Planner...</CardTitle></CardHeader></Card>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>🗓️ Personal Planner</CardTitle>
        <div className="flex items-center gap-2">
            {/* 3. ADD THE REFRESH BUTTON */}
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            <SignOutButton />
        </div>
      </CardHeader>
      <CardContent>
        {/* Custom Event Form */}
        <div className="p-4 mb-4 border rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Add a Custom Event</h4>
            <div className="flex flex-wrap gap-2">
                <Input type="text" placeholder="Event title..." className="flex-grow min-w-[150px]" value={customEventTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventTitle(e.target.value)} />
                <Input type="date" className="w-auto" value={customEventDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventDate(e.target.value)} />
                <Input type="time" className="w-auto" value={customEventTime} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventTime(e.target.value)} />
                <Button onClick={handleAddCustomEvent}>Add</Button>
            </div>
        </div>

        {/* Combined Timeline View */}
        <div className="space-y-4">
          {combinedItems.map(item => (
            <div key={item.date}>
              <h4 className="font-bold text-md mb-2">{formatFullDate(item.date)}</h4>
              <ul className="space-y-2 pl-4 border-l-2 border-slate-700">
                {item.events.length === 0 && <li className="text-sm text-muted-foreground italic">No scheduled events.</li>}
                {item.events.map((event: any) => (
                  <li key={event.id} className="text-sm"><strong>{event.summary}</strong></li>
                ))}
                <li className="text-sm text-sky-400 flex items-center justify-between">
                  <span>💡 Suggestion: {item.suggestion.text}</span>
                  <Button asChild variant="ghost" size="sm" className="h-7">
                    <a href={item.suggestion.addLink} target="_blank" rel="noopener noreferrer">
                      + Add to Calendar
                    </a>

                  </Button>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


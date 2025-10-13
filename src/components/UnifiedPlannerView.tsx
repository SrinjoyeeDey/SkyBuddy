import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ForecastData, ForecastListItem } from "@/api/types";
import { useCalendarEvents } from "@/hooks/use-calendar";
import type { DailyForecast } from "@/lib/suggestion-engine";
import { getActivitySuggestion } from "@/lib/suggestion-engine";
import { generateSuggestedEventLink, generateCustomEventLink } from "@/lib/calendar-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { RefreshCcw } from 'lucide-react';

interface UnifiedPlannerViewProps {
  forecastData: ForecastData;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
}

// NEW: A fun, animated floating buddy component
const FloatingBuddy = () => (
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
      <div
        className="absolute top-3 right-20 opacity-20 animate-float pointer-events-none"
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256">
            <path fill="currentColor" d="M128 24a96 96 0 0 0-96 96v88a8 8 0 0 0 16 0v-24h160v24a8 8 0 0 0 16 0v-88a96 96 0 0 0-96-96m-80 96v-8a80 80 0 0 1 160 0v8Zm104 48a12 12 0 1 1-12-12a12 12 0 0 1 12 12m-48 0a12 12 0 1 1-12-12a12 12 0 0 1 12 12"/>
        </svg>
      </div>
    </>
  );

const formatFullDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

const formatEventTime = (dateTimeString: string | undefined): string => {
    if (!dateTimeString) return "All day";
    return new Date(dateTimeString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export const UnifiedPlannerView = ({ forecastData }: UnifiedPlannerViewProps) => {
  const accessToken = localStorage.getItem('google_access_token');
  const { data: events, isLoading, refetch, isFetching } = useCalendarEvents(accessToken);

  const [customEventTitle, setCustomEventTitle] = useState('');
  const [customEventDate, setCustomEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEventTime, setCustomEventTime] = useState('13:00');

  const dailyForecasts: DailyForecast[] = forecastData.list
    .filter((item: ForecastListItem) => item.dt_txt.includes("12:00:00"))
    .slice(0, 5);

  const combinedItems = dailyForecasts.map(day => {
    const date = new Date(day.dt * 1000).toDateString();
    const eventsForDay = events?.filter((event: CalendarEvent) => new Date(event.start.dateTime || event.start.date!).toDateString() === date);
    const suggestion = getActivitySuggestion(day);
    return {
      date: day.dt,
      events: eventsForDay || [],
      suggestion: { text: suggestion, addLink: generateSuggestedEventLink(suggestion, day) },
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
    <Card className="relative overflow-hidden">
      <FloatingBuddy />
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>🗓️ Personal Planner</CardTitle>
            <p className="text-sm text-muted-foreground pt-1">Your go-to buddy to schedule by the weather.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}><RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} /></Button>
            <SignOutButton />
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 mb-4 border border-slate-700 rounded-lg bg-slate-900/50">
            <h4 className="font-semibold text-sm mb-2">Add a Custom Event</h4>
            <div className="flex flex-wrap gap-2">
                <Input type="text" placeholder="Event title..." className="flex-grow min-w-[150px]" value={customEventTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventTitle(e.target.value)} />
                <Input type="date" className="w-auto" value={customEventDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventDate(e.target.value)} />
                <Input type="time" className="w-auto" value={customEventTime} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventTime(e.target.value)} />
                <Button onClick={handleAddCustomEvent}>+ Add</Button>
            </div>
        </div>
        <div className="space-y-4">
          {combinedItems.map(item => (
            <div key={item.date}>
              <h4 className="font-bold text-md mb-2">{formatFullDate(item.date)}</h4>
              <ul className="space-y-2 pl-4 border-l-2 border-slate-700">
                {item.events.length === 0 && <li className="text-sm text-muted-foreground italic">No scheduled events.</li>}
                {item.events.map((event: CalendarEvent) => (
                  <li key={event.id} className="text-sm"><strong>{event.summary}</strong>{event.start.dateTime && (<span className="text-muted-foreground ml-2">({formatEventTime(event.start.dateTime)})</span>)}</li>
                ))}
                <li className="text-sm flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase bg-sky-900/80 text-sky-300 rounded-full px-2 py-1 mr-2">Suggestion</span>
                    <span>{item.suggestion.text}</span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-sky-400 hover:text-sky-300">
                    <a href={item.suggestion.addLink} target="_blank" rel="noopener noreferrer">+ Add to Calendar</a>
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


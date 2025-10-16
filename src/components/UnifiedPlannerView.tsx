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

// Define a simple type for Google Calendar events
type CalendarEvent = {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
    };
};

interface UnifiedPlannerViewProps {
    forecastData: ForecastData;
}

const formatFullDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

const formatEventTime = (dateTimeString: string | undefined): string => {
    if (!dateTimeString) return "All day";
    return new Date(dateTimeString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Color arrays for the daily timeline in light mode
const headerColors = ['text-blue-800', 'text-orange-800', 'text-green-800', 'text-sky-800', 'text-amber-800'];
const borderColors = ['border-blue-300', 'border-orange-300', 'border-green-300', 'border-sky-300', 'border-amber-300'];


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
        const eventsForDay = events?.filter((event: CalendarEvent) =>
            new Date(event.start.dateTime || event.start.date!).toDateString() === date
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
        <Card className="shadow-md border-t-4 border-t-blue-500 dark:border-t-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Personal Planner</CardTitle>
                    <p className="text-sm text-muted-foreground">Your go-to buddy to schedule by the weather.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <SignOutButton />
                </div>
            </CardHeader>
            <CardContent>
                {/* Custom Event Form with a clean, neutral style */}
                <div className="p-4 mb-6 border rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                    <h4 className="font-semibold text-sm mb-2 text-slate-800 dark:text-slate-200">Add a Custom Event</h4>
                    <div className="flex flex-wrap gap-2">
                        <Input type="text" placeholder="Event title..." className="flex-grow min-w-[150px]" value={customEventTitle} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventTitle(e.target.value)} />
                        <Input type="date" className="w-auto" value={customEventDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventDate(e.target.value)} />
                        <Input type="time" className="w-auto" value={customEventTime} onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomEventTime(e.target.value)} />
                        <Button onClick={handleAddCustomEvent} className="bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground">+ Add</Button>
                    </div>
                </div>

                {/* Combined Timeline View with dynamic multi-color styling */}
                <div className="space-y-4">
                    {combinedItems.map((item, index) => (
                        <div key={item.date}>
                            {/* Each day's header gets a different color */}
                            <h4 className={`font-bold text-md mb-2 ${headerColors[index % headerColors.length]} dark:text-slate-100`}>{formatFullDate(item.date)}</h4>
                            {/* Each day's timeline border gets a matching color */}
                            <ul className={`space-y-2 pl-4 border-l-2 ${borderColors[index % borderColors.length]} dark:border-slate-700`}>
                                {item.events.length === 0 && <li className="text-sm text-muted-foreground italic">No scheduled events.</li>}
                                {item.events.map((event: CalendarEvent) => (
                                    <li key={event.id} className="text-sm">
                                        <strong>{event.summary}</strong>
                                        {event.start.dateTime && (
                                            <span className="text-muted-foreground ml-2">({formatEventTime(event.start.dateTime)})</span>
                                        )}
                                    </li>
                                ))}
                                <li className="text-sm flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300">
                                            SUGGESTION
                                        </span>
                                        <span>{item.suggestion.text}</span>
                                    </div>
                                    <Button asChild variant="ghost" size="sm" className="h-7 text-sky-600 dark:text-sky-400">
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


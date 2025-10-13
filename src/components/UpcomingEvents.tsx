// src/components/UpcomingEvents.tsx

import { useCalendarEvents } from '../hooks/use-calendar';
import { SignOutButton } from './ui/SignOutButton';

// A helper to format the time nicely
const formatEventTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export const UpcomingEvents = () => {
  const accessToken = localStorage.getItem('google_access_token');
  const { data: events, isLoading, isError } = useCalendarEvents(accessToken);

  // Helper function to render the content based on state
  const renderContent = () => {
    if (isLoading) {
      return <div>Loading events...</div>;
    }
    if (isError) {
      // This is the message you are currently seeing
      return <div className="text-sm text-red-500">Failed to load events.</div>;
    }
    if (!events || events.length === 0) {
      return <p className="text-sm text-muted-foreground mt-2">No upcoming events in the next 48 hours.</p>;
    }
    return (
      <ul className="space-y-2">
        {events.map((event: any) => (
          <li key={event.id} className="text-sm">
            <strong>{event.summary}</strong> - <span className="text-muted-foreground">{formatEventTime(event.start.dateTime || event.start.date)}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4 bg-card rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">🗓️ Upcoming Events</h3>
        {/* The button is now in the header, so it's always visible */}
        <SignOutButton />
      </div>
      {renderContent()}
    </div>
  );
};
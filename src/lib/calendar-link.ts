// src/lib/calendar-link.ts
import type { DailyForecast } from './suggestion-engine';

// Helper function to format a Date object into the string Google Calendar needs
const formatTimeForGoogle = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

/**
 * Generates a link to add a suggested event to Google Calendar.
 * The event is set for 1 PM on the given day.
 */
export const generateSuggestedEventLink = (suggestion: string, day: DailyForecast): string => {
  const startTime = new Date(day.dt * 1000);
  startTime.setHours(13, 0, 0, 0); // Set event time to 1:00 PM

  const endTime = new Date(startTime.getTime());
  endTime.setHours(startTime.getHours() + 1); // Make it a 1-hour event

  const url = new URL('https://www.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', suggestion);
  url.searchParams.append('dates', `${formatTimeForGoogle(startTime)}/${formatTimeForGoogle(endTime)}`);
  url.searchParams.append('details', `Event suggested by SkyBuddy based on the weather forecast.`);

  return url.toString();
};

/**
 * Generates a link to add a custom event to Google Calendar at a specific time.
 */
export const generateCustomEventLink = (title: string, date: Date): string => {
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const url = new URL('https://www.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', title);
    url.searchParams.append('dates', `${formatTimeForGoogle(startTime)}/${formatTimeForGoogle(endTime)}`);

    return url.toString();
}


// src/hooks/use-calendar.ts
import { useQuery } from '@tanstack/react-query';
import { getCalendarEvents } from '../api/Calendar.ts';

export const useCalendarEvents = (accessToken: string | null) => {
  return useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve([]); // Return empty array if no token
      }
      return getCalendarEvents(accessToken);
    },
    enabled: !!accessToken, // Only run the query if the accessToken exists
    staleTime: 1000 * 60 * 15, // Cache data for 15 minutes
  });
};
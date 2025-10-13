// src/api/calendar.ts
const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export const getCalendarEvents = async (accessToken: string) => {
  const timeMin = new Date().toISOString();
  // Set timeMax to the end of tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  tomorrow.setHours(0, 0, 0, 0);
  const timeMax = tomorrow.toISOString();

  const response = await fetch(
    `${CALENDAR_API_URL}?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    // If token is expired or invalid, remove it
    if (response.status === 401) {
        localStorage.removeItem('google_access_token');
        window.location.reload();
    }
    throw new Error('Failed to fetch calendar events');
  }

  const data = await response.json();
  return data.items || []; // Return an empty array if there are no items
};
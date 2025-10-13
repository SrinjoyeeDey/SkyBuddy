const CALENDAR_API_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export const getCalendarEvents = async (accessToken: string) => {
  const timeMin = new Date().toISOString();

  // Fetch events for the next 5 days to match the planner view
  const fiveDaysFromNow = new Date();
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  const timeMax = fiveDaysFromNow.toISOString();

  const response = await fetch(
    `${CALENDAR_API_URL}?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
        localStorage.removeItem('google_access_token');
        window.location.reload();
    }
    throw new Error('Failed to fetch calendar events');
  }

  const data = await response.json();
  return data.items || [];
};

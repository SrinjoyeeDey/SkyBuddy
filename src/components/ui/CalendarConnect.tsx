// src/components/ui/CalendarConnect.tsx
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './button'; // Assuming you have a reusable Button component

export const CalendarConnect = () => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // Store the token and refresh the page to update the UI
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      window.location.reload();
    },
    // Request permission to read calendar events
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  return (
    <div className="p-4 bg-card rounded-lg text-center">
        <h3 className="font-bold mb-2">Plan Your Day Better</h3>
        <p className="text-sm text-muted-foreground mb-4">Connect your Google Calendar to see upcoming events right here.</p>
        <Button onClick={() => login()}>
         🔗 Connect Google Calendar
        </Button>
    </div>
  );
};
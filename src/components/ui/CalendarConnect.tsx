import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CalendarConnect = () => {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem('google_access_token', tokenResponse.access_token);
      window.location.reload();
    },
    // Requesting permission to write events as well for the "add to calendar" link
    scope: 'https://www.googleapis.com/auth/calendar',
  });

  return (
    <Card className="bg-slate-800/50 border-dashed border-slate-600">
        <CardHeader>
            <CardTitle>🌟 Unlock Your Personal Planner</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
                Let SkyBuddy be your smart assistant! Connect your calendar to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-2 mb-6 text-slate-300">
                <li>See your upcoming events alongside the weather.</li>
                <li>Get smart activity suggestions tailored to the forecast.</li>
                <li>Add suggestions or custom events to your calendar in one click!</li>
            </ul>
            <Button onClick={() => login()} className="w-full bg-sky-600 hover:bg-sky-700">
             🔗 Connect Google Calendar
            </Button>
        </CardContent>
    </Card>
  );
};

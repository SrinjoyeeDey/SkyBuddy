import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./button";
import { useGoogleLogin } from "@react-oauth/google";

export const CalendarConnect = () => {
    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            localStorage.setItem('google_access_token', tokenResponse.access_token);
            window.location.reload();
        },
        scope: 'https://www.googleapis.com/auth/calendar.readonly',
    });

    return (
        // Using the app's primary blue for the top border in light mode
        <Card className="shadow-md border-t-4 border-t-blue-500 dark:border-t-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-yellow-500">✨</span>
                    Unlock Your Personal Planner
                </CardTitle>
                <CardDescription>
                    Let SkyBuddy be your smart assistant! Connect your calendar to:
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="list-disc space-y-2 pl-5 mb-6 text-sm text-muted-foreground">
                    <li>See your upcoming events alongside the weather.</li>
                    <li>Get smart activity suggestions tailored to the forecast.</li>
                    <li>Add suggestions or custom events to your calendar in one click!</li>
                </ul>
                {/* Using the primary blue for the button to match the branding */}
                <Button onClick={() => login()} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-primary dark:hover:bg-primary/90 text-white dark:text-primary-foreground">
                    🔗 Connect Google Calendar
                </Button>
            </CardContent>
        </Card>
    );
};


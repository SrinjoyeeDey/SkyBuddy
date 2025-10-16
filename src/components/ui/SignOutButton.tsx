import { Button } from './button'; // Or your standard button component

export const SignOutButton = () => {
  const handleSignOut = () => {
    // Remove the token from storage
    localStorage.removeItem('google_access_token');
    // Refresh the page to update the UI
    window.location.reload();
  };

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
};
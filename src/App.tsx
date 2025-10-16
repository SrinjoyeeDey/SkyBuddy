import './App.css';
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Layout from './components/layout'
import { ThemeProvider } from './context/theme-provider';
import WeatherDashboard from './pages/weather-dashboard';
import CityPage from './pages/city-page';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner';
import { GoogleOAuthProvider } from '@react-oauth/google';
import PlannerPage from './pages/planner-page';
import { ErrorBoundary } from 'react-error-boundary'; // Make sure this is imported

const queryClient=new QueryClient({
  defaultOptions:{
      queries:{
        staleTime:5*60*1000,
        gcTime:10*60*1000,
        retry:false,
        refetchOnWindowFocus:false,
      }
  }
});

function App(){
  return (
    // The GoogleOAuthProvider must wrap everything that might use it.
    // We also add a non-null assertion (!) because this variable is required.
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme='dark'>
            <Layout>
              <Routes>
                <Route  path='/' element={<WeatherDashboard />}/>
                <Route  path='/city/:cityName' element={<CityPage />}/>
                
                {/*
                  corrected structure.
                  The ErrorBoundary now wraps PlannerPage *inside* the element prop.
                */}
                <Route
                  path='/planner'
                  element={
                    <ErrorBoundary fallback={<div>Something went wrong with the planner. Please try again.</div>}>
                      <PlannerPage />
                    </ErrorBoundary>
                  }
                />
              </Routes>
            </Layout>
            <Toaster richColors/>
          </ThemeProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;


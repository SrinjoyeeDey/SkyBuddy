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
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

      <ThemeProvider defaultTheme='dark'>
        <Layout>
          <Routes>
            <Route  path='/' element={<WeatherDashboard />}/>
            <Route  path='/city/:cityName' element={<CityPage />}/>
            <Route  path='/planner' element={<PlannerPage />}/> {/* 2. Add the new route here */}
          </Routes>
        </Layout>
        <Toaster richColors/>
      </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);
}
export default App;
import './App.css';
import {BrowserRouter,Route,Routes} from 'react-router-dom'
import Layout from './components/layout'

import { ThemeProvider } from './context/theme-provider';
import WeatherDashboard from './pages/weather-dashboard';
import CityPage from './pages/city-page';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner';

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
      <ThemeProvider defaultTheme='dark'>
        <Layout>
          <Routes>
            <Route  path='/' element={<WeatherDashboard />}/>
            <Route  path='/city/:cityName' element={<CityPage />}/>
          </Routes>
        </Layout>
        <Toaster richColors/>
      </ThemeProvider>
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);
}
export default App;
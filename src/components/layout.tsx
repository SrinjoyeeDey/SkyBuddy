import {useEffect, useState, type PropsWithChildren}from 'react'
import Header from './header'
import RainWrapper from './ui/rainWrapper'
import ThunderWrapper from './ui/thunderWrapper'
import SnowWrapper from './ui/snowWrapper'
import CloudWindWrapper from './ui/CloudWindWrapper'
import SunWrapper from './ui/sunWrapper'
import { API_CONFIG } from '@/api/config'

const layout = ({children}:PropsWithChildren) => {
  const [weatherMain, setWeatherMain] = useState<string | null>(null)
  const API_KEY = API_CONFIG.API_KEY

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        )
        const data = await res.json()
        const mainWeather = data?.weather?.[0]?.main
        console.log("Weather[0].main:", mainWeather)
        setWeatherMain(mainWeather)
      } catch (err) {
        console.error("Error fetching weather:", err)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          fetchWeather(latitude, longitude)
        },
        (err) => {
          console.error("Location access denied:", err)
        }
      )
    } else {
      console.error("Geolocation not supported")
    }
  }, [])
  
  const renderWithWrapper = () => {
    if (weatherMain === "Thunderstorm") {
      return <ThunderWrapper>{children}</ThunderWrapper>
    } else if (weatherMain === "Rain" || weatherMain === "Drizzle") {
      return <RainWrapper>{children}</RainWrapper>
    } else if (weatherMain === "Snow") {
      return <SnowWrapper>{children}</SnowWrapper>
    } else if(weatherMain === "Clouds"){
      return <CloudWindWrapper>{children}</CloudWindWrapper>
    }else if(weatherMain === "Atmosphere" || weatherMain === "Clear"){
      return <SunWrapper>{children}</SunWrapper>
    }else{
      return <>{children}</>
    }
  }

  return (
    <div className='bg-gradient-to-br from-background to-muted'>
        <Header getTheme={weatherMain === "Clouds" || "Snow" || "Atmosphere" || "Clear" ? "dark" : "light"}/>

        <main className='min-h-screen'>
          {renderWithWrapper()}
        </main>
      
        <footer className='border-t min-w-screen backdrop-blur py-12 supports-[backdrop-filter]:bg-background/60'>
            <div className="container mx-auto px-4 text-center text-gray-400">
                <p>Made with ❤️ by Srinjoyee Dey</p>
            </div>
        </footer>
    </div>
  )
}

export default layout

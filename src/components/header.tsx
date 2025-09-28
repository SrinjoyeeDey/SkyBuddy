import { useTheme } from "@/context/theme-provider";
import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import CitySearch from "./city-search";

const Header = () => {
    const {theme,setTheme}=useTheme();
    const isDark=theme==='dark';
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur py-2 supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
  {/* Left section: Logo + Name */}
  <Link to="/" className="flex items-center gap-3 w-fit">
    <img 
      src={theme === "dark" ? "/cloud.svg" : "/cloud.svg"} 
      alt="SkyBuddy logo" 
      className="h-16 w-16"
    />
    <h1 
      className="text-2xl font-bold relative top-2 tracking-wide" 
      style={{ fontFamily: 'Pacifico, cursive' }}
    >
      SKYBuddy
    </h1>
  </Link>

      {/* // search */}

      <CitySearch />

      <div onClick={()=>setTheme(isDark?'light':'dark')} 
       className={`flex items-center cursor-pointer transition-transform duration-500
        ${isDark?'rotate-180':'rotate-0'}`
        
       }>
        {isDark?
        (<Sun className="h-6 w-6 text-yellow-500 rotate-0 transition-all" />):(
            <Moon className="h-6 w-6 text-blue-500 rotate-0 transition-all" />
        )}</div>
    </div>
    </header>

    
  )
}

export default Header;

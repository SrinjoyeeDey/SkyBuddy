import { useState } from "react";
import { Button } from "./ui/button";
import { CommandDialog ,CommandList,CommandInput,CommandEmpty,CommandGroup,CommandItem} from "./ui/command";
import { Clock, Loader2, Search, Star, XCircle } from "lucide-react";
import { useLocationSearch } from "@/hooks/use-weather";
import { CommandSeparator } from "cmdk";
import { useNavigate } from "react-router-dom";
import { useSearchHistory } from "@/hooks/use-search-history";
import { format } from "date-fns";
import { useFavorites } from "@/hooks/use-favorite";

const CitySearch = () => {

    const [open,setOpen]=useState(false);
    const [query,setQuery]=useState("");
    const navigate=useNavigate();

    const {data:locations,isLoading}=useLocationSearch(query);
    const {history,clearHistory,addToHistory}=useSearchHistory();
    
  const handleSelect = (cityData: string) => {
    // Defensive: try to extract all fields, fallback to empty string if missing
    const parts = cityData.split("|");
    const lat = parts[0] || "";
    const lon = parts[1] || "";
    const name = parts[2] || "";
    const country = parts[3] || "";

    addToHistory.mutate({
      query,
      name,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      country,
      filter: function (arg0: (item: any) => boolean): unknown {
        throw new Error("Function not implemented.");
      }
    });

    setOpen(false);
    navigate(`/city/${name}?lat=${lat}&lon=${lon}`);
  };

  const {favorites}=useFavorites();


  return (
    <>
    <Button variant='outline' className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
     onClick={()=>setOpen(true)}>
        <Search className="mr-2 h-4 w-4" />
        Search cities... </Button>
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search cities..." value={query} onValueChange={setQuery} />
      <CommandList>{
        query.length>2 && !isLoading &&(
        <CommandEmpty>No cities found.</CommandEmpty>)}

        {/* Removed hardcoded Calendar item from Favorites */}

         {favorites.length > 0 &&(
            <CommandGroup heading="Favorites">

              {favorites.map((location)=>{
        return (<CommandItem key={location.id}
          value={`${location.lat}|${location.lon}|${location.name}|${location.country}`} onSelect={handleSelect}
                    >
                        <Star className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>
                            {location.name}
                        </span>
                        {location.state && (
                            <span className="text-sm text-muted-foreground">
                                ,{location.state}
                            </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                                ,{location.country}
                            </span>
                       
                    </CommandItem>
        )
              })}
              
            </CommandGroup>
            
      )}



        {history.length > 0 &&(
          <>
          <CommandSeparator />
            <CommandGroup>
              <div className="flex items-center justify-between px- my-2">
                <p className="text-xs text-muted-foreground">Recent Searches</p>
                <Button variant='ghost' size='sm' onClick={()=>clearHistory.mutate()}>
                  <XCircle className="h-4 w-4" />Clear
                </Button>
              </div>

              {history.map((location)=>{
        return <CommandItem key={`${location.lat}-${location.lon}`}
          value={`${location.lat}|${location.lon}|${location.name}|${location.country}`} onSelect={handleSelect}
                    >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                            {location.name}
                        </span>
                        {location.state && (
                            <span className="text-sm text-muted-foreground">
                                ,{location.state}
                            </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                                ,{location.country}
                            </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(location.searchedAt,'MMM d, h:mm a')}
                        </span>
                       
                    </CommandItem>
              })}
              
            </CommandGroup>
        </>
      )}

        <CommandSeparator />

        {locations && locations.length>0 && (
        <CommandGroup heading="Suggestions">
            {isLoading && (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            )}{locations.map((location)=>{
        return (
          <CommandItem key={`${location.lat}-${location.lon}`}
          value={`${location.lat}|${location.lon}|${location.name}|${location.country}`} onSelect={handleSelect}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        <span>
                            {location.name}
                        </span>
                        {location.state && (
                            <span className="text-sm text-muted-foreground">
                                ,{location.state}
                            </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                                ,{location.country}
                            </span>
                       
                    </CommandItem>
                );
            })}
        </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>

    </>
  )
}

export default CitySearch;

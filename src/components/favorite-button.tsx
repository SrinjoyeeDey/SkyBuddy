import type { WeatherData } from "@/api/types";
import { useFavorites } from "@/hooks/use-favorite";
import { Button } from "./ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface FavoriteButtonProps {
    data:WeatherData;
}
const FavoriteButton = ({data}:FavoriteButtonProps) => {

    const {addFavorite,isFavorite,removeFavorite}=useFavorites();

    const isCurrentlyFavorite=isFavorite(data.coord.lat,data.coord.lon);

    const handleToggleFavorite=()=>{
        if(isCurrentlyFavorite){
            removeFavorite.mutate(`${data.coord.lat}-${data.coord.lon}`);
            toast.error(`Removed ${data.name} from Favorites`);
        }else{
            addFavorite.mutate({
                name: data.name,
                lat: data.coord.lat,
                lon: data.coord.lon,
                country: data.sys.country,
                addedAt: 0
            });

            toast.success(`Added ${data.name} to Favorites`)
        }
    };

  return (
    <Button variant={isCurrentlyFavorite ? "default" : "outline"}
        size={'icon'} onClick={handleToggleFavorite} className={isCurrentlyFavorite?'bg-yellow-500 hover:bg-yellow-600':""}
    >
        <Star className={`h-4 w-4 ${isCurrentlyFavorite ? "fill-current" : ""}`}/>
    </Button>
  )
}

export default FavoriteButton;

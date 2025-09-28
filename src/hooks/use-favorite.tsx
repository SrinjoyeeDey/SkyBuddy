import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

interface FavoriteCity {
    id:string,
    name:string,
    lat:number,
    lon:number,
    country:string,
    state?:string,
    addedAt:number
}

export function useFavorites(){ //takes key-value pairs
    const [favorites,setFavorites]=useLocalStorage<FavoriteCity[]>("favorites",[]);
    const queryClient = useQueryClient();

    const favoriteQuery=useQuery({
        queryKey: ['favorites'],
        queryFn: () => favorites,
        initialData: favorites,
        staleTime: Infinity //to not get expired and will always present in localstorage
    });

    const addFavorite=useMutation({
        mutationFn:async(city:Omit<FavoriteCity,'id' |'searchedAt'>)=>{
            const newFavorite:FavoriteCity={
                ...city, //we will take whatever provided to us
                id:`${city.lat}-${city.lon}`,
                addedAt:Date.now(),
            };

            // to check whether place we are trying to search is a duplicate and we can keep 10 histories at a time

            const exists= favorites.some((fav)=>fav.id===newFavorite.id); //compares the id

            if(exists) return favorites

            const newFavorites=[...favorites,newFavorite].slice(0,10);

            setFavorites(newFavorites)
            return newFavorites;

        }, //to fetch again or to overwrite the previous data
        onSuccess:()=>{
            queryClient.invalidateQueries({
                queryKey:['favorites'],
            });
        }
    });

    const removeFavorite=useMutation({
        mutationFn:async(cityId:string)=>{
            const newFavorites=favorites.filter((city)=> city.id!==cityId);
            setFavorites(newFavorites)

            return newFavorites;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({
                queryKey:['favorites'],
            });
        }
    });

    return {
        favorites:favoriteQuery.data,
        addFavorite,
        removeFavorite,
        isFavorite:(lat:number,lon:number)=>favorites.some((city)=>city.lat===lat && city.lon===lon)
    }
}

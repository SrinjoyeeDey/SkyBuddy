import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

interface SearchHistoryItem {
    filter(arg0: (item: any) => boolean): unknown;
    id:string,
    query:string,
    lat:number,
    lon:number,
    name:string,
    country:string,
    state?:string,
    searchedAt:number
}

export function useSearchHistory(){ //takes key-value pairs
    const [history,setHistory]=useLocalStorage<SearchHistoryItem[]>("search-history",[]);
    const queryClient = useQueryClient();

    const historyQuery=useQuery({
        queryKey:['search-history'],
        queryFn:()=>history,
        initialData:history,
    });

    const addToHistory=useMutation({
        mutationFn:async(search:Omit<SearchHistoryItem,'id' |'searchedAt'>)=>{
            const newSearch:SearchHistoryItem={
                ...search, //we will tak whatever provided to us
                id:`${search.lat}-${search.lon}-${Date.now()}`, //then create id and searchedAt time
                searchedAt:Date.now(),
            };

            // to check whether place we are trying to search is a duplicate and we can keep 10 histories at a time

            const filterdHistory=history.filter(
                (item) =>!(item.lat===search.lat && item.lon === search.lon)
            );

            const newHistory=[newSearch,...filterdHistory].slice(0,10);

            setHistory(newHistory)
            return newHistory;
        }, //to fetch again or to overwrite the previous data
        onSuccess:(newHistory)=>{
            queryClient.setQueryData(['search-history'],newHistory);
        }
    });

    const clearHistory=useMutation({
        mutationFn:async()=>{
            setHistory([])
            return [];
        },
        onSuccess:(newHistory)=>{
            queryClient.setQueryData(['search-history'],[])
        }
    });

    return {
        history:historyQuery.data??[],addToHistory,clearHistory
    }
}
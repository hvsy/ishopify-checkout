import {useSearchParams} from "react-router-dom";
import {useCallback} from "react";

export function useQueryState(key : string){
    const [search,setSearch] = useSearchParams();
    const setKey = useCallback((value ?: string|null) => {
        const newSearch = new URLSearchParams(search);
        if(value){
            newSearch.set(key,value);
        }else{
            newSearch.delete(key);
        }
        setSearch(newSearch);
    },[key]);
    return [search.get(key),setKey] as const;
}

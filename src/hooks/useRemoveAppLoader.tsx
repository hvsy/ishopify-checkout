import {useEffect} from "react";

export function useRemoveAppLoader(id : string = "__loader__"){
    useEffect(() => {
        document.getElementById(id)?.remove();
    }, []);
}

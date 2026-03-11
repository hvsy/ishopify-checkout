import {useEffect} from "react";

export function useRemoveAppLoader(id : string = "__loader__"){
    useEffect(() => {
        requestAnimationFrame(() => {
            document.getElementById(id)?.remove();
        });
    }, []);
}

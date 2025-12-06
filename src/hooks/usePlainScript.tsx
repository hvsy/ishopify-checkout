import {useEffect, useState} from "react";

export function usePlainScript(id : string,content : string,removeOnUnmount : boolean = false,init_mounted : boolean = true){
    useEffect(() => {
        if(!init_mounted) return;
        let script= document.getElementById(id);
        if(!script){
            script = document.createElement('script') as HTMLScriptElement;
            if(!!id)
            script.id = id;
            /** @ts-ignore */
            script.async = true;
            script.appendChild(document.createTextNode(content));
            document.body.appendChild(script);
        }
        return ()=>{
            if(removeOnUnmount){
                document.body.removeChild(script);
            }
        }
    }, [id,init_mounted]);
}

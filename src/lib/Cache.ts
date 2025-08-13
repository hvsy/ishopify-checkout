import { serialize, SWRGlobalState ,cache} from "swr/_internal";


export const Preloader  = {
    remove(key_ : string){
        const [key, fnArg] = serialize(key_);
        //@ts-ignore
        const [, , , PRELOAD] = SWRGlobalState.get(cache);
        delete PRELOAD[key];
    },
    fetch<T = any>(key_ : string, fetcher : ( arg : any)=>Promise<T>) : Promise<T>{
        const [key, fnArg] = serialize(key_);
        const [, , , PRELOAD] = SWRGlobalState.get(cache);
        // Prevent preload to be called multiple times before used.
        if (PRELOAD[key]) return PRELOAD[key];
        const req = fetcher(fnArg);
        PRELOAD[key] = req;
        // console.log('prefetch:',key,Object.keys(PRELOAD));
        return req;
    },
    replace(key_:string,data : any){
        const [key, fnArg] = serialize(key_);
        //@ts-ignore
        const [, , , PRELOAD] = SWRGlobalState.get(cache);
        // console.log('replace:',key,Object.keys(PRELOAD));
        PRELOAD[key] = Promise.resolve(data);
    }
}

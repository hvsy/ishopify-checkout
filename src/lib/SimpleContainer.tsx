import {createContext, use, useContext} from "react";
import {SWRResponse} from "swr";
import {Outlet, useLoaderData} from "react-router-dom";

export function createSimpleContainer<T>(){
    const context = createContext<T|undefined>(undefined);
    return {
        Context : context,
        Provider : context.Provider,
        use(){
            return use(context);
        },
        useContainer(){
            return useContext(context);
        }
    }
}


export type SWRContainerCallback<T> = (data : any)=>SWRResponse<T>
export type SWRRender<T> = (response : SWRResponse<T>) => React.ReactElement|undefined|string|null;
export function createSWRContainer<T>(callback : SWRContainerCallback<T>,render ?: SWRRender<T>) :{
    Context : React.Context<T|undefined>,
    Provider : <P>(props : {Component ?: any ,children ?: any} & P)=>React.ReactElement|string|null|undefined,
    useContainer : ()=>T|undefined,
    use: ()=>T|undefined,
}{
    const context = createContext<T|undefined>(undefined);
    return {
        Context : context,
        Provider : ({children,Component,...others})=>{
            const response = callback(others);
            const {data} = response;
            if(!data) return render?.(response);
            const ProviderComponent = context.Provider;
            return <ProviderComponent value={data}>
                {Component ? <Component value={data}/>: children}
            </ProviderComponent>
        },
        useContainer(){
            return useContext(context);
        },
        use(){
            return use(context);
        }

    }
}


export function createLoaderContainer<T>(){
    const context = createContext<T|undefined>(undefined);
    return {
        Context : context,
        Provider : ({children} : any)=>{
            const response = useLoaderData() as T;
            const ProviderComponent = context.Provider;
            return <ProviderComponent value={response}>
                {children}
                <Outlet />
            </ProviderComponent>
        },
        useContainer(){
            return useContext(context);
        }

    }
}

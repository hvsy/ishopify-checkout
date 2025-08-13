import {createContext, FC, useActionState} from "react";
import {get as _get} from "lodash-es";
export type SubmitCallback = (data : any,prevState : any)=>Promise<boolean|string>;
export type XFormProps = {
    submit : SubmitCallback,
    children : React.ReactElement;
};
export const XFormContext = createContext<{
    error : (path : string[])=> null | string,
}>({
    error(path : string[]){
        return null;
    }
});
export type XFormState = {
    success ?: boolean,data ?: any,error ?: any
};
export const XForm: FC<XFormProps> = (props) => {
    const {submit,children} = props;
    const [state,action] = useActionState<XFormState|null,any>(async(prevState,formData : any)=>{
        try{
            const after = await submit(prevState,formData);
            return {
                success : true,
                data : after,
            };
        }catch (e : any){
            const status = _get(e, 'response.status');
            if(status === 422){
                const data = _get(e, 'response.data.errors');
                return {
                    success : false,
                    error : data,
                }
            }else{
                if(typeof e.getMessage == 'function'){
                    return {
                        success: false,
                        data : e.getMessage(),
                    }
                }else{
                    return {
                        success : false,
                        data : e,
                    }
                }
            }
        }
    },null);
    const error = (path : string[])=>{
        return _get(state?.error || {},path.join('.'));
    };
    return <XFormContext value={{error}}>
        <form action={action}>
            {children}
        </form>
    </XFormContext>;
};


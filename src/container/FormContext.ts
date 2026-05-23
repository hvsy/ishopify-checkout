import {createSimpleContainer} from "@lib/SimpleContainer.tsx";
import  {FormInstance} from "@rc-component/form";

export const FormContext = createSimpleContainer<{
    form: FormInstance,
    onValuesChanged : (changed : any)=>void;
    setErrors: (errors: any) => void;
    error: (name: string | ((string | number)[])) => {
        validateStatus?: string;
        help?: string;
    }
}>();


export function useCurrentForm() {
    return FormContext.use()?.form!;
}

import {createSimpleContainer} from "@lib/SimpleContainer.tsx";
import  {FormInstance} from "@rc-component/form";

export const FormContext = createSimpleContainer<{
    form: FormInstance,
    /** 用户输入引起的变更（rc-form onValuesChange） */
    onValuesChanged : (changed : any)=>void;
    /** 代码回填引起的变更（preset/IP 国家、自动选省等） */
    onHydratedValues : (changed : any)=>void;
    setErrors: (errors: any) => void;
    error: (name: string | ((string | number)[])) => {
        validateStatus?: string;
        help?: string;
    }
}>();


export function useCurrentForm() {
    return FormContext.use()?.form!;
}

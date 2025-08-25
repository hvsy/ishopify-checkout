import {createSimpleContainer} from "@lib/SimpleContainer.tsx";
import Form, {FormInstance} from "rc-field-form";
import {useEffect} from "react";

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

export function useFormError() {
    return FormContext.use()!.error;
}

export function useFormField() {
    const error = useFormError();
    return (name: string) => {
        return {
            name,
            ...error(name),
        }
    }
}

export type SFV = Parameters<FormInstance['setFieldsValue']>[0];

export function useCheckoutForm<T>(initialValues : SFV) {
    const [form] = Form.useForm<T>();
    useEffect(() => {
        form.setFieldsValue(initialValues);
    }, []);

    return [form];
}

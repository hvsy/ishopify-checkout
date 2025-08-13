import {FC, ReactNode, useCallback, useRef, useState} from "react";
import Form from "rc-field-form";
import {FormContext,} from "../../container/FormContext.ts";
import {isArray as _isArray,get as _get} from "lodash-es";
import {useDebounceCallback} from "usehooks-ts";

export type FormContainerProps = {
    children : ReactNode;
    initialValues ?: any;
    page_style ?: 'standard' | 'single';
};


export const FormContainer: FC<FormContainerProps> = (props) => {
    const {children,initialValues,page_style = 'standard'} = props;
    const [form] = Form.useForm();
    // const checkout = CheckoutContainer.use()!;
    const [formErrors,setFormErrors] = useState<any>({});
    const formErrorRef = useRef(null);
    formErrorRef.current = formErrors;
    const error = useCallback((name: string|((string|number)[])) => {
        const path = _isArray(name) ? name.join('.') : name;
        const errors = _get(formErrorRef.current,path);
        if(errors){
            return {
                validateStatus: 'error' as ("" | "error" | "success" | "warning" | "validating" | undefined),
                help: _isArray(errors) ? (errors as []).join("\n") : errors,
            };
        }
        return {};
    },[])
    const sync = useDebounceCallback(() => {
        const values = form.getFieldsValue();
        //TODO 单页模式同步数据
        // console.log('sync:',values);
    },500);
    return <FormContext.Provider value={{
            form,
            error,
            setErrors : setFormErrors,
        }}>
            <Form form={form} initialValues={initialValues} component={false} onValuesChange={(values) => {
                // console.log('values:',values);
                if(page_style === 'standard') return;
                sync();
            }}>
                <Form.Field name={'email'} preserve={true}><div className={'hidden'}/></Form.Field>
                <Form.Field name={'shipping_line_id'} preserve={true}><div className={'hidden'}/></Form.Field>
                <Form.Field name={'shipping_line'} preserve={true}><div className={'hidden'}/></Form.Field>
                <Form.Field name={'shipping_insurance'} preserve={true}><div className={'hidden'}/></Form.Field>
                {children}
            </Form>
        </FormContext.Provider>;
};

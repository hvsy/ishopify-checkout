import Form from "rc-field-form";
import type { Meta } from 'rc-field-form/lib/interface';
import useState from 'rc-util/lib/hooks/useState';
import {isArray as _isArray} from "lodash-es";


const FormField = Form.Field;

import {FieldProps} from "rc-field-form/es/Field";
import {cloneElement, FC, } from "react";
import {isFunction as _isFunction} from "lodash-es";

export type FormItemProps = Omit<FieldProps,'children'> & {
    help ?: string;
    validateStatus ?: any;
    children : React.ReactElement<{warnings ?: string[],errors ?: string[],name ?: string}>;
};
function genEmptyMeta(): Meta {
    return {
        errors: [] as string[],
        warnings: [] as string[],
        touched: false,
        validating: false,
        name: [],
        validated: false,
    };
}
export const FormItem: FC<FormItemProps> = (props) => {
    const {children,name,help,validateStatus} = props;
    const [meta,setMeta] = useState(()=>genEmptyMeta());
    if(!children) return null;
    let full= _isArray(name) ? name.join('][') : name;
    // const warnings  = [...meta.warnings];
    // const errors = [...meta.errors];
    // if(!!help && validateStatus){
    //     if(validateStatus === 'error'){
    //         errors.push(help);
    //     }else if(validateStatus === 'warning'){
    //         warnings.push(help);
    //     }
    // }

    const path = `[${full}]`;
    return <FormField name={name} {...props} onMetaChange={(nextMeta: Meta & { destroy?: boolean }) => {
        setMeta(nextMeta.destroy ? genEmptyMeta() : nextMeta, true);
    }}>
        {_isFunction(children) ? children :(typeof children?.type === 'string' ? cloneElement(children,{name : path}) :cloneElement(children,{
            ...meta,
            name : path,
        }))}
    </FormField>;
};

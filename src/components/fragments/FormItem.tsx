import Form from "@rc-component/form";
import {isArray as _isArray} from "lodash-es";
import {cloneElement, FC,} from "react";
import useState from '@rc-component/util/lib/hooks/useState';
import {isFunction as _isFunction} from "lodash-es";
import {FieldProps} from "@rc-component/form/es/Field";
import {Meta} from "@rc-component/form/es/interface";


const FormField = Form.Field;


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

import Form from "rc-field-form";
import type { Meta } from 'rc-field-form/lib/interface';
import useState from 'rc-util/lib/hooks/useState';


const FormField = Form.Field;

import {FieldProps} from "rc-field-form/es/Field";
import {cloneElement, FC, } from "react";
import {isFunction as _isFunction} from "lodash-es";

export type FormItemProps = Omit<FieldProps,'children'> & {
    children : React.ReactElement<{warnings ?: string[],errors ?: string[]}>;
};
function genEmptyMeta(): Meta {
    return {
        errors: [],
        warnings: [],
        touched: false,
        validating: false,
        name: [],
        validated: false,
    };
}
export const FormItem: FC<FormItemProps> = (props) => {
    const {children} = props;
    const [meta,setMeta] = useState(()=>genEmptyMeta());
    if(!children) return null;
    return <FormField {...props} onMetaChange={(nextMeta: Meta & { destroy?: boolean }) => {
        setMeta(nextMeta.destroy ? genEmptyMeta() : nextMeta, true);
    }}>
        {_isFunction(children) ? children :cloneElement(children,{
            warnings: meta.warnings,
            errors : meta.errors,
        })}
    </FormField>;
};

import {FC} from "react";
import {ChevronDown} from "lucide-react";
import {FloatLabel, FloatLabelProps} from "./FloatLabel";

export type SelectorProps = FloatLabelProps & {
    format ?: (value : any)=>any
};

export const Selector: FC<SelectorProps> = (props) => {
    const {children,value,format,onChange,...others} = props;
    return <FloatLabel element={'select'} {...others}
                   value={value ? value + '' : value} onChange={(e) => {
        const v = e?.target?.value || e;
        onChange?.(format ? format(v + '') : v);
    }}
                       suffix={<ChevronDown className={''}/>}
                       suffixClassName={'pointer-events-none absolute right-0 top-0 bottom-0'}>
        {children}
    </FloatLabel>
};

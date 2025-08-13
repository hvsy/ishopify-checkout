import {FC} from "react";
import {useFormField} from "../../../../container/FormContext.ts";
import {FormItem} from "@components/fragments/FormItem.tsx";
import {NoShippingMethod} from "../Steps/ShippingMethodStep/NoShippingMethod.tsx";
import {ShippingList} from "../Steps/ShippingMethodStep/ShippingList.tsx";

export type ShippingLinesProps = {
    lines ?: DB.ShippingLine[];
};


export const ShippingLines: FC<ShippingLinesProps> = (props) => {
    const {lines} = props;
    const field = useFormField();
    const empty = !!(lines?.length);
    return <FormItem {...field('shipping_line_id')} rules={[{
        required : true,
        message :  "must select a shipping method"
    }]} preserve={true}>
        {empty ? <ShippingList lines={lines}/> : <NoShippingMethod />}
    </FormItem>;
};

import {FC, ReactNode} from "react";
import Form from "rc-field-form";
import {Check} from "../../page/components/Check.tsx";
import {Price} from "../fragments/Price.tsx";
import {Tooltip} from "../fragments/Tooltip.tsx";
import {CircleHelp} from "lucide-react";

export type InsuranceFrameProps = {
    children ?: ReactNode;
};

export const InsuranceFrame: FC<InsuranceFrameProps> = (props) => {
    const {children} = props;
    return <div className={'flex flex-row space-x-2 items-center'}>
        <Form.Field name={['shipping_insurance']}>
            <Check id={"shipping_insurance"}/>
        </Form.Field>
        <label htmlFor={'shipping_insurance'}
               className={'select-none flex flex-row items-center space-x-2'}>
                <span>
                    Add Shipping Insurance to your order
                </span>
            <div className={'text-sm font-bold'}>
                {children}
            </div>
            <Tooltip icon={<CircleHelp className={'size-4'}/>}>
                <div className={'text-wrap flex flex-col'}>
                            <span>
                                Shipping insurance offers premium protection and safety for your valuable items during
                                international shipping.
                            </span>
                    <span>
                                We'll reship your package immediately at no extra charge if it's reported lost or damaged.
                            </span>
                </div>
            </Tooltip>
        </label>
    </div>;
};

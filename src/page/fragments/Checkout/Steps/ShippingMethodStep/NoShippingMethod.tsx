import {FC, useEffect} from "react";

export type NoShippingMethodProps = {
    value ?: any,onChange ?: (value : any)=>void;
};

export const NoShippingMethod: FC<NoShippingMethodProps> = (props) => {
    const {value,onChange} = props;
    useEffect(() => {
        if(!!value){
            //如果api接口没有拿到配送方式,则设置配送方式为null
           onChange?.(null);
        }
    }, [value,onChange]);
    return <div className={'rounded py-10 w-full flex flex-col items-center space-y-6 justify-center border border-gray-300'}>
        <img src={"https://static.cdn.ispfaster.com/liquid/buyer/public/img/shippingMethods.png"} />
        <div className={'px-2 text-center'}>
            There are no shipping methods available for your cart or destination.
        </div>
    </div>;
};

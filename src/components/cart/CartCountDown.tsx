import {FC} from "react";
import {CountDown} from "../fragments/CountDown.tsx";
import {Timer} from "lucide-react";

export type CartCountDownProps = {
    show ?: boolean;
    time ?: number;
};

export const CartCountDown: FC<CartCountDownProps> = (props) => {
    const {show,time} = props;
    if(!show) return null;
    return <CountDown name={'checkout_'}
                      prefix={<div className={'flex flex-row items-center space-x-1'}>
                          <Timer size={16}/>
                          <div>Your order is reserved for</div>
                      </div>}
                      suffix={"minutes!"}
                      auto
                      containerClassName={`text-sm md:text-base`}
                      milliseconds={time! * 60 * 1000}
                      format={'mm:ss.S'}
                      expired={<div className={`text-red-500`}>Your cart is expiring soon !</div>}

    /> ;
};

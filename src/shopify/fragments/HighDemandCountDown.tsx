import {FC} from "react";
import {CountDown} from "@components/fragments/CountDown.tsx";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export type HighDemandCountDownProps = {};

export const HighDemandCountDown: FC<HighDemandCountDownProps> = (props) => {
    const {} = props;
    const cart = useCartStorage();
    return <div className={'flex flex-col space-y-2'}>
        <div className="flex flex-row items-center space-x-2 text-gray-700"><span
            className="text-sm font-bold px-[8px] py-[10px] text-[#333333]">🔥 An item you ordered is in high demand. No worries, we have reserved your order.</span>
        </div>
        <div
            className="bg-[#fff5d2] border border-[#fac444] rounded-[5px] box-border py-[10px] px-[20px] text-sm font-[600] flex flex-row items-center !mt-[8px] !mb-[20px] countDown">
            <span className="text-[#333333]">Your order is reserved for</span>
            <div className="flex flex-row items-stretch space-x-2 select-none text-gray-800">
                <div
                    className="select-none rounded-md px-2 tracking-wider bg-transparent text-[#333333] font-[600] text-sm font-[ui-sans-serif]">
                    <CountDown milliseconds={10*60*1000} name={`high-demand-${cart.gid}`} auto={true} loop={true}/>
                </div>
            </div>
        </div>
    </div>;
};

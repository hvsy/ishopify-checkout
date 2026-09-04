import {FC, ReactNode, useEffect} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@components/ui/dialog.tsx";
import {CountDown} from "@components/fragments/CountDown.tsx";
import {getJsonFromMeta} from "@lib/metaHelper.ts";

export type CreditCardFailedDiscountProps = {open ?: boolean,
    onOpenChange : (status : boolean)=>void;
    discount ?: ReactNode;
    button ?: ReactNode;
    children ?: ReactNode;
};

const Expired  :FC<any> = (props) => {
    useEffect(()=>{
       props?.onCallback();
    },[]);
    return null;
};
const RecallDiscount = getJsonFromMeta('credit_card') as any;
export const CreditCardFailedDiscount: FC<CreditCardFailedDiscountProps> = (props) => {
    const {open,onOpenChange,discount,button,children} = props;
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            className="max-w-[460px] rounded-2xl p-0 overflow-hidden"
            onPointerDownOutside={(e) => {
                // 禁止点击遮罩层/外部区域关闭（只允许点右上角 X 关闭）
                e.preventDefault();
            }}
            onInteractOutside={(e) => {
                // 兜底：禁止外部交互触发关闭
                e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
                // 禁止 ESC 关闭（只允许点右上角 X 关闭）
                e.preventDefault();
            }}
        >
            <DialogHeader className="space-y-4 px-6 pt-8 pb-6">
                <DialogTitle className="border-b-0 px-0 py-0 text-center text-[28px] font-semibold leading-8">
                    Credit Card System Error
                </DialogTitle>
                <DialogDescription className="text-center text-[16px] leading-6 text-[#4b5563]">
                    We recommend completing your order with
                    PayPal now to enjoy an <span className="font-semibold text-[#e11d48]">{discount}</span> discount.
                </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-8 flex flex-col items-stretch">
                <div className="mb-5 rounded-2xl border border-[#fecdd3] bg-gradient-to-r from-[#fff1f2] via-[#fff7ed] to-[#fff1f2] px-4 py-4 text-center shadow-[0_10px_30px_rgba(244,63,94,0.10)]">
                    <div className="inline-flex items-center rounded-full bg-[#e11d48] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                        Hurry up
                    </div>
                    <div className="mt-3 text-sm font-medium uppercase tracking-[0.14em]">
                        <span>Limited-time PayPal </span>
                        <span className="font-semibold text-[#e11d48] text-[14px]">{discount}</span>
                        <span> discount ends in</span>
                    </div>
                    <div className="mt-2 font-mono text-[32px] font-bold leading-8 tracking-[0.08em] text-[#111827]">
                        <CountDown milliseconds={1000 * (RecallDiscount?.failed?.countdown || 60)} name={'recall'}
                                   expired={<Expired onCallback={() => {
                                       onOpenChange?.(false);
                                   }}/>}
                                   format={'mm:ss'}
                                   auto={true}
                                   containerClassName={'bg-transparent justify-center'}
                                   className={'bg-transparent text-black'}
                        />
                    </div>
                </div>
                {children}
                {button}
            </div>
        </DialogContent>
    </Dialog>;
};

import {FC} from "react";
import {CouponFormFrame} from "@components/frames/CouponFormFrame.tsx";

export type ShopifyCouponFormProps = {
    codes: string[];
    apply: (code: string) => Promise<void>;
    remove: (code: string) => Promise<void>;
};

/**
 * 纯表单 UI：折扣码的业务逻辑（数据流 + bus 监听 + URL 自动应用）已上移到
 * useDiscountCodeManager，在 RightFrame 外层调用，本组件只负责渲染与调用动作。
 */
export const ShopifyCouponForm: FC<ShopifyCouponFormProps> = ({codes, apply, remove}) => {
    return <CouponFormFrame
        discounts={codes.map((code: string) => ({code}))}
        onClick={apply}
        onRemove={remove}
    />;
};

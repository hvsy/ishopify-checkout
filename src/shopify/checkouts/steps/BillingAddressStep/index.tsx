import {FC, useEffect, useState} from "react";
import {useWatch} from "@rc-component/form";
import {Checkbox} from "@components/ui/checkbox.tsx";
import {BillAddress} from "./BillAddress.tsx";
import {BILLING_BACKUP_KEY, BILLING_CHECKED_KEY, pickBillingValues} from "./billingFields.ts";
import {getJsonFromMeta} from "@lib/metaHelper.ts";
import {useCurrentForm} from "../../../../container/FormContext.ts";
import {billingToForm} from "../../../sync/domains.ts";

export type BillingAddressStepProps = {};

export const BillingAddressStep: FC<BillingAddressStepProps> = (props) => {
    const {} = props;
    const form = useCurrentForm();
    // 镜像里已经存了账单地址 → 默认展开并显示它（否则用户看到的"与收货地址相同"是假的）；
    // 用户自己切换过复选框时以 store 里记的为准 —— 组件重挂载（切换支付方式）后不能把用户的选择丢掉
    const mirrorBilling = getJsonFromMeta('sync_mirror')?.billing_address;
    const savedChecked = form.getFieldValue(BILLING_CHECKED_KEY);
    const [sameWithShippingAddress, setSameWithShippingAddress] =
        useState<boolean>(() => typeof savedChecked === 'boolean' ? savedChecked : !mirrorBilling);
    const shipping = useWatch(['shipping_address'], form);

    /**
     * 勾选期间：表单里的 billing_address 必须始终是 shipping 的实时拷贝。
     *
     * 下单链路会把 billing_address 当账单地址用（镜像那一列会被 Transaction::toOrder()
     * 直接当成订单账单地址），所以勾选状态下不能留着旧账单。
     *
     * 必须放在 effect 里、不能写在 onCheckedChange 里：BillAddress 卸载时它的 Form.Field
     * （AddressForm 默认 preserve=false）会把 store 里的 billing_address.* 删掉
     * （@rc-component/form es/hooks/useForm.js unregisterField），写在 handler 里的值会被冲掉。
     */
    useEffect(() => {
        if (!sameWithShippingAddress) return;
        // 空拷贝写 null 而不是 {}：billingOfForm({}) 会算出"全空但真值"的投影，
        // 一次 PUT 就会把库里已存的账单覆盖成空值（且 billingToForm 回填不回来）
        form.setFieldValue('billing_address', pickBillingValues(shipping));
    }, [sameWithShippingAddress, shipping, form]);

    /**
     * 取消勾选：把用户自己填过的账单还回去；没有就给镜像里存过的账单，再不行给 shipping 的拷贝。
     *
     * 用户的账单存在 **store 的 `BILLING_BACKUP_KEY`** 里，不是组件内的 ref：
     * 切换支付方式会让 BillingAddressStep 卸载重挂载（Payment.tsx 只在 credit-card 时渲染它），
     * ref 会丢、而重挂载后又默认回到"勾选"状态，于是用户填的值会被勾选态的拷贝覆盖掉（实测复现）。
     * rc-form 的表单实例挂在 FormContainer 上，不随本组件重挂载销毁，所以备份和复选框选择都放它里面。
     *
     * 依赖里**不能**放 shipping：否则取消勾选后用户改收货地址会把账单一起改掉。
     */
    useEffect(() => {
        if (sameWithShippingAddress) return;
        const backup = pickBillingValues(form.getFieldValue(BILLING_BACKUP_KEY));
        const mirror = billingToForm(getJsonFromMeta('sync_mirror')?.billing_address);
        const copy = pickBillingValues(form.getFieldValue(['shipping_address']));
        form.setFieldValue('billing_address', backup || mirror || copy || null);
    }, [sameWithShippingAddress, form]);

    return <div className={'flex flex-col items-stretch justify-start'}>
        <div className={'flex flex-row space-x-2 items-center cursor-pointer px-3 pb-3'}>
            <Checkbox className={'size-5'} checked={sameWithShippingAddress}
                      id={'same_shipping_address'}
                      onCheckedChange={(e) => {
                          const next = e !== false;
                          if (next) {
                              // 勾选前先把用户填的账单备份到 store（重挂载也不丢）
                              form.setFieldValue(BILLING_BACKUP_KEY, pickBillingValues(form.getFieldValue('billing_address')));
                          }
                          form.setFieldValue(BILLING_CHECKED_KEY, next);
                          setSameWithShippingAddress(next);
                      }}
            />
            <label htmlFor={'same_shipping_address'} className={'select-none cursor-pointer'}>
                Use shipping address as billing address
            </label>
        </div>
        {!sameWithShippingAddress && <BillAddress/>}
    </div>;
};

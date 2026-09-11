import {FC, useEffect} from "react";
import {AddressForm} from "../../../../page/fragments/Checkout/forms/AddressForm.tsx";
import {useCurrentForm} from "../../../../container/FormContext.ts";
import {useAllZones} from "../../../../container/PaymentContext.tsx";
import {billingToForm} from "../../../sync/domains.ts";
import {getJsonFromMeta} from "@lib/metaHelper.ts";
import {pickBillingValues} from "./billingFields.ts";

export type BillAddressProps = {};

export const BillAddress: FC<BillAddressProps> = (props) => {
    const {} = props;
    const form = useCurrentForm();
    useEffect(() => {
        // 表单里已经有账单地址（首屏从镜像回填 / 用户自己填过）就不要动它。
        // 用"有没有非空值"判断，不能用键数：卸载后 store 里可能留下 {city:'', …} 的空壳
        if (pickBillingValues(form.getFieldValue('billing_address'))) return;
        // 优先恢复镜像里已保存的账单，没有才用收货地址兜底
        const mirror = billingToForm(getJsonFromMeta('sync_mirror')?.billing_address);
        const copy = pickBillingValues(form.getFieldValue(['shipping_address']));
        // 空值写 null 而不是 {}：billingOfForm({}) 会算出"全空但真值"的投影，
        // 一次 PUT 就会把库里已存的账单覆盖成空值（且 billingToForm 回填不回来）
        form.setFieldValue('billing_address', mirror || copy || null);
    }, []);
    const {zones,loading} = useAllZones();
    return <div className={'flex flex-col items-stretch px-3 pb-4'}>
        {/* preserve：账单表单会在勾选"与收货地址相同"时被卸载，AddressForm 的字段默认
            preserve=false，rc-form 的 unregister 会把非 preserve 字段（first/last/line1/
            line2/city/zip）的 store 值删掉；真实键盘输入还会触发 Google 地址补全这类异步
            后续提交，导致"再挂载一次"的时机不确定 —— 打开 preserve 后这类清值不再发生，
            取消勾选恢复用户原值才能稳定生效（B-2）。 */}
        <AddressForm title={'Billing'}
                     zones={zones}
                     loading={loading}
                     hidden_fields={['phone',]}
                     preserve={true}
                     prefix={['billing_address']}></AddressForm>
    </div>;
};

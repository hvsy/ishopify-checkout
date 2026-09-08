import React, {FC,} from "react";
import {Input} from "../../../components/Input.tsx";

import {FormItem} from "@components/fragments/FormItem.tsx";
import {Skeleton} from "@components/ui/Skeleton.tsx";

export type ContactInformationFormProps = {
    loading ?: boolean;
};
import {StepBlock} from "@components/frames/StepBlock.tsx";
import Validators from "validator";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useCheckoutSyncManager} from "../../../../shopify/sync/CheckoutSyncContext.tsx";
import {useCurrentForm} from "../../../../container/FormContext.ts";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";
import {useCart} from "@hooks/useCart.ts";
import {get as _get} from "lodash-es";

const isValidEmail = (value : any) => !!value && Validators.isEmail(String(value), {
    allow_utf8_local_part : false,
});

export const ContactInformationForm: FC<ContactInformationFormProps> = (props) => {
    const {loading = false} = props;
    const form =  useCurrentForm();
    const checkoutSync = useCheckoutSync(form);
    const syncManager = useCheckoutSyncManager();
    const cartCache = useCartCache();
    const {gid} = useCart();
    // 已经有合法邮箱（来自镜像 / preset / PayPal 带回）时不再自动聚焦：
    // 否则页面一加载就 focus→autofill→blur，白跑一次 identity 同步。
    const autoFocus = !isValidEmail(form.getFieldValue('email'));
    return <StepBlock label={"Contact Information"} name={'contact-information'}>
        {loading ? <Skeleton className={'h-[49px] w-full rounded-lg'}/> : <FormItem name={['email']} rules={[{
            async validator(rule, value) {
                if(!value || !Validators.isEmail(value,{
                    allow_utf8_local_part : false,
                })){
                    throw new Error("Please enter a valid email");
                }
                // if (!EmailRegex.test(value)) {
                //     throw new Error("Please enter a valid email");
                // }
            }
        }]}>
            <Input id={'email'} placeholder={'Email (For order confirmation)'}
                   type={'email'}
                   className={'overflow-hidden'}
                   onBlur={(event) => {
                       const email = form.getFieldValue('email');
                       if(!isValidEmail(email)) return;
                       if (syncManager) {
                           // 购物车里已经是同一个邮箱（自动填充 / PayPal 带回的地址），
                           // 且 PHP 镜像里也是它，才没有差异要写，跳过这次空转 cycle。
                           // 注意：只看 cart 不够——cart 有邮箱但镜像没有时（PayPal 带回、
                           // 上次 PUT 失败、换设备）必须补发一次，否则弃单邮件拿不到邮箱（P2-2）。
                           // 这个短路只对 manager 生效——老路径的 checkoutSync(true,false)
                           // 是唯一会把 email 送进 PHP 镜像的调用，短路它会丢弃单邮箱。
                           const normalized = String(email).trim().toLowerCase();
                           const remote = String(_get(cartCache(gid), 'cart.buyerIdentity.email', '') || '').trim().toLowerCase();
                           if (remote && remote === normalized && syncManager.mirrorEmailMatches(normalized)) return;
                           // 弃单需要 email 尽快落库：identity intent，交给 manager 去重 + CAS
                           syncManager.request('identity');
                           return;
                       }
                       return checkoutSync(true,false);
                   }}
                   tabIndex={0}
                   autoFocus={autoFocus}
                   autoComplete={'shipping email'}
            />
        </FormItem>}
    </StepBlock>
};

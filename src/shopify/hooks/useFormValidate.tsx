import {useCurrentForm} from "../../container/FormContext.ts";
import {useCheckoutSync} from "@hooks/useCheckoutSync.ts";
import {useCheckoutSyncManager} from "../sync/CheckoutSyncContext.tsx";
import {isCartReady} from "../sync/domains.ts";
import {
    CheckoutInput,
    map2,
    useMutationCheckout,
    useShopifyCheckoutLoading
} from "../context/ShopifyCheckoutContext.tsx";
import {useRef} from "react";
import {scrollToError} from "@components/frames/FormContainer.tsx";
import {get as _get, isArray, isEmpty, isEqual, isObjectLike, uniq} from "lodash-es";
import {produce} from "@lib/api.ts";
import {useCart} from "@hooks/useCart.ts";
import {FormInstance} from "@rc-component/form";
import {buildAddress} from "@lib/buildAddress.ts";
import {useSummary} from "../checkouts/hooks/useSummary.tsx";
import {Features} from "@lib/flags.ts";
import {PhoneOnlyRequired} from "../lib/globalSettings.ts";
import {usePaymentContext} from "../../container/PaymentContext.tsx";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";

function formatFormValues(values : any,validate_phone : boolean = true){
    const address = buildAddress(values?.shipping_address || {},validate_phone);
    const input : CheckoutInput =  map2(values,{
        email : 'email',
        deliveryHandle : 'shipping_line_id',
        deliveryGroupId : 'shipping_group_id',
    });
    input.shipping_address = address;
    return input;
}

const AutoFillSuggestCode = Features.includes('auto-fill-suggest-zip');
async function submit(form : FormInstance,validate_phone : boolean = true,suggestZipCode ?: string){
    if(form.isFieldsValidating(['email'])){
        throw ({
            "errorFields" : [
                {
                    name : ["email"]
                }
            ]
        });
    }
    try{
        if(AutoFillSuggestCode){
            if(!!suggestZipCode){
                const saz = form.getFieldValue(['shipping_address','zip']);
                const set = [];
                if(!saz){
                    set.push({
                        name : ['shipping_address','zip'],
                        value : suggestZipCode,
                    })
                }
                const ba = form.getFieldValue(['billing_address']);
                if(!!ba && !ba.zip){
                    set.push({
                        name : ['billing_address','zip'],
                        value : suggestZipCode,
                    })
                }
                if(set.length > 0){
                    form.setFields(set);
                }
            }
        }
        const values =  await form.validateFields();
        import.meta.env.DEV && console.log('form validate values:',values);
        return formatFormValues(values,validate_phone);
    }catch(e){
        import.meta.env.DEV &&  console.log('after validate:',e);
        throw e;
    }
}
const isPhone2 = Features.includes('phone2');
export function useFormValidate(form : FormInstance) {
    // const form = useCurrentForm();
    const sync = useCheckoutSync();
    const syncManager = useCheckoutSyncManager();
    const mutation = useMutationCheckout();
    const cart = useCart();
    const cartCache = useCartCache();
    const last = useRef<any>(null);
    const {loading,groups,refetchDeliveryGroup} = useSummary();
    const checkoutLoading = useShopifyCheckoutLoading();
    const pctx = usePaymentContext();
    return async (keepBuyerCountryCode  : boolean = false) => {
        try {
            const values = await submit(form,true,pctx?.suggestZipCode);
            values.validationStrategy = PhoneOnlyRequired() ? 'COUNTRY_CODE_ONLY' :'STRICT';
            let response : any = null;
            let data : any = null;
            let billing_address : any = null;
            if (syncManager) {
                // 支付点击 = flush：只补发"表单有、远端没有"的域（identity / address / discount），
                // 永远不写快递方式；没有差异时零请求。
                const result = await syncManager.flush('flush', {keepBuyerCountryCode});
                // P1-6：mutation 抛错被 manager 收进 result.error（老路径会冒泡到外层 catch 中止支付）。
                // 这里必须同样中止——否则用户的新地址/邮箱根本没写进 Shopify，却照样扣款。
                if (result.error || result.skipped === 'mutation-dropped' || result.skipped === 'checkout-missing') {
                    produce(cart.token, 'sync_blocked', {
                        reason : result.skipped || 'mutation-error',
                        error : result.error || null,
                        context : form.getFieldValue('context') || null,
                    }).catch(() => undefined);
                    alert('We could not update your checkout. Please try again.');
                    throw new Error('checkout sync failed: ' + (result.error || result.skipped));
                }
                response = {
                    userErrors : result.userErrors,
                    warnings : result.warnings,
                    cart : result.cart,
                };
                data = result.cart;
                billing_address = result.billing_address;
            } else {
                const needMutate = !last.current || !isEqual(last.current, values);
                import.meta.env.DEV && console.log('need update remote checkout');
                if (needMutate) {
                    response = await mutation(values, false,false,keepBuyerCountryCode);
                    import.meta.env.DEV && console.log('mutate response', response);
                }
                const synced : any = (await sync()) || {};
                data = synced.request;
                billing_address = _get(data, 'billing_address', null);
            }
            // 统一兜底：支付路径的 summary 必须是一份"完整"的 cart（id + lines + deliveryGroups），
            // 否则 shopify_payment 要么在 id.replace 上崩，要么读不到快递方式（P2-12）。
            // @defer 的 deliveryGroups 可能晚到，先等一小会儿再判定，避免误报。
            if (!isCartReady(data)) {
                const deadline = Date.now() + 2000;
                while (!isCartReady(data) && Date.now() < deadline) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                    const cached = _get(cartCache(cart.gid), 'cart') || null;
                    if (isCartReady(cached)) data = cached;
                }
            }
            // 等不到完整快照就明确失败，绝不把残缺 cart 硬塞给支付（P2-12）
            if (!isCartReady(data)) {
                produce(cart.token, 'sync_blocked', {
                    reason : 'cart-not-ready',
                    context : form.getFieldValue('context') || null,
                }).catch(() => undefined);
                alert('Your cart is not ready yet. Please refresh the page and try again.');
                throw new Error('checkout cart not ready');
            }
            // ---- 把 Shopify 返回的 userErrors 映射回表单字段 ----
            {
                const errors = _get(response, 'userErrors', []) || [];
                const fields = (errors).map((error: any) => {
                    let {field, code, message} = error || {};
                    if (!isEmpty(field) && isArray(field)) {
                        const path = field.join('.');
                        const maps: any = {
                            'buyerIdentity.email': {
                                path: ['email'],
                                callback(msg: string, res: any, vs: any) {
                                    let ms = msg === 'Email is invalid' ? 'is invalid' : msg;
                                    return {
                                        errors: [vs.email + ' ' + ms],
                                        value: _get(res, 'cart.buyerIdentity.email')
                                    }
                                },
                            },
                            'addresses.0.address.deliveryAddress.firstName': {
                                path: ['shipping_address', 'first_name'],
                            },
                            'addresses.0.address.deliveryAddress.lastName': {
                                path: ['shipping_address', 'last_name'],
                            },
                            'addresses.0.address.deliveryAddress.address1': {
                                path: ['shipping_address', 'line1'],
                            },
                            'addresses.0.address.deliveryAddress.address2': {
                                path: ['shipping_address', 'line2'],
                            },
                            'addresses.0.address.deliveryAddress.city': {
                                path: ['shipping_address', 'city'],
                            },
                            'addresses.0.address.deliveryAddress.countryCode': {
                                path: ['shipping_address', 'region_code'],
                            },
                            'addresses.0.address.deliveryAddress.provinceCode': {
                                path: ['shipping_address', 'state_code'],
                            },
                            'addresses.0.address.deliveryAddress.phone': {
                                path: ['shipping_address', isPhone2 ? 'phone2' : 'phone'],
                            },
                            'addresses.0.address.deliveryAddress.zip': {
                                path: ['shipping_address', 'zip'],
                            }
                        };
                        const hit = maps[path] || false;
                        if (hit) {
                            const after = hit.callback ? hit.callback(message, response, values) : {};
                            return {
                                name: hit.path,
                                validated: true,
                                validating: false,
                                errors: [message],
                                ...after,
                            }
                        }
                    }
                    return null;
                }).filter(Boolean);

                if (fields.length > 0) {
                    form.setFields(fields);
                }
                if (errors.length > 0 || fields.length > 0) {
                    produce(cart.token,"shopify_validate",{
                        errors,fields,values,
                        context : form.getFieldValue('context'),
                        summary_loading : loading.summary,
                        shipping_methods_loading : loading?.shipping_methods,
                        checkout_loading : checkoutLoading,
                        shipping_methods : _get(groups,'0.deliveryOptions',null),
                    }).catch();
                    try {
                        scrollToError({
                            errorFields: fields,
                        });
                    } catch (e) {
                    }
                    return false;
                }
            }
            if (!syncManager) {
                last.current = {
                    ...values,
                };
            }
            return {
                values: {
                    ...values,
                    billing_address : billing_address || _get(data, 'billing_address', null) || null,
                },
                data,
            };
        } catch (e : any) {
            if(isObjectLike(e) && e.hasOwnProperty('errorFields')){
                let forceUpdateShippingLine = false;
                let options = _get(groups,'0.deliveryOptions',null);
                let needForce = !loading.summary && !loading?.shipping_methods && !checkoutLoading &&
                    isEmpty(options);
                const errorLength = e.errorFields.length;
                const errorName = (e.errorFields?.[0]?.name||[]).join('.');
                if(errorLength === 1 &&  errorName ==='shipping_line_id'
                    &&needForce
                ){
                    forceUpdateShippingLine = true;
                    refetchDeliveryGroup?.()
                }
                produce(cart.token,"form_validate",{
                    values : {
                        ...formatFormValues(e.values,false),
                        context : e.values?.context || null,
                        summary_loading : loading.summary,
                        shipping_methods_loading : loading?.shipping_methods,
                        checkout_loading : checkoutLoading,
                        shipping_methods : _get(groups,'0.deliveryOptions',null),
                        errorLength,
                        errorName,
                        need_force : needForce,
                        force_fetch_delivery_group : forceUpdateShippingLine,
                        options,
                    },
                    errors : e.errorFields,
                }).catch()
            }else{
                // Error 对象 JSON 序列化后是 {}，后端 payload 校验会 422，这里摊平成可读对象
                produce(cart.token,'form_validate', e instanceof Error
                    ? {message : e.message, name : e.name}
                    : e).catch(() => undefined);
            }
            scrollToError(e);
            return null;
        }

    };
}

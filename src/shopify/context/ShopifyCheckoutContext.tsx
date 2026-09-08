import {createContext, FC, ReactNode, use, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useCart} from "@hooks/useCart.ts";
import {ApolloClient, from, gql, useApolloClient, useMutation, useQueryRefHandlers, useReadQuery} from "@apollo/client";
import {MutateCheckout, MutateRemoveAddresses} from "@query/checkouts/mutations.ts";
import {buildCheckoutMutation} from "@query/checkouts/buildCheckoutMutation.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment, QueryDeliveryGroupsFragment
} from "@query/checkouts/fragments/fragments.ts";
import { get as _get,set as _set,isString as _isString,setWith as _setWith,cloneDeep as _cloneDeep} from "lodash-es";
import {FormInstance} from "@rc-component/form";
import {useDeliveryGroupMutation, useSummary} from "../checkouts/hooks/useSummary.tsx";
import {getBy} from "../lib/helper.ts";
import {QueryDeliveryAddresses} from "@query/checkouts/queries.ts";
import Validators from "validator";
import {useEventCallback} from "usehooks-ts";
import PQueue from "p-queue";
import {CheckoutSyncManager} from "../sync/CheckoutSyncManager.ts";
import {CheckoutSyncContext} from "../sync/CheckoutSyncContext.tsx";
import {isCartReady} from "../sync/domains.ts";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";
import {api, getFinalPath, produce} from "@lib/api.ts";
import {getIntFromMeta, getJsonFromMeta, getMetaContent} from "@lib/metaHelper.ts";
import {Features} from "@lib/flags.ts";
import {PhoneOnlyRequired} from "../lib/globalSettings.ts";


export async function removeOtherAddresses(client : ApolloClient<any>,cartId : string,id : string){
    const response = await client.query({
        query : gql([
            QueryDeliveryAddresses
        ].join("\n")),
        fetchPolicy : 'no-cache',
        variables : {
            cartId : cartId,
        }
    })
    // console.log('deliveryAddresses:',response);
    const ids = (response?.data?.cart?.delivery?.addresses || []) as string[];
    const result = await client.mutate({
        mutation: gql([
            MutateRemoveAddresses,
        ].join("\n")),
        variables : {
            cartId : cartId,
            ids : ids.filter((a : any) => {
                return a.id !== id;
            }).map((a : any) => {
                return a.id;
            })
        }
    })
    // console.log('remove result:',result);
    return result;
}

export type CheckoutInput = {
    email ?: string;
    shipping_address ?: {
        id ?: string;
        countryCode ?: string;
        city ?: string;
        provinceCode ?: string;
        phone ?: string;
        address1 ?: string;
        address2 ?: string;
        firstName ?: string;
        lastName ?: string;
        zip ?: string;
    },
    billing_address ?: {
        countryCode ?: string;
        city ?: string;
        provinceCode ?: string;
        address1 ?: string;
        address2 ?: string;
        firstName ?: string;
        lastName ?: string;
    },
    deliveryHandle ?: string;
    deliveryGroupId ?: string;
    validationStrategy?: 'COUNTRY_CODE_ONLY' | 'STRICT'
};
export const ShopifyCheckoutContext = createContext<{

    update ?: (data : CheckoutInput,
               partialUpdate ?: boolean,
               force ?: boolean,
               keepBuyerCountryCode  ?: boolean
               )=>Promise<any>,
    loading : boolean,
    cartLinePriceLoading : boolean,
}>({
    loading : false,
    cartLinePriceLoading : false,
});

// const addressPrefix= "gid://shopify/CartDeliveryAddress/";
const addressPrefix= "gid://shopify/CartSelectableAddress/";
const groupPrefix= "gid://shopify/CartDeliveryGroup/";

function start(target : string,prefix :string){
    return target.startsWith(prefix) ? target : prefix + target.replace(prefix,'');
}

function formatInput(input : CheckoutInput,keepBuyerCountryCode  : boolean = false){
    console.log('format input:',input);
    let vars  : any= {
        createAddress : false,
        updateAddress : false,
        updateBuyer : false,
        updateSelectedDelivery : false,
        buyerIdentity : {},
        delivery : {},
        withCarrierRates : true,

    };
    if(!!input.validationStrategy){
        vars.validationStrategy = input.validationStrategy;
    }
    if(!!input.email && Validators.isEmail(input.email,{
        allow_utf8_local_part : false,
    })){
        vars.updateBuyer = true;
        vars.buyerIdentity.email = input.email;
    }
    const countryCode = input?.shipping_address?.countryCode;
    if(!!countryCode){
        vars.updateBuyer = true;
        if(!keepBuyerCountryCode){
            vars.buyerIdentity.countryCode = countryCode;
        }
        vars.updateAddress = true;
        const {id,...others} = input.shipping_address!;
        vars.delivery = others;
        if(!id){
            vars.createAddress = true;
            vars.updateAddress = false;
        }else{
            vars.createAddress = false;
            vars.updateAddress = true;
        }
        vars.addressId = id ? start(id, addressPrefix) : null;
    }
    // 切换快递方式：只要有 groupId + handle 就必须同步到 Shopify
    // （cartSelectedDeliveryOptionsUpdate）。之前这段写在 countryCode 分支里，
    // 地址/国家字段缺失时 updateSelectedDelivery 会保持 false，
    // 结果后端（PHP）同步了但 Shopify 没有更新选中的快递方式。
    if(input?.deliveryGroupId && input?.deliveryHandle){
        vars.deliveryGroupId = start(input.deliveryGroupId, groupPrefix);
        vars.deliveryOptionHandle = input?.deliveryHandle;
        vars.updateSelectedDelivery = true;
    }
    return vars;
}


function getAllArray(data : any , path : string,keys : string[]){
    const all : any[] = []    ;
    keys.forEach((key) => {
        all.push(... (_get(data,key + '.' + path,[])))
    });
    return all;
}
export const ShopifyCheckoutProvider :FC<{
    children ?: ReactNode;
    form :FormInstance;
}> = (props) => {
    const {children,form} = props;
    const {gid,token} = useCart();
    const [fn,{client,error,loading,}] = useMutation(gql([
        MutateCheckout,
        QueryCartFieldsFragment,
        QueryDeliveryFragment,
        // QueryDeliveryGroupsFragment,
        // QueryLineItemsFragment,
        // QueryVariantFragment,
        // QueryImageFragment,
        QueryBuyerIdentityFragment,
    ].join("\n")),{

        variables : {
            cartId : gid,
        }
    });
    const [cartLinePriceLoading, setCartLinePriceLoading] = useState(false);
    const groupsMutation = useDeliveryGroupMutation();
    const mutationLoading = useRef(false);
    mutationLoading.current = loading;


    const UpdateMutationCallback = useEventCallback(async (variables : any,
                                              partialUpdate : boolean = true,
                                              force : boolean = false,
                                              ) => {

        if(mutationLoading.current && !force) return;
        if(!variables?.updateBuyer && !variables?.updateAddress && !variables?.createAddress && !variables?.updateSelectedDelivery){
            return {
                userErrors : [],
                warnings : [],
                cart : {},
            };
        }
        // 单个 CheckoutQuery 已包含 Summary、行项目和快递分组，mutation 后
        // 只需 refetch 一次即可让整页（价格 / 行项目 / 快递方式 / 折扣）更新，
        // 不再并发 refetch GetDeliveryGroups + CartLineItems + Summary。
        const refetchQueries = ['CheckoutQuery'];
        const countryChanged = !!variables?.buyerIdentity?.countryCode;
        const config : any = {
            // awaitRefetchQueries : true,
            refetchQueries,
            variables,
            awaitRefetchQueries : true,
            mutation : buildCheckoutMutation(variables),
        };
        // if(!partialUpdate){
        //     // config.refetchQueries= ['CartLineItems'];
        // }
        import.meta.env.DEV && console.log('mutation checkout:',config);
        if (countryChanged) {
            setCartLinePriceLoading(true);
        }
        const response = await fn(config).finally(() => {
            if (countryChanged) {
                setCartLinePriceLoading(false);
            }
        });
        let data = _cloneDeep(_get(response,'data'));

        const increments = _get(response,'incremental',[]);
        increments.forEach((incremental) => {
            let {path,data : incrementalData} = incremental;
            Object.keys(incrementalData).forEach((key) => {
                const full = path.join('.') + '.' + key;
                // console.log('set data :',full,incrementalData[key]);
                data = _set(data,full,incrementalData[key]);
            })
            // data = Object.assign(data,incremental?.data || {});
        })
        const json = getBy(data,
            'cartSelectedDeliveryOptionsUpdate',
            'cartDeliveryAddressesAdd',
            'cartDeliveryAddressesUpdate',
        );
        return {
            userErrors : getAllArray(data,'userErrors',[
                'cartBuyerIdentityUpdate',
                'cartSelectedDeliveryOptionsUpdate',
                'cartDeliveryAddressesAdd',
                'cartDeliveryAddressesUpdate',
            ]),
            warnings : getAllArray(data,'warnings',[
                'cartBuyerIdentityUpdate',
                'cartSelectedDeliveryOptionsUpdate',
                'cartDeliveryAddressesAdd',
                'cartDeliveryAddressesUpdate',
            ]),
            cart : {
                ...(json?.cart || {}),
                ... (data?.cartBuyerIdentityUpdate?.cart || {}),
            }
        }
    });
    const UpdateCallback = useEventCallback(async(input : CheckoutInput,
                                             partialUpdate : boolean = true,
                                             force : boolean = false,
                                             keepBuyerCountryCode  : boolean = false,
    )=>{
        let vars = formatInput(input,keepBuyerCountryCode);
        import.meta.env.DEV && console.log('update remote cart vars:', vars);
        let result= await UpdateMutationCallback(vars,partialUpdate,force,);
        let cart = result?.cart;
        const warningCode =result ?.warnings?.[0]?.code;
        if(warningCode === 'DUPLICATE_DELIVERY_ADDRESS' && vars.addressId){
            await removeOtherAddresses(client,gid,vars.addressId)
            result = await UpdateMutationCallback(vars,partialUpdate,force,);
            cart = result?.cart;
        }
        if(cart?.hasOwnProperty('deliveryGroups')){
            groupsMutation(cart?.deliveryGroups || null);
            const group = _get(cart,'deliveryGroups.edges.0.node');
            const groupId = group?.id;
            const after : any = {

            }
            const delivery = _get(cart,'delivery.addresses.0.id');
            if(!!groupId){
                after['shipping_group_id'] = groupId;
            }
            const selected = group?.selectedDeliveryOption?.handle;
            if(!!selected){
                after['shipping_line_id'] = selected;
            }
            if(delivery){
                _set(after,'shipping_address.id',delivery);
            }
            await new Promise((resolve) => {
                setTimeout(() => {
                    form.setFieldsValue(after);
                    resolve(true);
                },0);
            })
        }
        return result;
    })
    const queue = useMemo(() => {
       return new PQueue({
           concurrency : 1,
       });
    },[]);
    // 所有 Shopify mutation 都必须经过这条串行队列（manager 也不例外）
    const queuedUpdate = useCallback(async (...args : any[]) => {
        return await queue.add(async () => {
            //@ts-ignore
            return await UpdateCallback(...args);
        });
    },[queue]);
    // ---- Checkout 同步管理器：唯一的写编排者 ----
    // 依赖统一放在 ref 里，manager 只按 token/form 建一次，避免每渲染换实例。
    const cartCache = useCartCache();
    const summary = useSummary();
    const syncDepsRef = useRef<any>(null);
    syncDepsRef.current = {
        cartCache,
        summary,
        update : queuedUpdate,
        groupsMutation,
    };
    const syncManager = useMemo(() => {
        if (!Features.includes('sync-manager')) return null;
        return new CheckoutSyncManager({
            token,
            form,
            mutate : (input : any, partialUpdate ?: boolean, force ?: boolean, keepBuyerCountryCode ?: boolean) => {
                return syncDepsRef.current.update(input, partialUpdate, force, keepBuyerCountryCode);
            },
            readCart : () => _get(syncDepsRef.current.cartCache(gid), 'cart') || null,
            // 等到的是"完整快照"：只有 cart.id 还不够，deliveryGroups / lines 也必须已进缓存，
            // 否则指纹会算错、镜像会被写残（见 domains.isCartReady）。
            waitForCart : async (timeoutMs = 6000) => {
                const deadline = Date.now() + timeoutMs;
                while (!isCartReady(_get(syncDepsRef.current.cartCache(gid), 'cart')) && Date.now() < deadline) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            },
            waitForSummary : async (timeoutMs = 5000) => {
                const deadline = Date.now() + timeoutMs;
                while (syncDepsRef.current.summary?.loading?.summary && Date.now() < deadline) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
            },
            put : (payload : Record<string, any>) => api({
                method : 'put',
                url : getFinalPath(`/checkouts/${token}`),
                data : payload,
            }),
            telemetry : (action : string, payload : Record<string, any>) => {
                produce(token, action, payload).catch(() => undefined);
            },
            initialRevision : getIntFromMeta('sync_revision'),
            initialHash : getMetaContent('sync_hash'),
            // 镜像专属字段（email / 账单 / 本地化）：客户端据此判断要不要补发 PUT
            initialMirror : getJsonFromMeta('sync_mirror'),
            // 老路径的 useFormValidate 会把 STRICT / COUNTRY_CODE_ONLY 交给 formatInput；
            // manager 自己构造输入，必须显式传，否则永远走 GraphQL 默认的 COUNTRY_CODE_ONLY（P2-4）
            validationStrategy : () => PhoneOnlyRequired() ? 'COUNTRY_CODE_ONLY' : 'STRICT',
        });
    },[token,form]);
    // 页面隐藏时补发一次：PUT 走的是 XHR，浏览器可能在卸载前掐断，
    // 所以这里是 best-effort——没发出去也没关系，服务端 sync_hash 不变，
    // 下次进入的首屏 hydrate 会重新比对指纹并补发（P1-5）。
    useEffect(() => {
        if (!syncManager) return;
        const onVisibilityChange = () => {
            if (document.visibilityState !== 'hidden') return;
            syncManager.flush('flush').catch((e) => {
                console.error('[sync] flush on hide failed:', e);
            });
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    },[syncManager]);
    // StrictMode（dev）会 mount → cleanup → mount：cleanup 里直接 dispose 会让第二次挂载后
    // manager 永久失效（flush 只返回空结果，支付时 summary 变成 null，报
    // "Cannot read properties of undefined (reading 'replace')"）。
    // 因此延迟到微任务，确认没有立刻重新挂载，才真正销毁。
    const mountCountRef = useRef(0);
    useEffect(() => {
        mountCountRef.current += 1;
        const mine = mountCountRef.current;
        return () => {
            const check = () => {
                if (mountCountRef.current === mine) {
                    syncManager?.dispose();
                }
            };
            if (typeof queueMicrotask === 'function') {
                queueMicrotask(check);
            } else {
                setTimeout(check, 0);
            }
        };
    },[syncManager]);
    return <ShopifyCheckoutContext value={{
        loading,
        cartLinePriceLoading,
        update : queuedUpdate,
    }}>
        <CheckoutSyncContext value={syncManager}>
            {children}
        </CheckoutSyncContext>
    </ShopifyCheckoutContext>
}

export function useMutationCheckout(){
    return use(ShopifyCheckoutContext)!.update!;
}

export function useShopifyCheckoutLoading(){
    return use(ShopifyCheckoutContext)!.loading;
}


export function map2(from : any,map : any,nullable = false){
    const after : any = {};
    Object.keys(map).forEach((key) => {
        const path = map[key];
        const value = _isString(path) ?  _get(from,path,null): path(from,key);
        if(nullable){
            _set(after,key,value);
        }else if(!!value){
            _set(after,key,value);
            // after[key] = value;
        }
    });
    return after;
}

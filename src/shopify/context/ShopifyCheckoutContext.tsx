import {createContext, FC, ReactNode, use, useCallback, useRef} from "react";
import {useCartStorage} from "@hooks/useCartStorage.ts";
import {ApolloClient, gql, useApolloClient, useMutation, useQueryRefHandlers, useReadQuery} from "@apollo/client";
import {MutateCheckout, MutateRemoveAddresses} from "@query/checkouts/mutations.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment,
    QueryDeliveryFragment, QueryDeliveryGroupsFragment
} from "@query/checkouts/fragments/fragments.ts";
import { get as _get,set as _set,isString as _isString,setWith as _setWith,cloneDeep as _cloneDeep} from "lodash-es";
import {FormInstance} from "rc-field-form";
import {SummaryQuery} from "../../App.tsx";
import {useDeliveryGroupMutation} from "../checkouts/hooks/useSummary.tsx";
import {getBy} from "../lib/helper.ts";
import {QueryDeliveryAddresses} from "@query/checkouts/queries.ts";
import {boolean} from "zod";


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
    console.log('deliveryAddresses:',response);
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
    console.log('remove result:',result);
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
    deliveryHandle ?: string;
    deliveryGroupId ?: string;
    validationStrategy?: 'COUNTRY_CODE_ONLY' | 'STRICT'
};
export const ShopifyCheckoutContext = createContext<{

    update ?: (data : CheckoutInput,partialUpdate ?: boolean)=>Promise<any>,
}>({

});

// const addressPrefix= "gid://shopify/CartDeliveryAddress/";
const addressPrefix= "gid://shopify/CartSelectableAddress/";
const groupPrefix= "gid://shopify/CartDeliveryGroup/";

function start(target : string,prefix :string){
    return prefix + target.replace(prefix,'');
}

function formatInput(input : CheckoutInput){
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
    if(!!input.email){
        vars.updateBuyer = true;
        vars.buyerIdentity.email = input.email;
    }
    const countryCode = input?.shipping_address?.countryCode;
    if(!!countryCode){
        vars.updateBuyer = true;
        vars.buyerIdentity.countryCode = countryCode;
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
        vars.addressId = start(id || '0' ,addressPrefix);
        vars.deliveryGroupId = start(
            input?.deliveryGroupId || '0',
            groupPrefix
        );
        vars.deliveryOptionHandle = input?.deliveryHandle || '';
        vars.updateSelectedDelivery = !(!input?.deliveryGroupId || !input?.deliveryHandle)
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
    const storage = useCartStorage();
    const [fn,{client,error,loading}] = useMutation(gql([
        MutateCheckout,
        QueryCartFieldsFragment,
        QueryDeliveryFragment,
        QueryDeliveryGroupsFragment,
        // QueryLineItemsFragment,
        // QueryVariantFragment,
        // QueryImageFragment,
        QueryBuyerIdentityFragment,
    ].join("\n")),{
        variables : {
            cartId : storage.gid,
        }
    });
    const groupsMutation = useDeliveryGroupMutation();
    const mutationLoading = useRef(false);
    mutationLoading.current = loading;

    const update = useCallback(async (variables : any,partialUpdate : boolean = true) => {
        if(mutationLoading.current) return;
        const config : any = {
            // awaitRefetchQueries : true,
            refetchQueries: ['CartLineItems'],
            variables,
        };
        if(!partialUpdate){
            config.awaitRefetchQueries = true;
            // config.refetchQueries= ['CartLineItems'];
        }
        console.log('mutation checkout:',config);
        const response = await fn(config);
        let data = _cloneDeep(_get(response,'data'));

        const increments = _get(response,'incremental',[]);
        increments.forEach((incremental) => {
            let {path,data : incrementalData} = incremental;
            Object.keys(incrementalData).forEach((key) => {
                const full = path.join('.') + '.' + key;
                console.log('set data :',full,incrementalData[key]);
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
    }, [fn]);
    return <ShopifyCheckoutContext value={{
        update : async(input : CheckoutInput,partialUpdate : boolean = true)=>{
            let vars = formatInput(input);
            let result= await update(vars,partialUpdate);
            let cart = result?.cart;
            const warningCode =result ?.warnings?.[0]?.code;
            if(warningCode === 'DUPLICATE_DELIVERY_ADDRESS'){
                    await removeOtherAddresses(client,storage.gid,vars.addressId)
                    result = await update(vars,partialUpdate);
                    cart = result?.cart;
            }
            groupsMutation(cart?.deliveryGroups || null);
            const group = _get(cart,'deliveryGroups.edges.0.node');
            const groupId = group?.id;
            const after : any = {

            }
            if(!!groupId){
                after['shipping_group_id'] = groupId;
            }
            const selected = group?.selectedDeliveryOption?.handle;
            if(!!selected){
                after['shipping_line_id'] = selected;
            }
            await new Promise((resolve) => {
                setTimeout(() => {
                    form.setFieldsValue(after);
                    resolve(true);
                },0);
            })
            return result;
        }
    }}>
        {children}
    </ShopifyCheckoutContext>
}

export function useMutationCheckout(){
    return use(ShopifyCheckoutContext)!.update!;
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

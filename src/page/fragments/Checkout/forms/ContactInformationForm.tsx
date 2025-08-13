import React, {FC,} from "react";
import {Input} from "../../../components/Input.tsx";

import {debounce as _debounce,get as _get} from "lodash-es";
import {EmailRegex} from "@lib/regex.ts";
import {FormItem} from "@components/fragments/FormItem.tsx";
import {getBasename, GetCartGid, storefront} from "@lib/checkout.ts";

export type ContactInformationFormProps = {};



import {api} from "@lib/api.ts";
import {useShopifyBasename} from "../../../../shopify/context/ShopifyContext.ts";
import {gql, useApolloClient, useMutation, useReadQuery} from "@apollo/client";
import {MutateEmail} from "@query/checkouts/mutations.ts";
import {
    QueryBuyerIdentityFragment,
    QueryCartFieldsFragment, QueryDeliveryFragment, QueryImageFragment,
    QueryLineItemsFragment, QueryVariantFragment
} from "@query/checkouts/fragments/fragments.ts";
import {useCartCache} from "@query/checkouts/cache/useCartCache.ts";
import {useCartStorage} from "@hooks/useCartStorage.ts";

export const ContactInformationForm: FC<ContactInformationFormProps> = (props) => {
    const basename = useShopifyBasename();
    const storage = useCartStorage();
    const [fn] = useMutation(gql([
        MutateEmail,
        QueryBuyerIdentityFragment,
    ].join("\n")),{
        variables : {
            cartId : storage.gid,
        }
    })
    const cache = useCartCache();
    return <div className={'flex flex-col space-y-3'}>
        <div className={'flex flex-row justify-between'}>
            <div>
                Contact Information
            </div>
            {/*<div className={'flex flex-row items-center space-x-1 text-sm'}>*/}
            {/*    <div className={'text-neutral-500'}>*/}
            {/*        Already have an account?*/}
            {/*    </div>*/}
            {/*    <div>*/}
            {/*        Log in*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
        <FormItem name={['email']} rules={[{
            async validator(rule, value) {
                if (!EmailRegex.test(value)) {
                    throw new Error("Please enter a valid email");
                }
            }
        }]}>
            <Input placeholder={'Email'} onBlur={_debounce((event) => {
                const email = event.target.value as string;
                if (EmailRegex.test(email)) {
                    fn({
                        variables : {
                            'cartId' : storage.gid,
                            'buyer' :{
                                email,
                            }
                        }
                    });

                    const data = cache(storage.gid);
                    console.log('cache data:', data);
                    api({
                        method: 'put',
                        url : `${basename}`,
                        data: {
                            email,
                            remote_data : _get(data,'cart'),
                        }
                    }).then(r => {
                        console.log('checkout:', r);
                    })

                }
            })}/>
        </FormItem>
        {/*<div className={' flex flex-row items-center space-x-2'}>*/}
        {/*    <Checkbox />*/}
        {/*    <label className={'text-neutral-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm'}>*/}
        {/*        Keep me up to date on news and exclusive offers*/}
        {/*    </label>*/}
        {/*</div>*/}
    </div>
};

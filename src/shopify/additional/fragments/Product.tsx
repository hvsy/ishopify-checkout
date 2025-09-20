import {FC, useEffect, useMemo, useRef, useState} from "react";
import {get,find} from "lodash-es";
import {VariantPrice, Variants} from "./Variants.tsx";
import {Covers} from "./Covers.tsx";
import {InputNumber} from "./InputNumber.tsx";
import {useParams} from "react-router-dom";
import {AsyncButton} from "@components/fragments/AsyncButton.tsx";
import {api} from "@lib/api.ts";
import {PromiseLocation} from "../../lib/payment.ts";

export type ProductProps = {
    product : any;
    shop : any;
};

export const Product: FC<ProductProps> = (props) => {
    const {product,shop} = props;
    const  variants =get(product,'variants.edges',[]).map((edge : any) => {
        const node = edge.node;
        const options = node.selectedOptions.map((o : any) => {
            return o.value;
        });
        return {
            id : node.id,
            title : node.title,
            options,
            option1 : options?.[0],
            option2 : options?.[1],
            option3 : options?.[2],
            price :  node.price,
            availableForSale : node.availableForSale,
        }
    });
    const config = useMemo(() => {
        return {
            images : get(product,'media.edges',[]).map((edge: any) => {
                return edge.node;
            }),
        }
    },[product]);
    const options = get(product,'options',[]).map((opt : any) => {
        return {
            name : opt.name,
            values : opt.optionValues.map((ov : any) => {
                return ov.name;
            })
        }
    });

    const [selectedOptions, setSelectedOptions] = useState(() => {
        return [...variants?.[0].options];
    });
    const [quantity, setQuantity] = useState(1)

    const variant = useMemo(() => {
        return find(variants, (v : any) => {
            const opts = v.options|| [];
            for(let i = 0; i < opts.length; ++i){
                if(opts[i] !== selectedOptions[i]){
                    return false;
                }
            }
            return true;
        });
    }, [variants,...selectedOptions]);

    const {token} = useParams();
    const formRef = useRef<HTMLFormElement>(null);
    return <div className={'flex flex-col items-stretch sm:flex-row sm:py-5 space-y-3 sm:space-y-0'}>
        <div className={'flex sm:flex-1 overflow-hidden'}>
            <Covers images={config.images} selected={selectedOptions} />
        </div>
        <form ref={formRef} method={'post'} action={`/a/s/${token}/upsell`} className={'px-5 flex flex-col items-stretch sm:items-center sm:flex-1 overflow-hidden text-center space-y-5 sm:space-y-8'}>
            <div className={'text-2xl font-bold min-w-4/5'}>
                {product.title}
            </div>
            <Variants variants={variants}
                      className={'min-w-4/5'}
                      selected={selectedOptions}
                      onChange={(selected) => {
                          setSelectedOptions(selected);
                      }}
                      options={options}
            >
                {variant && <VariantPrice variant={variant} quantity={quantity}/>}
            </Variants>
            <input type={'hidden'} name={'variant_id'} value={variant?.id} />
            <input type={'hidden'} name={'product_id'} value={product.id} />
            <div className={'flex flex-row items-center space-x-2 min-w-4/5'}>
                <span>
                    Quantity:
                </span>
                <InputNumber name={'quantity'} value={quantity} min={1} onChange={(v) => {
                   setQuantity(v);
                }}/>
            </div>
            <div className={'h-[100px]'}>

            </div>
            <div className={'fixed bottom-0 right-0 left-0 flex flex-col items-stretch'}>
                <div className={'flex flex-col items-stretch'}>
                    <a href={""}
                       className={'text-[#9ca3af] opacity-30 bg-transparent text-[10px] text-left'} style={{
                        transform: 'matrix(0.75,0,0,0.75,0,0)',
                        marginTop: 20
                    }}>
                        Continue without this
                    </a>
                    <AsyncButton onClick={async () => {
                        if (!formRef.current) return;
                        const url = formRef.current.action;
                        const formData = new FormData(formRef.current);
                        // console.log('url:',url,Object.fromEntries(formData));
                        // return new Promise((resolve) => {
                        //   setTimeout(resolve,30000);
                        // });
                        const res = await api({
                            method: "post",
                            'url': url,
                            data: Object.fromEntries(formData),
                        });
                        if (res.redirect) {
                            return PromiseLocation(res.redirect);
                        }
                    }}
                                 className={'uppercase bg-yellow-500 hover:bg-yellow-600 py-4 text-lg px-12 rounded-none text-black h-auto max-w-full min-w-4/5'}>
                        complete your order
                    </AsyncButton>
                </div>
                <div className={'flex flex-row justify-between text-xs sm:text-sm p-2 sm:pt-5 sm:pb-0 sm:px-0 bg-white'}>
                    <div>
                        Privacy policy
                    </div>
                    <div className={'flex flex-row items-center space-x-1'}>
                        <p>&copy;</p>
                        <p>
                            {(new Date()).getFullYear()},
                        </p>
                        <span>
                    {shop?.name} Powered by Shopify
                </span>
                    </div>
                </div>
            </div>

        </form>
    </div>;
};

import {FC, useEffect, useMemo, useState} from "react";
import {get,find} from "lodash-es";
import {VariantPrice, Variants} from "./Variants.tsx";
import {Covers} from "./Covers.tsx";
import {InputNumber} from "./InputNumber.tsx";
import {useParams} from "react-router-dom";

export type ProductProps = {
    product : any;
};

export const Product: FC<ProductProps> = (props) => {
    const {product} = props;
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
    return <div className={'flex flex-col items-stretch sm:flex-row sm:py-5 space-y-3 sm:space-y-0'}>
        <div className={'flex sm:flex-1 overflow-hidden'}>
            <Covers images={config.images} selected={selectedOptions} />
        </div>
        <form method={'post'} action={`/a/s/${token}/upsell`} className={'px-5 flex flex-col items-stretch sm:items-center sm:flex-1 overflow-hidden text-center space-y-5 sm:space-y-8'}>
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
            <button type={'submit'} className={'uppercase bg-yellow-500 py-4 text-lg px-12 rounded-none text-black h-auto max-w-full min-w-4/5'}>
                complete your order
            </button>
            <a href={""}
               className={'text-[rgb(156,163,175)] bg-white text-[10px]'} style={{
                transform : 'matrix(0.75,0,0,0.75,0,0)',
                marginTop:20
            }}>
                Continue without this
            </a>
        </form>
    </div>;
};

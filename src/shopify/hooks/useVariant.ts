import {useCallback, useEffect, useMemo, useState} from "react";
import {isNumber, toNumber} from "lodash-es";
export function useVariantId(defaultValue ?: string){
    const [variant_id,setVariantId] = useState<string|undefined>(defaultValue);
    const setter = useCallback((which : number|string|null) => {
        const id = which ?(isNumber(which ) ? (toNumber(which) + '') : which) : undefined;
        setVariantId(id);
    },[setVariantId]);
    return [variant_id,setter] as const;
}
export function useVariant(product : any){
    const [variantId,setVariantId] = useVariantId(product?.variants?.[0]?.id ? product?.variants?.[0]?.id + '' : undefined);
    useEffect(() => {
        if(product?.variants?.findIndex((v : any) => {
            return (v.id + '') === variantId;
        }) !== -1){
            return;
        }
        const firstId = product.variants?.[0].id;
        if (!!(firstId)) {
            setVariantId(firstId);
            return;
        }
    },[product?.handle]);

    const selectedVariant = useMemo(() => {
        if (!variantId) return null;
        return product.variants.find((v : any) => {
            return (v.id + '') === variantId;
        });
    }, [variantId]);
    const selectedOptions = selectedVariant?.options || [];
    const attachment_id =  useMemo(() => {
        const v = (product?.variants||[]).find((v : any) => {
            return (v.id + '') == variantId;
        });
        return v?.attachment_id || product.attachments?.[0]?.id;
    },[variantId]);
    return {
        variantId,
        setVariantId,
        variant: selectedVariant,
        options : selectedOptions,
        attachmentId : attachment_id,
    }
}

export function getVariantBy(options: string[], variants ?: DB.Variant[],) {
    if (!variants?.length) return null;
    return variants.find((v) => {
        for (let i = 0; i < (v.options?.length || 0); ++i) {
            if (v.options?.[i] !== options?.[i]) {
                return false;
            }
        }
        return true;
    }) || null;
}

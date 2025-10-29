import {createContext, FC, use, useEffect, useState} from "react";
import useSWR from "swr";
import {Pixels} from "../shopify/fragments/Pixels.tsx";
import {isString, get as _get} from "lodash-es";

import {useSummary} from "../shopify/checkouts/hooks/useSummary.tsx";

export const PaymentContext = createContext<{
    method: DB.PaymentMethod | null;
    setMethod: (method: DB.PaymentMethod | null) => void;
    methods?: DB.PaymentMethod[],
    loading?: boolean,
    tracking?: any,
    zones?: any[],
} | null>(null);


export function usePaymentContext() {
    return use(PaymentContext) || null;
}

export function usePaymentMethod() {
    return usePaymentContext()?.method;
}

export function useAllZones() {
    const ctx = usePaymentContext();
    return {zones: ctx?.zones || [], loading: ctx?.loading};
}

export function useShippingZones() {
    const {json} = useSummary();
    const {zones: all, loading} = useAllZones();
    const ships2countries = _get(json, 'shop.shipsToCountries', []);
    const marketCountries = _get(json, 'localization.availableCountries', []).map((country: any) => {
        return country?.isoCode;
    }).filter(Boolean);
    return {
        zones: (ships2countries || []).map((code: string) => {
            if (!marketCountries?.includes(code)) return null;
            return all.find((region: any) => {
                return region.code === code;
            })
        }).filter(Boolean),
        loading,
    }
}

function preload(config: any) {
    const link = document.createElement('link');
    Object.keys(config).forEach((key) => {
        //@ts-ignore
        link[key] = config[key];
    })
    document.head.append(link);
}

export const PaymentContainer: FC<any> = (props) => {
    const {children} = props;
    const [method, setMethod] = useState<DB.PaymentMethod | null>(null);
    const {data: setup, isLoading} = useSWR<{
        tracking: any;
        payments: DB.PaymentMethod[],
        zones?: any[],
    }>(
        '/a/s/api/setup'
    );
    useEffect(() => {
        if (!setup?.payments) return;
        (setup.payments || []).forEach((payment) => {
            (payment.preloads?.js || []).forEach((js) => {
                if (!js) return;
                const obj = isString(js) ? {
                    rel: 'preload',
                    href: js,
                    as: 'script',
                    type: 'text/javascript'
                } : js;
                preload(obj);
            });
            (payment.preloads?.css || []).forEach((css) => {
                if (!css) return;
                const obj = isString(css) ? {
                    rel: 'preload',
                    href: css,
                    as: 'style',
                    type: 'text/css'
                } : css;
                preload(obj);
            });
        })
    }, [!!setup]);
    return <PaymentContext value={{
        tracking: setup?.tracking || null,
        method,
        setMethod,
        methods: setup?.payments || [],
        loading: isLoading,
        zones: setup?.zones || [],
    }}>
        {children}
        {setup?.tracking && <Pixels tracking={setup.tracking}/>}
    </PaymentContext>
}

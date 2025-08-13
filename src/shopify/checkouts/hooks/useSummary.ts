import {useReadQuery} from "@apollo/client";

import {useLoaderData} from "react-router-dom";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
export function useSummary(){
    const {ref,} = useLoaderData() as any;
    const json  =useReadQuery(ref).data as any;
    return {
        json,
        checkout(){
            return getCheckoutFromSummary(json,'cart');
        }
    }
}

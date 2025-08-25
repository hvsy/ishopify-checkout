import {FC} from "react";
import {ShopifyFrame} from "../ShopifyFrame.tsx";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import { ShopifyCheckoutProvider } from "../context/ShopifyCheckoutContext.tsx";
import Form from "rc-field-form";
import {SummaryContextProvider, useSummary} from "../checkouts/hooks/useSummary.tsx";
import {Outlet} from "react-router-dom";

export type ShopifyCheckoutFrameProps = {};

export const ShopifyCheckoutFrame: FC<ShopifyCheckoutFrameProps> = (props) => {
    return <SummaryContextProvider >
        <Outlet/>
    </SummaryContextProvider>
        // const {json} = useSummary();
        // const checkout = getCheckoutFromSummary(json, 'cart');
        // const [form] = Form.useForm();
        // return <ShopifyCheckoutProvider form={form}>
        //     <FormContainer form={form} initialValues={checkout} key={checkout.countryCode}>
        //         <ShopifyFrame>
        //             <Outlet />
        //             {/*<Main/>*/}
        //         </ShopifyFrame>
        //     </FormContainer>
        // </ShopifyCheckoutProvider>
};

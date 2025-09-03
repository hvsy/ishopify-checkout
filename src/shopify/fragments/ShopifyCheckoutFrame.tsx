import {FC} from "react";
import {GlobalContextProvider, SummaryContextProvider, useSummary} from "../checkouts/hooks/useSummary.tsx";
import {Outlet} from "react-router-dom";

export type ShopifyCheckoutFrameProps = {};

export const ShopifyCheckoutFrame: FC<ShopifyCheckoutFrameProps> = (props) => {
    return <GlobalContextProvider>
        <Outlet/>
    </GlobalContextProvider>
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

import Main from "./index.tsx";
import {ShopifyFrame} from "../ShopifyFrame.tsx";
import {useSummary} from "./hooks/useSummary.tsx";
import {getCheckoutFromSummary} from "@lib/getCheckoutFromSummary.ts";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import { ShopifyCheckoutProvider } from "../context/ShopifyCheckoutContext.tsx";
import Form from "rc-field-form";

export default function () {
    const {json} = useSummary();
    const checkout = getCheckoutFromSummary(json, 'cart');
    const [form] = Form.useForm();
    return <ShopifyCheckoutProvider form={form}>
        <FormContainer form={form} initialValues={checkout} key={checkout.countryCode}>
            <ShopifyFrame>
                <Main/>
            </ShopifyFrame>
        </FormContainer>
    </ShopifyCheckoutProvider>
};

import {FC, lazy, useState} from "react";
import {Mobile} from "@hooks/client.ts";
// import {Nav} from "../Nav.tsx";
import {Left} from "../Left.tsx";
import {FormContainer} from "@components/frames/FormContainer.tsx";
import {Frame} from "../Frame.tsx";
import {CheckoutRight} from "./CheckoutRight.tsx";
import {PayingContainer} from "./PayingContainer.tsx";
import {SummaryProvider} from "../../../container/SummaryContext.tsx";
import {CheckoutStarted} from "../../components/CheckoutStarted.tsx";
import {DesktopCheckoutBoard} from "../../../plugins/DesktopCheckoutBoard.tsx";
import {Nav} from "../Nav.tsx";

export type CheckoutMainProps = {};


export const CheckoutMain: FC<CheckoutMainProps> = (props) => {
    const {} = props;

    return <PayingContainer>
        <FormContainer>
            <SummaryProvider>
                <Frame header={
                    <Mobile>
                        <Nav className={"flex sm:hidden mb-3"}/>
                    </Mobile>
                }
                       right={<CheckoutRight/>}
                       rightBottom={<DesktopCheckoutBoard />}
                >
                    <Left/>
                </Frame>
                <CheckoutStarted />
            </SummaryProvider>
        </FormContainer>
    </PayingContainer>
};

import {FunctionComponent, FC, ReactNode, useEffect} from "react";
import Form from "rc-field-form";
import {useParams} from "react-router-dom";
import {NavBar, StandardNavigationBarFrame} from "./StandardNavigationBarFrame.tsx";
import {useDocumentTitle} from "usehooks-ts";
import {capitalize as _capitalize} from "lodash-es";

export type StandardFormFrameProps = {
    ChildrenComponents : {
        [index : string] : FunctionComponent
    },
    children ?:ReactNode;
    bars ?: NavBar[];
};

export const StandardFormFrame: FC<StandardFormFrameProps> = (props) => {
    const {ChildrenComponents,children,bars} = props;
    const {action = 'information'} = useParams();
    const ChildrenComponent = ChildrenComponents[action];

    return <>
        <StandardNavigationBarFrame bars={bars}/>
        <Form.Field name={['shipping_address']} preserve={true}>
            <div className={'hidden'} />
        </Form.Field>
        <Form.Field name={['payment_method_id']} preserve={true}>
            <div className={'hidden'}/>
        </Form.Field>
        <Form.Field name={['shipping_insurance']} preserve={true}>
            <div className={'hidden'} />
        </Form.Field>
        <ChildrenComponent />
        {children}
    </>;
};

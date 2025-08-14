import {FC} from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "../ui/breadcrumb.tsx";
import {useParams} from "react-router-dom";

export type BreadcrumbNavigatorProps = {
    basename ?: string;
};

export const BreadcrumbNavigator: FC<BreadcrumbNavigatorProps> = (props) => {
    const {basename = ""} = props;
    const {action = 'information'}= useParams();
    console.log('basename:',basename);
    return <div className={'flex-row items-center hidden sm:flex'}>
        <Breadcrumb>
            <BreadcrumbList>
                {[{
                    label: "Cart",
                    href: '/cart',
                    step: 'cart',
                }, {
                    label: "Information",
                    step: 'information',
                    href : `${basename}`,
                }, {
                    label: "Shipping",
                    step: 'shipping',
                    href : `${basename}/shipping`
                }, {
                    label: "Payment",
                    step: 'payment',
                    href : `${basename}/payment`
                }].map((item) => {
                    const content = item.step.toLowerCase() === action ?
                        <div className={'font-bold'}>{item.label}</div> : item.label;
                    return <BreadcrumbItem key={item.label} className={'text-blue-900'}>
                        {item.href ? <BreadcrumbLink
                                href={item.href}
                            >
                                {content}
                            </BreadcrumbLink>
                            :  content}
                    </BreadcrumbItem>
                }).reduce((final, item, index, all) => {
                    return final.concat(item, index !== all.length - 1 ?
                        <BreadcrumbSeparator key={`{sep}_${index}`}/> : null);
                }, [] as any[])}
            </BreadcrumbList>
        </Breadcrumb>
    </div>;
};

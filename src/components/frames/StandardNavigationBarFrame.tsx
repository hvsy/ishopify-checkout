import {FC, ReactNode} from "react";
import {Link} from "react-router-dom";
import {BoxFrame} from "./BoxFrame.tsx";

export type NavBar = {
    label : ReactNode;
    value ?: ReactNode;
    href ?: string;
}
export type StandardNavigationBarFrameProps = {
    bars ?: NavBar[];
};

export const BarItem: FC<NavBar> = (props)=>{
    const {label,value,href} = props;
    return  <div className={'flex flex-row items-start sm:items-center space-x-2 justify-between py-4'}>
        <div className={'flex flex-col sm:flex-row flex-1'}>
            <div className={'text-neutral-500 w-20'}>{label}</div>
            <div className={'sm:flex-1 pt-1 sm:pt-0 sm:pl-3'}>{value}</div>
        </div>
        <div className={'text-sm'}>
            <Link to={`${href}`} className={'text-blue-900'}>
                Change
            </Link>
        </div>
    </div>
};
export const StandardNavigationBarFrame: FC<StandardNavigationBarFrameProps> = (props) => {
    const {bars} = props;
    return (!!bars?.length) && <BoxFrame>
        {(bars||[]).filter(b=>!!b.value).map((bar,i) => {
            return <BarItem key={i} {...bar}/>
        })}
    </BoxFrame>;
};

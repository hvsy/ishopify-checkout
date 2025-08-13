import {FC, ReactNode} from "react";

export type NavFrameProps = {
    className ?: string;
    logo ?: ReactNode;
    title ?: string;
    children ?: ReactNode;
};

export const NavFrame: FC<NavFrameProps> = (props) => {
    const {children,className = '',logo,title,} = props;
    return <div className={`flex flex-col items-center space-y-4 ${className}`}>
        <div className={'pt-5 md:pt-0 flex md:block font-bold text-4xl'}>
            <a href={'/'}>
                {logo ? logo : title}
            </a>
        </div>
        {children}
    </div>
};

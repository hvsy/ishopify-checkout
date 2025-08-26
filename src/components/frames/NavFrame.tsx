import {FC, ReactNode} from "react";
import {Skeleton} from "../ui/Skeleton.tsx";

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
            {import.meta.env.VITE_SKELETON ?<Skeleton className={'min-h-8 min-w-36'}/> : <a href={'/'}>
                {logo ? logo : title}
            </a>}
        </div>
        {children}
    </div>
};

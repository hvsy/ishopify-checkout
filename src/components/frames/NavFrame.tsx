import {FC, ReactNode} from "react";
import {Skeleton} from "../ui/Skeleton.tsx";
import {cn} from "@lib/cn.ts";

export type NavFrameProps = {
    className ?: string;
    logo ?: ReactNode;
    align ?: string;
    title ?: string;
    children ?: ReactNode;
};

export const NavFrame: FC<NavFrameProps> = (props) => {
    const {children,className = '',logo,title,align = 'center'} = props;
    const finalClass = cn('flex flex-row overflow-hidden max-h-[64px] px-2',{
        'justify-center w-full' : align === 'center',
        'justify-start w-full' : align === 'left',
        'justify-end w-full' : align === 'right',
    })
    return <div className={`flex flex-col items-stretch space-y-4 ${className}`}>
        <div className={'pt-5 md:pt-0 flex md:block font-bold text-4xl max-h-[64px]'}>
            {import.meta.env.VITE_SKELETON ?<Skeleton className={'min-h-8 min-w-36'}/> : <a href={'/'} className={finalClass}>
                {logo ? logo : <span className={''}>
                    {title}
                </span>}
            </a>}
        </div>
        {children}
    </div>
};

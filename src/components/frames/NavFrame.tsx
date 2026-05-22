import {FC, ReactNode} from "react";
import {Skeleton} from "../ui/Skeleton.tsx";
import {cn} from "@lib/cn.ts";

export type NavFrameProps = {
    className ?: string;
    logo ?: ReactNode;
    align ?: string;
    title ?: string;
    children ?: ReactNode;
    contentClassName ?: string;
};

export const NavFrame: FC<NavFrameProps> = (props) => {
    const {children,className = '',contentClassName = "",logo,title,align = 'center'} = props;
    const finalClass = cn('flex flex-row overflow-hidden max-h-[64px] px-2',{
        'justify-center w-full' : align === 'center',
        'justify-start w-full' : align === 'left',
        'justify-end w-full' : align === 'right',
    })
    return <div className={cn(`flex md:block flex-1 ${contentClassName}`)}>
            {import.meta.env.VITE_SKELETON ?<Skeleton className={'min-h-8 min-w-36'}/> : <a href={'/'} className={finalClass}>
                {logo ? logo : <span className={'my-3 sm:my-0 text-center font-bold text-4xl'}>
                    {title}
                </span>}
            </a>}
        </div>
};

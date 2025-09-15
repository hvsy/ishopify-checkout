import {DetailedHTMLProps, FC, ReactNode, RefObject} from "react";
import {clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {Loading} from "@components/fragments/Loading.tsx";
import {Skeleton} from "@components/ui/Skeleton.tsx";
import {cn} from "@lib/cn.ts";

export type FloatLabelProps = {
    elementRef ?: RefObject<any>,
    autoComplete ?: string;
    name ?: string;
    placeholder ?: string;
    prefix ?: ReactNode;
    suffix ?: ReactNode;
    className ?: string;
    suffixClassName ?: string;
    size ?: 'sm' | 'default' | 'large';
    float ?: boolean;
    element ?: React.FC<any>|React.DetailedHTMLProps<any, any>;
    children ?: ReactNode;
    value ?: any;
    onChange ?: (value : any)=>void;
    onBlur ?: React.MouseEventHandler,
    errors ?: string[],
    warnings?: string[],
    autoFocus ?: boolean;
    touched ?: boolean;
    validating ?: boolean;
    validated ?: boolean;
    label ?: string;
    pattern ?:  string;
    maxLength ?: number;
};

export const FloatLabel: FC<FloatLabelProps> = (props) => {
    const {placeholder : ph,children,prefix,suffix,
        label,
        elementRef,
        suffixClassName,
        element : Element = 'input',className,size='default',float = true,
        onChange,value,onBlur,
        touched,
        validating,
        validated,
        errors,warnings,...others
    } = props;
    const h : any = {
        'sm' : 'h-[40px]',
        'default' : 'h-[46px]',
        'large' : 'h-[52px]',
    }[size];
    const hasError = errors && errors.length > 0;
    const border :any = hasError ? ['border-red-300'] : ['border-slate-300','focus-within:border-indigo-500'];
    if(import.meta.env.VITE_SKELETON){
        return <div className={`flex flex-col ${className || ''}`}>
            <Skeleton className={'h-8 w-full'}/>
        </div>
    }
    const floatClassName = cn("flex-nowrap text-nowrap flex text-sm px-3 text-neutral-400 select-none pointer-events-none",{
        "absolute top-1"  : !!value,
        "absolute inset-0 flex-row items-center"  : !value,
    },);
    return <div className={`flex flex-col space-y-1 ${className || ''}`}>
        {!!label && <div>{label}</div>}
        <div className={twMerge(clsx(`border rounded-md relative flex flex-row justify-between items-stretch box-border overflow-hidden`,border,h))}>
            {prefix && <div className={'flex flex-col justify-center px-3 bg-gray-100 flex-shrink-0'}>
                {prefix}
            </div>}
            <div className={'relative flex-1 flex flex-row items-stretch overflow-hidden'}>
                <Element ref={elementRef}
                         {...others}
                         // placeholder={ph}
                         value={onChange ? (value || '') : value}
                         onBlur={onBlur}
                         onChange={onChange}
                         className={`peer flex-1 w-auto border-none bg-transparent focus:outline-none appearance-none px-3 peer-placeholder-shown:text-xs placeholder-shown:pt-0 ${(float && !!value) ? `pt-5` : ''}`}>
                    {children}
                </Element>
                {float && <div
                    className={floatClassName}>
                    {ph}
                </div>}
            </div>
            {suffix && <div
                className={`flex flex-col justify-center items-center px-3 flex-shrink-0 box-border ${suffixClassName||''}`}>
                {suffix}
            </div>}
            {validating && <div className={'absolute inset-y-0 right-1.5 flex flex-col justify-center items-center bg-transparent'}>
                <Loading />
            </div>}
        </div>
        {hasError && <div className={'flex flex-col p-1 text-sm'}>
            {errors.map((error,i) => {
                return <div className={'text-red-500'} key={`error-${i}`}>{error}</div>
            })}
        </div>}
    </div>
};


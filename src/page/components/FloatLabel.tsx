import {DetailedHTMLProps, FC, ReactNode} from "react";
import {clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export type FloatLabelProps = {
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
};

export const FloatLabel: FC<FloatLabelProps> = (props) => {
    const {placeholder : ph,children,prefix,suffix,
        suffixClassName,
        element : Element = 'input',className,size='default',float = true,
        onChange,value,onBlur,
        errors,warnings,
    } = props;
    const h : any = {
        'sm' : 'h-[40px]',
        'default' : 'h-[46px]',
        'large' : 'h-[52px]',
    }[size];
    const hasError = errors && errors.length > 0;
    const border :any = hasError ? ['border-red-300'] : ['border-slate-300','focus-within:border-indigo-500'];
    return <div className={`flex flex-col ${className || ''}`}>
        <div className={twMerge(clsx(`border rounded-md relative flex flex-row justify-between items-stretch box-border overflow-hidden`,border,h))}>
            {prefix && <div className={'flex flex-col justify-center px-3 bg-gray-100 flex-shrink-0'}>
                {prefix}
            </div>}
            <div className={'relative flex-1 flex flex-row items-stretch overflow-hidden'}>
                <Element placeholder={ph}
                         value={onChange ? (value || '') : value}
                         onBlur={onBlur}
                         onChange={onChange}
                         className={`peer flex-1 w-auto border-none bg-transparent focus:outline-none appearance-none px-3 peer-placeholder-shown:text-xs placeholder-shown:pt-0 ${float ? `pt-5` : ''}`}>
                    {children}
                </Element>
                {float && <div
                    className={'flex-nowrap text-nowrap absolute top-1 peer-placeholder-shown:hidden flex text-sm px-3 text-neutral-400 select-none'}>
                    {ph}
                </div>}
            </div>
            <div
                className={`flex flex-col justify-center items-center px-3 flex-shrink-0 box-border ${suffixClassName}`}>
                {suffix}
            </div>
        </div>
        {hasError && <div className={'p-1 text-sm'}>
            {errors.map((error,i) => {
                return <div className={'text-red-500'} key={`error-${i}`}>{error}</div>
            })}
        </div>}
    </div>
};


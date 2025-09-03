import {FC, useEffect, useMemo, useRef, useState} from "react";
import {toNumber, isNaN, debounce} from "lodash-es";
import {cn} from "@lib/cn";

export type InputNumberProps = {
    value ?: number;
    onChange ?: (value : number)=>void;
    min ?: number;
    max ?: number;
    size ?: 'mini' | 'base',
    className ?: string;
    name ?: string;
};


export const InputNumber: FC<InputNumberProps> = (props) => {
    const {name,className,value= 1,size = 'base',max = Number.MAX_SAFE_INTEGER,min = Number.MIN_SAFE_INTEGER,onChange,...others} = props;
    const svgClassName = cn('text-current',{
        'size-3' : size === 'base',
        'size-2' : size === 'mini',
    });
    const MinusClassName = cn("hover:bg-gray-200 border border-gray-300 p-3 h-11 focus:ring-gray-100 focus:ring-2 focus:outline-none",{
        'cursor-not-allowed text-gray-300': value===min,
        'p-3 h-11'  : size === 'base',
        'p-1 h-6'  : size === 'mini',
    });
    const PlusClassName = cn("border border-gray-300 focus:ring-gray-100  focus:ring-2 focus:outline-none",{
        'cursor-not-allowed text-gray-300': value===max,
        'p-3 h-11'  : size === 'base',
        'p-1 h-6'  : size === 'mini',
    });
    const InputClassName = cn("border-x-0 border rounded-none border-gray-300 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block  ",{
        'w-full py-2.5 h-11' : size === 'base',
        "max-w-[46px] py-1 h-6": size === 'mini',
    });
    return <div className={cn("relative flex items-center max-w-[8rem]",className)}>
        <button type="button" data-input-counter-decrement="quantity-input"
                title={'decrease'}
                disabled={value === min}
                onClick={() => {
                    onChange?.(Math.max(value - 1,min))
                }}
                className={MinusClassName}>
            <svg className={svgClassName} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                 fill="none" viewBox="0 0 18 2">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M1 1h16"/>
            </svg>
        </button>
        <input type="text"
               value={value}
               name={name}
               onChange={(e) => {
                   const value = toNumber(e.target.value);
                   if(!isNaN(value)) {
                       if (value <= max && value >= min){
                           onChange?.(value);
                        }
                   }
               }}
               aria-describedby="helper-text-explanation"
               className={InputClassName}
               placeholder="999" required/>
        <button type="button" data-input-counter-increment="quantity-input"
                title={"increase"}
                disabled={value === max}
                onClick={() => {
                    onChange?.(Math.min(value + 1,max))
                }}
                className={PlusClassName}>
            <svg className={svgClassName} aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                 fill="none" viewBox="0 0 18 18">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 1v16M1 9h16"/>
            </svg>
        </button>
    </div>
};

export type UncontrolledInputNumberProps = Omit<InputNumberProps,'value'> & {
    defaultValue : number;
};

export const UncontrolledInputNumber : FC<UncontrolledInputNumberProps> = (props) => {
    const {defaultValue,onChange,...others} = props;
    const [value,setValue] = useState(defaultValue || 1);
    const onValueChange = useMemo(() => {
        return onChange && debounce(onChange,500);
    },[onChange]);
    const valueRef = useRef(value);
    valueRef.current = value;
    useEffect(() => {
        if(defaultValue !== valueRef.current){
            setValue(defaultValue);
        }
    }, [defaultValue]);
    return  <InputNumber
        {...others}
        value={value}
        onChange={(v) => {
            setValue(v);
            onValueChange?.(v);
        }}
    />
};

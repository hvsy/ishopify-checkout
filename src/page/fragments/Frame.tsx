import {FC, ReactNode} from "react";
import clsx from "clsx";
import {twMerge} from "tailwind-merge";

export type FrameProps = {
    children : ReactNode;
    header ?: ReactNode;
    right ?: ReactNode;
    rightBottom?:ReactNode;
};

//0为全屏滚动, 1为左边滚动,右边内容固定不动但滚动条在左边
const mode: number = 0;
export const Frame: FC<FrameProps> = (props) => {
    const {children,header,right,rightBottom} = props;
    return <div className={clsx(
        `min-h-[100vh]  flex flex-col items-stretch sm:flex sm:flex-row sm:items-stretch sm:mx-auto overflow-auto`, {
            'sm:max-h-[100vh] sm:overflow-hidden': mode !== 0
        }
    )}>
        {header}
        <div
            className={clsx(`flex flex-col-reverse sm:flex-row items-stretch sm:flex-1 sm:divide-x divide-neutral-300`, {
                'overflow-auto': mode === 2,
            })}>
            <div
                className={clsx('w-full  sm:w-[54.5%] pt-2 sm:pt-10 flex flex-row sm:justify-end p-3 sm:p-6 sm:p-2 lg:pr-12', {
                    'sm:max-h-[100vh] sm:overflow-auto': mode === 1
                })}>
                {children}
            </div>
            <div className={clsx(`flex flex-col w-full sm:w-[45.5%] bg-neutral-50 sm:pt-16 sm:p-2 lg:pl-12 relative overflow-hidden`,
                {
                    'sm:max-h-[100vh]': mode !== 0,
                }
            )}>
                <div  className={twMerge(clsx({
                    'absolute left-12 top-16 bottom-0': mode === 2,
                }))}>
                    {right}
                </div>
                {rightBottom}
            </div>
        </div>
    </div>;
};

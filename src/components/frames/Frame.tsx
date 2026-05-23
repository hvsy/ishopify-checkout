import {FC, ReactNode, useMemo} from "react";
import clsx from "clsx";
import {twMerge} from "tailwind-merge";
import {useIsMounted, useWindowSize} from "usehooks-ts";
import {createPortal} from "react-dom";
import {getMetaContent} from "@lib/metaHelper.ts";
import {PolicyDialog} from "../../shopify/checkouts/fragments/PolicyDialog.tsx";

export type FrameProps = {
    children : ReactNode;
    header ?: ReactNode;
    right ?: ReactNode;
    rightBottom?:ReactNode;
};

const FrameHeader : FC<any> = (props) => {
    const {children} = props;
    const size = useWindowSize({
        initializeWithValue : true,
    });
    const id = size.width <= 640 ?  'frame-header' : 'left-header'
    const mounted = useIsMounted();
    const element = useMemo(() => {
        return document.getElementById(id);
    },[id,mounted()]);
    if(!element) return null;
    return createPortal(children,element,id);
}

//0为全屏滚动, 1为左边滚动,右边内容固定不动但滚动条在左边
const mode: number = 0;
export const Frame: FC<FrameProps> = (props) => {
    const {children,header,right,rightBottom} = props;
    const logoHeight= parseFloat(getMetaContent('logo_height'));
    const logHeightNumber = isNaN(logoHeight) ? 0 : logoHeight;
    return <div className={clsx(
        `min-h-[100vh]  flex flex-col items-stretch sm:flex sm:flex-row sm:items-stretch sm:mx-auto overflow-auto`, {
            'sm:max-h-[100vh] sm:overflow-hidden': mode !== 0
        }
    )}>
        {!!header && <div id={'frame-header'}
                          className={'sm:hidden max-h-[64px] my-2 flex flex-col items-stretch space-y-4 overflow-hidden'}
                          style={{
                              height : (logHeightNumber > 64 ? 64 :logHeightNumber) || 'auto',
                          }}
        ></div>}
        <div
            className={clsx(`flex flex-col-reverse sm:flex-row items-stretch sm:flex-1 sm:divide-x divide-neutral-300`, {
                'overflow-auto': mode === 2,
            })}>
            <div
                className={clsx('w-full  sm:w-[54.5%] pt-2 sm:pt-10 flex flex-row sm:justify-end p-3 sm:p-6 lg:pr-12', {
                    'sm:max-h-[100vh] sm:overflow-auto': mode === 1
                })}>
                <div className={'flex flex-col flex-1 items-stretch space-y-6 sm:max-w-[638px]'}>
                    {!!header && <div id={'left-header'}
                                      style={{
                                          height : (logHeightNumber > 64 ? 64 :logHeightNumber) || 'auto',
                                      }}
                                      className={'hidden sm:flex max-h-[64px] mb-3 flex-col items-stretch space-y-4 overflow-hidden'}>
                    </div>}
                    {children}
                    <PolicyDialog />
                </div>
            </div>
            <div className={clsx(`flex flex-col w-full sm:w-[45.5%] bg-neutral-50 sm:pt-16 sm:p-8 lg:pl-12 relative overflow-hidden`,
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
        <FrameHeader>
            {header}
        </FrameHeader>
    </div>;
};

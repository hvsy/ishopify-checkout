import {FC, useState} from "react";
import {getMetaContent} from "@lib/metaHelper.ts";
import {Skeleton} from "@components/ui/Skeleton.tsx";
import {Policy} from "./Policy.tsx";
import dayjs from "dayjs";

import {DialogHeader,Dialog, DialogContent, DialogTitle} from "@components/ui/dialog.tsx";
export type PolicyDialogProps = {};

export const PolicyDialog: FC<PolicyDialogProps> = (props) => {
    const {} = props;
    const title = getMetaContent('shop_title');
    const [showPolicy,setShowPolicy] = useState(false);
    return <>
        <div className={'border-t border-gray-300 pb-4'}></div>
        {import.meta.env.VITE_SKELETON ?<Skeleton className={'max-w-32 min-w-10 min-h-4'} /> :<div className={'pl-2 text-xs flex flex-col gap-[.5rem] !mt-0'}>
             <span
                 className={'cursor-pointer hover:underline'}
                 onClick={() => setShowPolicy(true)}
             >
                Privacy policy
            </span>
            <span>© {dayjs().format('YYYY')},{title} Powered by Shopify</span>
        </div>}
        <Dialog open={showPolicy} onOpenChange={setShowPolicy}>
            <DialogContent className="max-w-4xl p-0 rounded-xl">
                <DialogHeader>
                    <DialogTitle className={'py-2'}>Privacy policy</DialogTitle>
                </DialogHeader>
                <div className="px-6">
                    <Policy />
                </div>
            </DialogContent>
        </Dialog>
    </>;
};

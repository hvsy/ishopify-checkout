import {FC} from "react";
import {Link, LinkProps} from "react-router-dom";
import {ChevronLeft} from "lucide-react";
import {AsyncButton} from "../fragments/AsyncButton.tsx";

export type FooterFrameProps = {
    back ?: {
        to : LinkProps['to'];
        reload ?: boolean;
        label ?: string;
    },
    next ?:{
        onClick ?: ()=>Promise<any>,
        label ?: string;
        pulsing ?: boolean;
    }
};

export const FooterFrame: FC<FooterFrameProps> = (props) => {
    const {back,next} = props;
    return <div className={'flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center'}>
        {back && <Link className={'text-sm space-x-2 flex flex-row mt-8 sm:mt-0 justify-center items-center cursor-pointer'}
              to={back.to}
              reloadDocument={back.reload || false}
        >
            <ChevronLeft size={'16px'}/>
            <div>Return to {back?.label}</div>
        </Link>}
        <AsyncButton onClick={next?.onClick}  pulsing={next?.pulsing || false}>
            {next?.label}
        </AsyncButton>
    </div>;
};

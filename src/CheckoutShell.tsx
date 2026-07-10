import {FC, useEffect} from "react";
import {Outlet, useSearchParams} from "react-router-dom";
import {useRemoveAppLoader} from "@hooks/useRemoveAppLoader.tsx";

export type CheckoutShellProps = {};

export const CheckoutShell: FC<CheckoutShellProps> = (props) => {
    const {} = props;
    const [searchParams, setSearchParams] = useSearchParams();
    useRemoveAppLoader();
    useEffect(() => {
        if (searchParams.has("direct")) {
            const next = new URLSearchParams(searchParams);
            next.delete("direct");
            setSearchParams(next, {
                replace: true,
            });
        }
    }, []);
    return <Outlet />;
};

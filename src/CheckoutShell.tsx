import {FC} from "react";
import {Outlet} from "react-router-dom";
import {useRemoveAppLoader} from "@hooks/useRemoveAppLoader.tsx";

export type CheckoutShellProps = {};

export const CheckoutShell: FC<CheckoutShellProps> = () => {
    useRemoveAppLoader();
    return <Outlet />;
};

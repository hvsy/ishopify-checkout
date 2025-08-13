import {FC} from "react";

export type PaymentTipProps = {};

export const PaymentTip: FC<PaymentTipProps> = (props) => {
    const {} = props;
    return <div className={'p-4 flex flex-1 flex-col justify-center items-center text-slate-600'}>
        <img
            className={'h-28 w-40'}
            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0yNTIuMyAzNTYuMSAxNjMgODAuOSIgY2xhc3M9ImVIZG9LIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0tMTA4LjkgNDA0LjF2MzBjMCAxLjEtLjkgMi0yIDJILTIzMWMtMS4xIDAtMi0uOS0yLTJ2LTc1YzAtMS4xLjktMiAyLTJoMTIwLjFjMS4xIDAgMiAuOSAyIDJ2MzdtLTEyNC4xLTI5aDEyNC4xIj48L3BhdGg+PGNpcmNsZSBjeD0iLTIyNy44IiBjeT0iMzYxLjkiIHI9IjEuOCIgZmlsbD0iY3VycmVudENvbG9yIj48L2NpcmNsZT48Y2lyY2xlIGN4PSItMjIyLjIiIGN5PSIzNjEuOSIgcj0iMS44IiBmaWxsPSJjdXJyZW50Q29sb3IiPjwvY2lyY2xlPjxjaXJjbGUgY3g9Ii0yMTYuNiIgY3k9IjM2MS45IiByPSIxLjgiIGZpbGw9ImN1cnJlbnRDb2xvciI+PC9jaXJjbGU+PHBhdGggZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJNLTEyOC43IDQwMC4xSC05Mm0tMy42LTQuMSA0IDQuMS00IDQuMSI+PC9wYXRoPjwvc3ZnPgo="
            alt=""/>
        <div className={'text-sm text-center'}>
            After clicking “Complete order”, you will be redirected to payment page to complete your purchase securely.
        </div>
    </div>;
};

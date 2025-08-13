import {FC, useCallback, useEffect, useRef, useState,} from "react";
import {api} from "@lib/api.ts";
import {useScript} from "usehooks-ts";

export type AsiaBillProps = {
    session: string;
    sdk : string;
};

let st = {
    frameMaxHeight: 100, //  iframe高度
    input: {
        FontSize: '16', // 输入框字体大小
        FontFamily: 'Arial', // 输入框字体类型
        FontWeight: '400', // 输入框字体粗细
        BorderRadius: '10px', // 输入框圆角
        Color: '#333', // 输入框字体颜色
        ContainerBorder: '1px solid #d9d9d9', // 输入框边框
        ContainerPadding: '10px 10px', // 输入框内边距
        ContainerBg: '#fff', // 输入框背景色
        ContainerSh: 'none' // 输入框阴影
    },
    // 需要展示背景区域时可，自定义的样式
    background: {
        FontSize: '14', // 背景区域字体大小
        FontFamily: 'Arial', // 背景字体类型
        FontWeight: '600', // 背景字体粗细
        Color: '#333', // 背景字体颜色
        BgColor: '#fff', // 背景颜色
        Width: '100%', // 背景宽度
        Height: 'auto', // 背景高度
        BgPadding: '20px', // 背景内边距
        BorderRadius: '10px', // 背景圆角
        TextIndent: '10px', // 背景文本缩进
        LineHeight: '24px', // 背景文本行高
        BoxShadow: 'none' // 背景阴影
    }
};
let formID = 'payment-form';
let p = {
    formId: formID, // 页面表单id
    formWrapperId: 'ab-card-element', // 表单内层id
    frameId: 'PrivateFrame', // 生成的IframeId
    lang: 'en', // 表单校验信息国际化参数，目前支持ar(阿拉伯语),ja(日语),ko(韩语),en(英语),zh-CN(简体中文)；不传时如果当前浏器语言为日语、韩语、英语和简体中文中的一种，则会显示该种语言；否则默认展示英语
    needCardList: true,
    autoValidate: true, // 是否自动展示校验错误信息， 目前支持在表单提交事件或提交按钮点击事件中触发信息校验，false时监听`getErrorMessage`事件获取错误信息
    // supportedCards: ['visa', 'jcb', 'unionPay', 'ae', 'master', 'discover'], // 传入时，显示商户支持的卡种类型logo
    layout: {
        pageMode: 'block', // 页面风格模式  inner | block
        style: st
    }
};
export const AsiaBillForm : FC<any>= (props)=> {
    const {session} = props;
    const [paying, setPaying] = useState(false);
    const abRef = useRef<any>(null);
    const submit = useCallback(() => {
        if (paying) return;
        setPaying(true);
        let paymentMethodObj = {};
        abRef.current?.confirmPaymentMethod({
            apikey: session,
            trnxDetail: {
                billingDetail: paymentMethodObj,
            }
        }).then((result: any) => {
            let r = result;
            if (r.data.code === "0" && r.data.message === 'success') {
                const methodId = r.data.data.customerPaymentMethodId;
                api({
                    method: 'post',
                    data: {
                        methodId,
                    }
                }).then((res: any) => {
                    if (res.url) {
                        if (window?.top) {
                            window.top.location.href = res.url;
                        }
                    } else {
                        window?.parent.postMessage({event: "payment_failed", "msg": res.message}, '*');
                    }
                })
                // your code
            } else {
                console.log(r.data.message);
                window?.parent.postMessage({event: "payment_failed", "msg": r.data.message}, '*');
            }
        }, (error: any) => {
            window?.parent.postMessage({event: "payment_failed", "msg": error + ''}, '*');
        }).finally(() => {
            setPaying(false);
        });
    }, []);
    useEffect(() => {
        let ab = (window as any).AsiabillPay(session);
        ab.elementInit("payment_steps", p).then((res: any) => {
            // 初始化成功后，商户可以在此区域执行其他操作。
            // 例如，不需要sdk自带的支付方式列表效果时,获取列表内容后可自定义展示效果。
            console.log("initRES", res)
        }).catch(function (err: any) {
            console.log("initERR", err)
        });
        abRef.current = ab;
    }, [session]);
    return <form id="payment-form" onSubmit={submit}>
        <div id="ab-card-element" className="ab-element">
        </div>
        <button id="ab_submit" type="submit" style={{
            display: 'none',
        }}>Pay Now
        </button>
    </form>
}
export const AsiaBill: FC<AsiaBillProps> = (props) => {
    const {session,sdk} = props;
    const src = sdk.replace('https:', '');
    const loaded = useScript(src,{
        removeOnUnmount : false,
        id : 'ab',
    });
    return <div className="form-wrap">
            {loaded && <AsiaBillForm session={session}/>}
    </div>

}


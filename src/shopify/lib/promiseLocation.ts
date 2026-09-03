export function PromiseLocation(location: string) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                reject(new Error(`Redirect timed out: ${location}`));
            }
        }, 15000);
        // 页面成功跳转后页面即将卸载，此时取消超时避免误报“跳转失败”。
        window.addEventListener('pagehide', () => {
            settled = true;
            clearTimeout(timer);
        }, {once: true});
        console.log("redirect to:" + location);
        window.location.href = location;
    });
}

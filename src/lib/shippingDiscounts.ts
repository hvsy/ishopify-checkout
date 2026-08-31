import {get as _get} from "lodash-es";
import Big from "big.js";

/**
 * 运费折扣分配（cart.discountAllocations 弃用后的替代位置）：
 * - GetDeliveryGroups 查询：cart.deliveryGroups[].discountAllocations
 * - Summary 查询：cart.deliveryGroups[].discountAllocations
 *
 * 优先使用 GetDeliveryGroups(groups) 的数据（切国家/改地址后会 refetch，
 * 货币与金额最新）；groups 里没有时回退到 Summary 查询的缓存数据
 * （优惠券 mutation 会直接写回 Summary 的 deliveryGroups 字段，更新即时）。
 */
export function getShippingAllocations(groups : any[] | undefined, summary : any){
    const fromGroups = (groups || []).flatMap((group : any) => {
        return _get(group,'discountAllocations',[]);
    });
    const fromSummary = _get(summary,'cart.deliveryGroups.edges',[]).flatMap((edge : any) => {
        return _get(edge,'node.discountAllocations',[]);
    });
    const allocations = fromGroups.length ? fromGroups : fromSummary;
    return allocations.filter((allocation : any) => {
        return allocation?.targetType === 'SHIPPING_LINE';
    });
}

export function getShippingDiscountAmount(groups : any[] | undefined, summary : any){
    return getShippingAllocations(groups,summary).reduce((total : Big, allocation : any) => {
        const amount = allocation?.discountedAmount?.amount;
        return amount ? total.add(amount) : total;
    },Big(0));
}

/**
 * 运费折扣的配置比例（sourceDiscountApplication.value.PricingPercentageValue.percentage）。
 * 折扣码的 sourceDiscountApplication.value 才是"配置值"（如 100 = 免邮费），
 * 而 discountedAmount 只是当前选中快递方式实际分摊到的金额，不能用来折算
 * 其他快递方式的价格。没有百分比配置时返回 0（调用方可回退到固定金额扣除）。
 */
export function getShippingDiscountRate(groups : any[] | undefined, summary : any){
    const allocations = getShippingAllocations(groups,summary);
    for (const allocation of allocations) {
        const percentage = _get(allocation,'sourceDiscountApplication.value.percentage');
        if (percentage !== undefined && percentage !== null && Number(percentage) > 0) {
            return Number(percentage) / 100;
        }
    }
    return 0;
}

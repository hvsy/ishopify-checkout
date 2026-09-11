/**
 * 账单表单里能从收货地址复制的字段（与 AddressForm 的 field 名一致）。
 *
 * 单开一个模块而不是放在 BillAddress.tsx 里：后者只导出组件，
 * 混着导出常量会触发 react-refresh/only-export-components 警告。
 */
export const BILLING_FIELDS = [
    'region_code',
    'region',
    'state_code',
    'state',
    'first_name',
    'last_name',
    'line1',
    'line2',
    'city',
    'zip',
];

export type BillingValues = Record<string, unknown>;

/**
 * 存在 rc-form store 里的两个"非表单字段"（表单没有注册同名 Field，不会被渲染，也不会进
 * billingOfForm / 指纹 / 镜像）。放 store 而不是组件 state/ref：BillingAddressStep 会随
 * 支付方式切换卸载重挂载，只有 store（挂在 FormContainer 的表单实例上）能活过重挂载。
 */
/** 用户的复选框选择（true = 与收货地址相同），重挂载后据此恢复 */
export const BILLING_CHECKED_KEY = 'billing_same_as_shipping';
/** 勾选前用户自己填的账单备份，取消勾选时还回去 */
export const BILLING_BACKUP_KEY = 'billing_address_backup';

/**
 * 从地址对象里挑出账单字段，丢掉空值，并**保留原始类型**。
 *
 * 两个要点：
 * 1. 丢空值：AddressForm 的字段可能留下 {city:'', line1:'', …} 的空壳（preserve=false 时
 *    卸载会复位成初始值），按"有键"判断会把空壳当成已有账单；而 `billingOfForm({})` 还会算出
 *    "全空但真值"的投影，一次 PUT 就把库里已存的账单覆盖成空值。
 * 2. 保留类型：`region` / `state` 是 zones 里的**对象**，绝不能 String() 成 "[object Object]"
 *    —— 实测那样会让 AddressForm 认为地区无效，挂载时把省份重置成第一个选项
 *    （billing 显示 BFP 而 shipping 是 SCOTLAND）。
 */
export function pickBillingValues(source: Record<string, unknown> | null | undefined): BillingValues | null {
    if (!source || typeof source !== 'object') return null;
    const out: BillingValues = {};
    for (const field of BILLING_FIELDS) {
        const value = source[field];
        if (value === undefined || value === null) continue;
        if (typeof value === 'string') {
            const text = value.trim();
            if (text === '') continue;
            out[field] = text;
            continue;
        }
        out[field] = value;
    }
    return Object.keys(out).length > 0 ? out : null;
}

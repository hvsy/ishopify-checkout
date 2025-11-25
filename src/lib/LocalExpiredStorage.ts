import dayjs from "dayjs";

interface SetItemOptions {
    maxAge?: number; // 从当前时间往后多长时间过期
    expired?: number; // 过期的准确时间点，优先级比maxAge高
}

class LocalExpiredStorage {
    private prefix = "local-expired-"; // 用于跟没有过期时间的key进行区分

    constructor(prefix?: string) {
        if (prefix) {
            this.prefix = prefix;
        }
    }

    // 设置数据
    setItem(key: string, value: any, options?: SetItemOptions) {
        const now = Date.now();
        let expired = now + 1000 * 60 * 60 * 3; // 默认过期时间为3个小时

        // 这里我们限定了 expired 和 maxAge 都是 number 类型，
        // 您也可以扩展支持到 string 类型或者如 { d:2, h:3 } 这种格式
        if (options?.expired) {
            expired = options?.expired;
        } else if (options?.maxAge) {
            expired = now + options.maxAge;
        }

        // 我们这里用了 dayjs 对时间戳进行格式化，方便快速识别
        // 若没这个需要，也可以直接存储时间戳，减少第三方类库的依赖
        localStorage.setItem(
            `${this.prefix}${key}`,
            JSON.stringify({
                value,
                start: dayjs().format("YYYY/MM/DD hh:mm:ss"), // 存储的起始时间
                expired: dayjs(expired).format("YYYY/MM/DD hh:mm:ss"), // 存储的过期时间
            })
        );
    }

    getItem(key: string): any {
        const result = localStorage.getItem(`${this.prefix}${key}`);
        if (!result) {
            // 若key本就不存在，直接返回null
            return result;
        }
        const { value, expired } = JSON.parse(result);
        if (Date.now() <= dayjs(expired).valueOf()) {
            // 还没过期，返回存储的值
            return value;
        }
        // 已过期，删除该key，然后返回null
        this.removeItem(key);
        return null;
    }

    // 删除key
    removeItem(key: string) {
        localStorage.removeItem(`${this.prefix}${key}`);
    }

    // 清除所有过期的key
    clearAllExpired() {
        let num = 0;

        // 判断 key 是否过期，然后删除
        const delExpiredKey = (key: string, value: string | null) => {
            if (value) {
                // 若value有值，则判断是否过期
                const { expired } = JSON.parse(value);
                if (Date.now() > dayjs(expired).valueOf()) {
                    // 已过期
                    localStorage.removeItem(key);
                    return 1;
                }
            } else {
                // 若 value 无值，则直接删除
                localStorage.removeItem(key);
                return 1;
            }
            return 0;
        };

        const { length } = window.localStorage;
        const now = Date.now();

        for (let i = 0; i < length; i++) {
            const key = window.localStorage.key(i);

            if (key?.startsWith(this.prefix)) {
                // 只处理我们自己的类创建的key
                const value = window.localStorage.getItem(key);
                num += delExpiredKey(key, value);
            }
        }
        return num;
    }
}
const localExpiredStorage = new LocalExpiredStorage();
export default localExpiredStorage;

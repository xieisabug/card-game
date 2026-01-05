/**
 * EffectRegistry - Effect 类型注册和管理
 */
class EffectRegistry {
    constructor() {
        this.effectTypes = new Map();  // effectType -> Effect 类
    }

    /**
     * 注册效果类型
     * @param {string} type - 效果类型名
     * @param {class} EffectClass - 效果类
     */
    registerEffectType(type, EffectClass) {
        this.effectTypes.set(type, EffectClass);
    }

    /**
     * 获取效果类
     * @param {string} type - 效果类型名
     * @returns {class|null}
     */
    getEffectType(type) {
        return this.effectTypes.get(type) || null;
    }

    /**
     * 从配置创建效果实例
     * @param {object} config - 效果配置
     * @returns {BaseEffect}
     */
    createEffect(config) {
        const EffectClass = this.effectTypes.get(config.type);
        if (!EffectClass) {
            console.warn(`Unknown effect type: ${config.type}`);
            return null;
        }

        return new EffectClass(config);
    }

    /**
     * 批量创建效果
     * @param {Array} configs - 效果配置数组
     * @returns {Array<BaseEffect>}
     */
    createEffects(configs) {
        if (!configs || !Array.isArray(configs)) return [];
        return configs.map(config => this.createEffect(config)).filter(e => e !== null);
    }

    /**
     * 检查效果类型是否已注册
     * @param {string} type - 效果类型名
     * @returns {boolean}
     */
    hasEffectType(type) {
        return this.effectTypes.has(type);
    }

    /**
     * 获取所有已注册的效果类型
     * @returns {string[]}
     */
    getRegisteredTypes() {
        return Array.from(this.effectTypes.keys());
    }
}

module.exports = EffectRegistry;

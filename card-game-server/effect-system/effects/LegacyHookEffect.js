const BaseEffect = require('./BaseEffect');
const { legacyCardEffects } = require('../legacy-card-effects');

/**
 * LegacyHookEffect
 * 允许在 Effect 配置中调用旧版函数式卡牌效果
 */
class LegacyHookEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "LegacyHook";
    }

    execute(context) {
        const { handler } = this.params;
        const fn = legacyCardEffects[handler];

        if (typeof fn === 'function') {
            fn(context);
        } else {
            console.warn(`[LegacyHookEffect] handler not found: ${handler}`);
        }
    }
}

module.exports = LegacyHookEffect;

/**
 * BaseEffect - 效果基类
 * 所有具体效果类型都继承自此类
 */
class BaseEffect {
    constructor(config) {
        this.type = config.type;
        this.params = config.params || {};
        this.conditions = config.conditions || [];
        this.target = config.target || { type: "self" };
        this.animation = config.animation !== false;  // 默认播放动画
    }

    /**
     * 检查效果是否可以执行
     * @param {object} context - 执行上下文
     * @returns {boolean}
     */
    canExecute(context) {
        if (!this.conditions || this.conditions.length === 0) {
            return true;
        }
        return context.conditionEvaluator.evaluateAll(this.conditions, context);
    }

    /**
     * 执行效果
     * @param {object} context - 执行上下文
     * @param {Array} targets - 目标列表
     */
    execute(context, targets) {
        throw new Error("Must be implemented by subclass");
    }

    /**
     * 获取效果描述文本
     * @returns {string}
     */
    getDescription() {
        return this.type;
    }

    /**
     * 添加 buff 记录
     */
    _addBuff(card, buffType, value, source) {
        if (!card.buffList) card.buffList = [];
        const sourceRef = source && typeof source === "object"
            ? { id: source.id, k: source.k, name: source.name }
            : source;
        card.buffList.push({
            type: buffType,
            value: value,
            from: sourceRef
        });
    }

    /**
     * 播放 buff 动画
     */
    _playBuffAnimation(context, target) {
        if (this.animation && context.specialMethod) {
            context.specialMethod.buffCardAnimation(
                true,
                -1,
                -1,
                context.thisCard,
                target
            );
        }
    }

    /**
     * 刷新游戏数据
     */
    _refreshGameData(context) {
        if (context.specialMethod) {
            context.specialMethod.refreshGameData();
        }
    }
}

module.exports = BaseEffect;

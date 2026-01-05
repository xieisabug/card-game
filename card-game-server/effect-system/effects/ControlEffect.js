/**
 * ControlEffect - 控制效果
 * 用于条件效果、随机效果、重复效果等
 */
const BaseEffect = require('./BaseEffect');

class ConditionalEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ConditionalEffect";
    }

    execute(context, targets) {
        const {
            ifTrue,   // 条件为真时执行的效果
            ifFalse   // 条件为假时执行的效果
        } = this.params;

        // 评估条件
        const conditionMet = context.conditionEvaluator.evaluateAll(this.conditions, context);

        if (conditionMet && ifTrue) {
            this._executeEffects(ifTrue, context, targets);
        } else if (!conditionMet && ifFalse) {
            this._executeEffects(ifFalse, context, targets);
        }
    }

    _executeEffects(effects, context, targets) {
        effects.forEach(effectConfig => {
            const effect = context.effectRegistry.createEffect(effectConfig);
            if (effect) {
                // 解析目标
                const effectTargets = context.targetResolver.resolve(effectConfig.target, context);
                effect.execute(context, effectTargets);
            }
        });
    }

    getDescription() {
        const { ifTrue, ifFalse } = this.params;
        if (ifFalse) {
            return "条件效果（根据条件执行不同效果）";
        }
        return "条件效果";
    }
}

/**
 * RandomEffect - 随机效果
 * 随机选择执行其中一个效果
 */
class RandomEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "RandomEffect";
    }

    execute(context, targets) {
        const {
            effects,     // 效果列表
            weights,     // 权重（可选）
            mode = "one" // one: 选一个执行, all: 按权重随机执行多个
        } = this.params;

        if (!effects || effects.length === 0) return;

        if (mode === "one") {
            // 随机选择一个效果执行
            const rand = context.specialMethod?.rand() || Math.random();
            const index = Math.floor(rand * effects.length);
            const selectedEffect = effects[index];

            const effect = context.effectRegistry.createEffect(selectedEffect);
            if (effect) {
                const effectTargets = context.targetResolver.resolve(selectedEffect.target, context);
                effect.execute(context, effectTargets);
            }
        } else if (mode === "weighted") {
            // 按权重随机执行
            const totalWeight = weights?.reduce((a, b) => a + b, 0) || effects.length;
            const rand = context.specialMethod?.rand() || Math.random();
            const cumulative = rand * totalWeight;

            let current = 0;
            for (let i = 0; i < effects.length; i++) {
                current += (weights?.[i] || 1);
                if (current >= cumulative) {
                    const effect = context.effectRegistry.createEffect(effects[i]);
                    if (effect) {
                        const effectTargets = context.targetResolver.resolve(effects[i].target, context);
                        effect.execute(context, effectTargets);
                    }
                    break;
                }
            }
        }
    }

    getDescription() {
        return "随机效果";
    }
}

/**
 * RepeatEffect - 重复效果
 * 重复执行某个效果多次
 */
class RepeatEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "RepeatEffect";
    }

    execute(context, targets) {
        const {
            effect,           // 要重复执行的效果配置
            count = 2,        // 重复次数
            countSource       // 动态计数来源
        } = this.params;

        let repeatCount = count;

        // 如果有动态计数来源
        if (countSource) {
            repeatCount = this._getCount(countSource, context);
        }

        for (let i = 0; i < repeatCount; i++) {
            const effectObj = context.effectRegistry.createEffect(effect);
            if (effectObj) {
                const effectTargets = context.targetResolver.resolve(effect.target, context);
                effectObj.execute(context, effectTargets);
            }
        }
    }

    _getCount(countSource, context) {
        if (typeof countSource === "number") return countSource;

        const { type, filter } = countSource;

        if (type === "myTable") {
            return context.myGameData.tableCards?.length || 0;
        } else if (type === "otherTable") {
            return context.otherGameData.tableCards?.length || 0;
        } else if (type === "tableCardCount") {
            const allCards = [
                ...(context.myGameData.tableCards || []),
                ...(context.otherGameData.tableCards || [])
            ];
            return allCards.length;
        }

        return countSource || 1;
    }

    getDescription() {
        const { count = 2 } = this.params;
        return `重复${count}次`;
    }
}

/**
 * ForEachEffect - 遍历效果
 * 对每个目标执行效果
 */
class ForEachEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ForEachEffect";
    }

    execute(context, targets) {
        const {
            source,           // 源目标列表
            effect            // 对每个目标执行的效果
        } = this.params;

        // 获取源目标
        const sourceTargets = context.targetResolver.resolve(source, context);

        // 对每个源目标执行效果
        sourceTargets.forEach(sourceTarget => {
            // 创建新的上下文，包含当前源目标
            const effectContext = {
                ...context,
                currentTarget: sourceTarget,
                chooseCard: sourceTarget
            };

            const effectObj = context.effectRegistry.createEffect(effect);
            if (effectObj) {
                // 效果目标设为当前源目标
                const effectTargets = [sourceTarget];
                effectObj.execute(effectContext, effectTargets);
            }
        });
    }

    getDescription() {
        return "遍历执行效果";
    }
}

module.exports = {
    ConditionalEffect,
    RandomEffect,
    RepeatEffect,
    ForEachEffect
};

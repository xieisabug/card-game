/**
 * DamageEffect - 伤害效果
 * 用于对目标造成伤害
 */
const BaseEffect = require('./BaseEffect');
const { BuffType } = require('../../constants');

class DamageEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "Damage";
    }

    execute(context, targets) {
        const {
            amount,                 // 伤害值
            ignoreStrong = false,   // 是否忽略坚强效果
            damageType = "normal"   // 伤害类型: normal, spell
        } = this.params;
        const { tagRegistry, specialMethod, thisCard } = context;

        targets.forEach(target => {
            // 处理英雄目标
            if (target._isHero) {
                target.gameData.life = (target.gameData.life || 0) - amount;
                return;
            }

            // 检查坚强 Tag
            if (!ignoreStrong && tagRegistry.hasTag(target, "Status.Buff.Strong")) {
                // 移除坚强标记，不造成伤害
                tagRegistry.removeTag(target, "Status.Buff.Strong");
                target.isStrong = false;

                // 播放被挡住动画
                if (specialMethod) {
                    // 可以添加特殊的动画效果
                }
            } else {
                // 正常造成伤害
                target.life = (target.life || 0) - amount;

                // 触发受伤事件
                if (target.onBeAttacked) {
                    target.onBeAttacked({
                        myGameData: context.myGameData,
                        otherGameData: context.otherGameData,
                        thisCard: target,
                        attackCard: thisCard,
                        specialMethod
                    });
                }

                // 记录伤害来源
                if (!target.lastDamageFrom) target.lastDamageFrom = [];
                target.lastDamageFrom.push(thisCard?.k);
            }
        });

        this._refreshGameData(context);
    }

    getDescription() {
        const { amount, ignoreStrong = false } = this.params;
        let desc = `造成${amount}点伤害`;
        if (ignoreStrong) desc += "（无视坚强）";
        return desc;
    }
}

/**
 * DamageAllEffect - 全场伤害效果
 * 对所有符合条件的卡牌造成伤害
 */
class DamageAllEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DamageAll";
    }

    execute(context, targets) {
        const { amount, ignoreStrong = false } = this.params;
        const { tagRegistry } = context;

        targets.forEach(target => {
            if (target._isHero) {
                target.gameData.life = (target.gameData.life || 0) - amount;
                return;
            }

            if (!ignoreStrong && tagRegistry.hasTag(target, "Status.Buff.Strong")) {
                tagRegistry.removeTag(target, "Status.Buff.Strong");
                target.isStrong = false;
            } else {
                target.life = (target.life || 0) - amount;
            }
        });

        this._refreshGameData(context);
    }

    getDescription() {
        const { amount } = this.params;
        return `对所有目标造成${amount}点伤害`;
    }
}

/**
 * DamageRandomEffect - 随机伤害效果
 * 随机选择目标造成伤害
 */
class DamageRandomEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DamageRandom";
    }

    execute(context, targets) {
        const { amount, count = 1, ignoreStrong = false } = this.params;
        const { tagRegistry } = context;

        // 随机选择目标
        const shuffled = [...targets].sort(() => context.specialMethod.rand() - 0.5);
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        selected.forEach(target => {
            if (target._isHero) {
                target.gameData.life = (target.gameData.life || 0) - amount;
                return;
            }

            if (!ignoreStrong && tagRegistry.hasTag(target, "Status.Buff.Strong")) {
                tagRegistry.removeTag(target, "Status.Buff.Strong");
                target.isStrong = false;
            } else {
                target.life = (target.life || 0) - amount;
            }
        });

        this._refreshGameData(context);
    }

    getDescription() {
        const { amount, count = 1 } = this.params;
        return `随机对${count}个目标造成${amount}点伤害`;
    }
}

module.exports = {
    DamageEffect,
    DamageAllEffect,
    DamageRandomEffect
};

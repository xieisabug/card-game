/**
 * TagEffect - Tag 操作效果
 * 用于给卡牌添加或移除 Tag
 */
const BaseEffect = require('./BaseEffect');

class ApplyTagEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ApplyTag";
    }

    execute(context, targets) {
        const { tag, duration = -1 } = this.params;  // duration: -1 表示永久
        const { tagRegistry, thisCard } = context;

        targets.forEach(target => {
            if (target._isHero) return; // 跳过英雄

            tagRegistry.addTag(target, tag, thisCard);

            // 如果有持续时间，记录到卡牌上
            if (duration > 0) {
                if (!target.timedTags) target.timedTags = [];
                target.timedTags.push({
                    tag,
                    remainingTurns: duration,
                    source: thisCard
                });
            }

            this._playBuffAnimation(context, target);
        });
    }

    getDescription() {
        const { tag } = this.params;
        const tagDisplayNames = {
            "Status.Buff.Strong": "坚强",
            "Status.Buff.Dedication": "奉献",
            "Status.Buff.FullOfEnergy": "精力充沛",
            "Status.Buff.Hide": "潜行",
            "Status.Buff.Invincible.Short": "短期无敌"
        };
        return `赋予${tagDisplayNames[tag] || tag}`;
    }
}

/**
 * RemoveTagEffect - 移除 Tag 效果
 */
class RemoveTagEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "RemoveTag";
    }

    execute(context, targets) {
        const { tag } = this.params;
        const { tagRegistry } = context;

        targets.forEach(target => {
            if (target._isHero) return;
            tagRegistry.removeTag(target, tag);
        });
    }

    getDescription() {
        const { tag } = this.params;
        const tagDisplayNames = {
            "Status.Buff.Strong": "坚强",
            "Status.Buff.Dedication": "奉献",
            "Status.Buff.FullOfEnergy": "精力充沛",
            "Status.Buff.Hide": "潜行"
        };
        return `移除${tagDisplayNames[tag] || tag}`;
    }
}

/**
 * ToggleTagEffect - 切换 Tag 效果
 * 如果存在则移除，不存在则添加
 */
class ToggleTagEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ToggleTag";
    }

    execute(context, targets) {
        const { tag } = this.params;
        const { tagRegistry } = context;

        targets.forEach(target => {
            if (target._isHero) return;

            if (tagRegistry.hasTag(target, tag)) {
                tagRegistry.removeTag(target, tag);
            } else {
                tagRegistry.addTag(target, tag, context.thisCard);
            }
        });
    }

    getDescription() {
        const { tag } = this.params;
        const tagDisplayNames = {
            "Status.Buff.Strong": "坚强",
            "Status.Buff.Dedication": "奉献",
            "Status.Buff.FullOfEnergy": "精力充沛",
            "Status.Buff.Hide": "潜行"
        };
        return `切换${tagDisplayNames[tag] || tag}`;
    }
}

module.exports = {
    ApplyTagEffect,
    RemoveTagEffect,
    ToggleTagEffect
};

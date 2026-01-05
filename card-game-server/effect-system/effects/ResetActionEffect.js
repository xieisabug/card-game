/**
 * ResetActionEffect - 重置行动状态
 * 让目标在本回合可行动（默认），可选持续回合数
 */
const BaseEffect = require('./BaseEffect');

class ResetActionEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "ResetAction";
    }

    execute(context, targets) {
        const { duration = 1, applyTag = true } = this.params;

        targets.forEach(target => {
            if (target._isHero) return;
            target.isActionable = true;

            if (applyTag && context.tagRegistry) {
                context.tagRegistry.addTag(target, "Status.Action.CanAct", context.thisCard);
                if (duration > 0) {
                    if (!target.timedTags) target.timedTags = [];
                    target.timedTags.push({
                        tag: "Status.Action.CanAct",
                        remainingTurns: duration,
                        source: context.thisCard
                    });
                }
            }
        });

        this._refreshGameData(context);
    }
}

module.exports = ResetActionEffect;

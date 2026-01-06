/**
 * DamageEachRandomEffect - 对每个目标单独造成随机伤害
 */
const BaseEffect = require('./BaseEffect');

class DamageEachRandomEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DamageEachRandom";
    }

    execute(context, targets) {
        const {
            min = 1,
            max = 1,
            ignoreStrong = false
        } = this.params;

        const rand = context.specialMethod?.rand ? () => context.specialMethod.rand() : Math.random;

        targets.forEach(target => {
            if (target._isHero) {
                target.gameData.life = (target.gameData.life || 0) - (Math.floor(rand() * (max - min + 1)) + min);
                return;
            }
            if (!ignoreStrong && context.tagRegistry?.hasTag(target, "Status.Buff.Strong")) {
                context.tagRegistry.removeTag(target, "Status.Buff.Strong");
                return;
            }
            const dmg = Math.floor(rand() * (max - min + 1)) + min;
            target.life = (target.life || 0) - dmg;
        });

        this._refreshGameData(context);
    }
}

module.exports = DamageEachRandomEffect;

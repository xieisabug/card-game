/**
 * DamageByAttributeEffect - 按某个属性数值造成伤害
 * amount = sourceAttr * multiplier
 */
const BaseEffect = require('./BaseEffect');

class DamageByAttributeEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DamageByAttribute";
    }

    execute(context, targets) {
        const {
            source = "chooseCard", // chooseCard | thisCard
            attribute = "attack",
            multiplier = 1,
            ignoreStrong = false
        } = this.params;
        const sourceCard = source === "thisCard" ? context.thisCard : (context.chooseCard || context.currentTarget);
        if (!sourceCard) return;
        const amount = (sourceCard[attribute] || 0) * multiplier;
        targets.forEach(target => {
            if (target._isHero) {
                target.gameData.life = (target.gameData.life || 0) - amount;
                return;
            }
            if (!ignoreStrong && context.tagRegistry?.hasTag(target, "Status.Buff.Strong")) {
                context.tagRegistry.removeTag(target, "Status.Buff.Strong");
                target.isStrong = false;
                return;
            }
            target.life = (target.life || 0) - amount;
        });
        this._refreshGameData(context);
    }
}

module.exports = DamageByAttributeEffect;

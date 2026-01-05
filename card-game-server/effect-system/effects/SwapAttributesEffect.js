/**
 * SwapAttributesEffect - 交换卡牌的两个属性（默认攻击/生命）
 */
const BaseEffect = require('./BaseEffect');

class SwapAttributesEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "SwapAttributes";
    }

    execute(context, targets) {
        const { attrA = "attack", attrB = "life" } = this.params;

        targets.forEach(target => {
            if (target._isHero) return;
            const a = target[attrA];
            target[attrA] = target[attrB];
            target[attrB] = a;
            this._playBuffAnimation(context, target);
        });

        this._refreshGameData(context);
    }
}

module.exports = SwapAttributesEffect;

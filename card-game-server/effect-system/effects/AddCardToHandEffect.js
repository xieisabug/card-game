/**
 * AddCardToHandEffect - 将卡牌模板加入手牌
 */
const BaseEffect = require('./BaseEffect');

class AddCardToHandEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "AddCardToHand";
    }

    execute(context, targets) {
        const {
            cardTemplate,
            count = 1,
            side = "my"
        } = this.params;
        const { myGameData, otherGameData, specialMethod, effectEngine, tagRegistry } = context;

        const targetGameData = side === "my" ? myGameData : otherGameData;
        if (!cardTemplate || !targetGameData) return;

        for (let i = 0; i < count; i++) {
            const template = typeof cardTemplate === "function"
                ? cardTemplate(context)
                : cardTemplate;

            if (!template) continue;

            const types = template.types || template.type || [];
            const newCard = {
                k: specialMethod.getGameCardKForMe(),
                ...template,
                attack: template.attack || 0,
                life: template.life || 0,
                attackBase: template.attackBase || template.attack || 0,
                lifeBase: template.lifeBase || template.life || 0,
                types,
                type: types
            };

            if (template.tags && template.tags.length > 0 && tagRegistry) {
                template.tags.forEach(tag => tagRegistry.addTag(newCard, tag, context.thisCard));
            }

            if (template.effects && effectEngine) {
                effectEngine.createCardHooks(newCard);
            }

            targetGameData.cards.push(newCard);
            specialMethod.getCardAnimation(true, newCard);
        }
    }
}

module.exports = AddCardToHandEffect;

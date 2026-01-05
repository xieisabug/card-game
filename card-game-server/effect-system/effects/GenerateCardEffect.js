/**
 * GenerateCardEffect - 从指定池或模板生成卡牌到指定位置
 */
const BaseEffect = require('./BaseEffect');

class GenerateCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "GenerateCard";
    }

    execute(context, targets) {
        const {
            pool = null,              // pool 名称或数组
            poolType = null,          // myHand/otherHand/myDeck/otherDeck/allCards/bug
            cardTemplates = null,     // 内联模板数组
            count = 1,
            random = true,
            filter = null,
            to = "hand",              // hand | table | deck
            side = "my",
            keepBuffs = false,
            useCurrentTarget = false  // 复制当前目标
        } = this.params;

        const gameData = side === "my" ? context.myGameData : context.otherGameData;
        if (!gameData) return;

        const choosePool = () => {
            if (Array.isArray(pool)) return pool;
            const allCards = context.cardRegistry?.getAllCards?.() || [];
            if (poolType === "allCards") return allCards;
            if (poolType === "bug" || pool === "bug") {
                return allCards.filter(c => {
                    const types = c.types || c.type || [];
                    return types.includes("bug") || (c.tags || []).includes("Type.Category.Bug");
                });
            }
            const sourceMap = {
                myHand: context.myGameData?.cards,
                otherHand: context.otherGameData?.cards,
                myDeck: context.myGameData?.remainingCards,
                otherDeck: context.otherGameData?.remainingCards
            };
            if (poolType && sourceMap[poolType]) {
                return sourceMap[poolType];
            }
            return allCards;
        };

        let poolCards = cardTemplates || choosePool();
        if (!poolCards || poolCards.length === 0) return;

        if (filter && context.tagRegistry) {
            poolCards = poolCards.filter(c => context.tagRegistry.matchQuery(c, filter));
        }
        if (poolCards.length === 0) return;

        const rand = context.specialMethod?.rand ? () => context.specialMethod.rand() : Math.random;
        const takeCount = count === "all" ? poolCards.length : count;

        const pickTemplate = () => {
            if (useCurrentTarget && (context.currentTarget || context.chooseCard)) {
                return context.currentTarget || context.chooseCard;
            }
            if (!random || takeCount === poolCards.length) {
                return poolCards.shift();
            }
            return poolCards[Math.floor(rand() * poolCards.length)];
        };

        for (let i = 0; i < takeCount; i++) {
            const template = pickTemplate();
            const cardTemplate = typeof template === "function" ? template(context) : template;
            if (!cardTemplate) continue;

            const newCard = {
                k: context.specialMethod.getGameCardKForMe(),
                ...cardTemplate,
                attack: cardTemplate.attack || 0,
                life: cardTemplate.life || 0,
                attackBase: cardTemplate.attackBase || cardTemplate.attack || 0,
                lifeBase: cardTemplate.lifeBase || cardTemplate.life || 0,
                types: cardTemplate.types || cardTemplate.type || []
            };

            if (keepBuffs && cardTemplate.buffList) {
                newCard.buffList = Array.isArray(cardTemplate.buffList) ? [...cardTemplate.buffList] : [];
            } else {
                newCard.buffList = [];
            }

            if (cardTemplate.tags && context.tagRegistry) {
                cardTemplate.tags.forEach(tag => context.tagRegistry.addTag(newCard, tag, context.thisCard));
            }

            if (cardTemplate.effects && context.effectEngine) {
                context.effectEngine.createCardHooks(newCard);
            }

            switch (to) {
                case "table":
                    gameData.tableCards.push(newCard);
                    context.specialMethod.outCardAnimation(side === "my", newCard);
                    break;
                case "deck":
                    gameData.remainingCards = gameData.remainingCards || [];
                    gameData.remainingCards.unshift(newCard);
                    break;
                default:
                    gameData.cards.push(newCard);
                    context.specialMethod.getCardAnimation(side === "my", newCard);
            }
        }
    }
}

module.exports = GenerateCardEffect;

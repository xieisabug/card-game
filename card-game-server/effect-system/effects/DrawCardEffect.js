/**
 * DrawCardEffect - 抽牌效果
 * 用于从牌库抽牌到手牌
 */
const BaseEffect = require('./BaseEffect');
const { CardPosition } = require('../../constants');

class DrawCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DrawCard";
    }

    execute(context, targets) {
        const {
            count = 1,
            target = "self",     // self, other
            source = "deck",     // deck, random, otherDeck, otherRandom, filter
            filter = null,
            to = "hand"          // hand, deck, table
        } = this.params;
        const { myGameData, otherGameData, specialMethod } = context;

        const targetGameData = target === "self" ? myGameData : otherGameData;
        const fromSelf = source === "deck" || source === "random" || source === "filter";

        for (let i = 0; i < count; i++) {
            let card = null;

            if (source === "deck") {
                // 按顺序抽牌
                card = fromSelf ? specialMethod.getNextCardForMe(1)[0] : specialMethod.getNextCardForOther(1)[0];
            } else if (source === "random") {
                // 随机抽牌
                card = fromSelf ? specialMethod.getRandomCardForMe(1)[0] : specialMethod.getRandomCardForOther(1)[0];
            } else if (source === "otherDeck") {
                card = specialMethod.getNextCardForOther(1)[0];
            } else if (source === "otherRandom") {
                card = specialMethod.getRandomCardForOther(1)[0];
            } else if (source === "filter" && filter) {
                // 过滤抽牌
                const allCards = fromSelf
                    ? specialMethod.getRandomCardForMe(10)
                    : specialMethod.getRandomCardForOther(10);
                card = allCards.find(c => {
                    const cardTypes = c.type || c.types || [];
                    return filter.type ? cardTypes.includes(filter.type) : true;
                });
            }

            if (card) {
                // 应用过滤器
                if (filter) {
                    const cardTypes = card.type || card.types || [];
                    if (filter.type && !cardTypes.includes(filter.type)) {
                        continue;
                    }
                }

                if (to === "deck") {
                    targetGameData.remainingCards = targetGameData.remainingCards || [];
                    targetGameData.remainingCards.unshift(card);
                } else if (to === "table") {
                    targetGameData.tableCards.push(card);
                    specialMethod.outCardAnimation(target === "self", card);
                } else {
                    targetGameData.cards.push(card);
                    specialMethod.getCardAnimation(target === "self", card);
                }
            }
        }
    }

    getDescription() {
        const { count = 1, target = "self" } = this.params;
        const targetText = target === "self" ? "己方" : "对方";
        return `${targetText}抽${count}张牌`;
    }
}

/**
 * BothDrawEffect - 双方抽牌效果
 */
class BothDrawEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "BothDraw";
    }

    execute(context, targets) {
        const { count = 1 } = this.params;
        const { specialMethod, myGameData, otherGameData } = context;

        // 己方抽牌
        for (let i = 0; i < count; i++) {
            const card = specialMethod.getNextCardForMe(1)[0];
            if (card) {
                myGameData.cards.push(card);
                specialMethod.getCardAnimation(true, card);
            }
        }

        // 对方抽牌
        for (let i = 0; i < count; i++) {
            const card = specialMethod.getRandomCardForMe(1)[0]; // 对方随机抽
            if (card) {
                otherGameData.cards.push(card);
                specialMethod.getCardAnimation(false, card);
            }
        }
    }

    getDescription() {
        const { count = 1 } = this.params;
        return `双方各抽${count}张牌`;
    }
}

module.exports = {
    DrawCardEffect,
    BothDrawEffect
};

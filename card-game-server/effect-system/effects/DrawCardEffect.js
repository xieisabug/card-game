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
            source = "deck",     // deck, random
            filter = null
        } = this.params;
        const { myGameData, otherGameData, specialMethod } = context;

        const targetGameData = target === "self" ? myGameData : otherGameData;

        for (let i = 0; i < count; i++) {
            let card = null;

            if (source === "deck") {
                // 按顺序抽牌
                card = specialMethod.getNextCardForMe(1)[0];
            } else if (source === "random") {
                // 随机抽牌
                card = specialMethod.getRandomCardForMe(1)[0];
            } else if (source === "filter" && filter) {
                // 过滤抽牌
                const allCards = specialMethod.getRandomCardForMe(10); // 获取更多以供过滤
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

                targetGameData.cards.push(card);
                specialMethod.getCardAnimation(target === "self", card);
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
        const { count = 1, specialMethod, myGameData, otherGameData } = this.params;

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

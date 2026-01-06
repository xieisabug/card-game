/**
 * TransformEffect - 变形效果
 * 用于将卡牌变形为另一个卡牌
 */
const BaseEffect = require('./BaseEffect');

class TransformCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "TransformCard";
    }

    execute(context, targets) {
        const {
            toCardId,           // 变形后的卡牌ID
            toCardTemplate,     // 或内联模板
            transformChain,     // 变形链配置
            keepBuffs = false   // 是否保留原有的 buff
        } = this.params;
        const { myGameData, otherGameData, specialMethod, tagRegistry } = context;

        targets.forEach(target => {
            if (target._isHero) return;

            let newCardData = null;

            // 使用变形链
            if (transformChain && transformChain.length > 0) {
                const currentName = target.name;
                const chainItem = transformChain.find(item => item.from === currentName);
                if (chainItem) {
                    newCardData = {
                        name: chainItem.to,
                        attack: chainItem.attack !== undefined ? chainItem.attack : target.attack,
                        life: chainItem.life !== undefined ? chainItem.life : target.life,
                        content: chainItem.content || target.content,
                        cardType: target.cardType,
                        cost: chainItem.cost || target.cost
                    };
                    // 继承 types
                    if (target.types || target.type) {
                        newCardData.types = target.types || target.type;
                    }
                }
            } else if (toCardTemplate) {
                newCardData = { ...toCardTemplate };
            }

            if (!newCardData) return;

            // 获取索引位置
            const isMyCard = target.k && myGameData.tableCards.some(c => c.k === target.k);
            const tableCards = isMyCard ? myGameData.tableCards : otherGameData.tableCards;
            const index = tableCards.findIndex(c => c.k === target.k);

            if (index !== -1) {
                // 保留原有属性
                const newCard = {
                    ...target,
                    ...newCardData,
                    // 保留原有的 k 值
                    k: target.k,
                    // 保留原有的 buffList（如果需要）
                    buffList: keepBuffs ? target.buffList : []
                };

                tableCards[index] = newCard;

                // 播放变形动画
                if (specialMethod) {
                    specialMethod.buffCardAnimation(true, -1, -1, target, newCard);
                }
            }
        });

        this._refreshGameData(context);
    }

    getDescription() {
        const { toCardId, toCardTemplate, transformChain } = this.params;
        if (transformChain) {
            return "变形为下一个形态";
        }
        return `变形为${toCardTemplate?.name || toCardId}`;
    }
}

/**
 * CopyCardEffect - 复制卡牌效果
 */
class CopyCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "CopyCard";
    }

    execute(context, targets) {
        const {
            target = "chosen",      // 复制来源: chosen(选择的目标), self
            toSide = "my",          // 复制到的位置: my, other
            position = "hand",      // 复制到: hand, table, deck
            keepBuffs = true        // 是否保留 buff
        } = this.params;
        const { myGameData, otherGameData, specialMethod } = context;

        const sourceCard = target === "self" ? context.thisCard : context.chooseCard;
        if (!sourceCard) return;

        const targetGameData = toSide === "my" ? myGameData : otherGameData;

        // 创建复制品
        const copy = {
            k: specialMethod.getGameCardKForMe(),
            ...sourceCard,
            name: sourceCard.name + "的复制品",
            // 保留或重置属性
            attack: sourceCard.attack,
            life: sourceCard.life,
            attackBase: sourceCard.attackBase || sourceCard.attack,
            lifeBase: sourceCard.lifeBase || sourceCard.life,
            // 精力充沛需要重置
            isActionable: sourceCard.tags?.includes("Status.Buff.FullOfEnergy") || false
        };

        if (keepBuffs && sourceCard.buffList) {
            copy.buffList = [...sourceCard.buffList];
        } else {
            copy.buffList = [];
        }

        // 放到目标位置
        if (position === "hand") {
            targetGameData.cards.push(copy);
            specialMethod.getCardAnimation(true, copy);
        } else if (position === "table") {
            targetGameData.tableCards.push(copy);
            specialMethod.outCardAnimation(true, copy);
        } else if (position === "deck") {
            targetGameData.remainingCards.unshift(copy);
        }
    }

    getDescription() {
        const { position = "hand" } = this.params;
        const posName = { hand: "手牌", table: "场上", deck: "牌库" };
        return `复制到${posName[position] || position}`;
    }
}

/**
 * StealCardEffect - 窃取卡牌效果
 */
class StealCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "StealCard";
    }

    execute(context, targets) {
        const {
            source = "otherTable",  // 来源: otherTable, otherHand
            random = false,         // 是否随机选择
            count = 1
        } = this.params;
        const { myGameData, otherGameData, specialMethod } = context;

        let sourceCards = [];
        if (source === "otherTable") {
            sourceCards = otherGameData.tableCards || [];
        } else if (source === "otherHand") {
            sourceCards = otherGameData.cards || [];
        }

        // 选择要窃取的卡牌
        let selected = [];
        if (random && sourceCards.length > count) {
            selected = sourceCards
                .sort(() => context.specialMethod.rand() - 0.5)
                .slice(0, count);
        } else {
            selected = sourceCards.slice(0, count);
        }

        // 移动到己方手牌
        selected.forEach(card => {
            // 从来源移除
            if (source === "otherTable") {
                const idx = otherGameData.tableCards.indexOf(card);
                if (idx !== -1) otherGameData.tableCards.splice(idx, 1);
            } else if (source === "otherHand") {
                const idx = otherGameData.cards.indexOf(card);
                if (idx !== -1) otherGameData.cards.splice(idx, 1);
            }

            // 添加到己方手牌
            myGameData.cards.push(card);
            specialMethod.getCardAnimation(true, card);
        });
    }

    getDescription() {
        const { count = 1, source = "otherTable" } = this.params;
        const sourceName = source === "otherTable" ? "敌方场上" : "敌方手牌";
        return `从${sourceName}窃取${count}张卡牌`;
    }
}

module.exports = {
    TransformCardEffect,
    CopyCardEffect,
    StealCardEffect
};

/**
 * ExchangeEffect - 交换效果
 * 用于交换卡牌或资源
 */
const BaseEffect = require('./BaseEffect');

class SwapCardsEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "SwapCards";
    }

    execute(context, targets) {
        const {
            source = "myHand",      // 源位置
            target = "otherHand",    // 目标位置
            count = 1,
            unique = true           // 是否不重复选择
        } = this.params;
        const { myGameData, otherGameData, specialMethod } = context;

        // 获取源卡牌
        let sourceCards = [];
        if (source === "myHand") sourceCards = [...myGameData.cards];
        else if (source === "otherHand") sourceCards = [...otherGameData.cards];

        // 获取目标卡牌
        let targetCards = [];
        if (target === "myHand") targetCards = [...myGameData.cards];
        else if (target === "otherHand") targetCards = [...otherGameData.cards];

        // 选择要交换的卡牌
        let selectedSource = [];
        let selectedTarget = [];

        if (unique) {
            // 不重复选择
            selectedSource = sourceCards.slice(0, count);
            selectedTarget = targetCards.slice(0, count);
        } else {
            // 可重复选择
            const rand = () => Math.floor(specialMethod.rand() * sourceCards.length);
            for (let i = 0; i < count; i++) {
                selectedSource.push(sourceCards[rand()]);
                selectedTarget.push(targetCards[rand()]);
            }
        }

        // 执行交换
        selectedSource.forEach((card, idx) => {
            // 从源位置移除
            if (source === "myHand") {
                const i = myGameData.cards.indexOf(card);
                if (i !== -1) myGameData.cards.splice(i, 1);
            } else {
                const i = otherGameData.cards.indexOf(card);
                if (i !== -1) otherGameData.cards.splice(i, 1);
            }

            // 放到目标位置
            if (target === "myHand") {
                if (selectedTarget[idx]) {
                    const tIdx = myGameData.cards.indexOf(selectedTarget[idx]);
                    if (tIdx !== -1) {
                        myGameData.cards[tIdx] = card;
                    }
                }
            } else {
                if (selectedTarget[idx]) {
                    const tIdx = otherGameData.cards.indexOf(selectedTarget[idx]);
                    if (tIdx !== -1) {
                        otherGameData.cards[tIdx] = card;
                    }
                }
            }
        });

        // 确保数量一致
        while (myGameData.cards.length < count + otherGameData.cards.length - count) {
            // 补充空位
        }

        this._refreshGameData(context);
    }

    getDescription() {
        const { count = 1 } = this.params;
        return `交换${count}张手牌`;
    }
}

/**
 * DestroyCardEffect - 消灭卡牌效果
 */
class DestroyCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DestroyCard";
    }

    execute(context, targets) {
        const { count = 1, random = false } = this.params;
        const { myGameData, otherGameData, specialMethod } = context;

        // 获取所有可消灭的卡牌
        let allCards = [
            ...(myGameData.tableCards || []),
            ...(otherGameData.tableCards || [])
        ];

        // 过滤掉无敌的卡牌
        allCards = allCards.filter(card => {
            if (card.isShortInvincible) return false;
            if (context.tagRegistry?.hasTag(card, "Status.Buff.Invincible.Short")) return false;
            return true;
        });

        // 选择要消灭的卡牌
        let toDestroy = [];
        if (random && allCards.length > count) {
            toDestroy = allCards
                .sort(() => context.specialMethod.rand() - 0.5)
                .slice(0, count);
        } else {
            toDestroy = allCards.slice(0, count);
        }

        // 执行消灭
        toDestroy.forEach(card => {
            const isMyCard = myGameData.tableCards.includes(card);
            const tableCards = isMyCard ? myGameData.tableCards : otherGameData.tableCards;
            const idx = tableCards.indexOf(card);
            if (idx !== -1) {
                // 触发 onEnd
                if (card.onEnd) {
                    card.onEnd({
                        myGameData,
                        otherGameData,
                        thisCard: card,
                        specialMethod
                    });
                }
                tableCards.splice(idx, 1);
            }
        });

        if (toDestroy.length > 0 && specialMethod) {
            const myKList = toDestroy.filter(c => myGameData.tableCards.includes(c)).map(c => c.k);
            const otherKList = toDestroy.filter(c => otherGameData.tableCards.includes(c)).map(c => c.k);
            if (myKList.length > 0 || otherKList.length > 0) {
                specialMethod.dieCardAnimation(true, myKList, otherKList);
            }
        }

        this._refreshGameData(context);
    }

    getDescription() {
        const { count = 1 } = this.params;
        return `消灭${count}个随从`;
    }
}

module.exports = {
    SwapCardsEffect,
    DestroyCardEffect
};

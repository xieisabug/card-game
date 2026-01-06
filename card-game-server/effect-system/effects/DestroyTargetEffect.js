const BaseEffect = require('./BaseEffect');

/**
 * DestroyTargetEffect - 直接消灭解析到的目标
 */
class DestroyTargetEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "DestroyTarget";
    }

    execute(context, targets) {
        const { myGameData, otherGameData, specialMethod, tagRegistry } = context;
        const myList = [];
        const otherList = [];

        targets.forEach(card => {
            if (!card || card._isHero) return;
            // 只使用 tag 检查短期无敌
            if (tagRegistry?.hasTag(card, "Status.Buff.Invincible.Short")) {
                return;
            }

            // 找到卡所在的阵营
            let ownerList = null;
            if (myGameData.tableCards && myGameData.tableCards.includes(card)) {
                ownerList = myGameData.tableCards;
                myList.push(card.k);
            } else if (otherGameData.tableCards && otherGameData.tableCards.includes(card)) {
                ownerList = otherGameData.tableCards;
                otherList.push(card.k);
            }

            if (!ownerList) return;

            // 触发原 onEnd
            if (card.onEnd) {
                card.onEnd({
                    myGameData,
                    otherGameData,
                    thisCard: card,
                    specialMethod
                });
            }

            const idx = ownerList.indexOf(card);
            if (idx !== -1) {
                ownerList.splice(idx, 1);
            }
        });

        if ((myList.length > 0 || otherList.length > 0) && specialMethod) {
            specialMethod.dieCardAnimation(true, myList, otherList);
        }

        this._refreshGameData(context);
    }
}

module.exports = DestroyTargetEffect;

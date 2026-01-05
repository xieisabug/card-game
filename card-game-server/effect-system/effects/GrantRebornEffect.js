const BaseEffect = require('./BaseEffect');

/**
 * GrantRebornEffect - 为目标添加一次复活亡语
 * 触发时复活自身一次，执行原 onEnd 后再复活。
 */
class GrantRebornEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "GrantReborn";
    }

    execute(context, targets) {
        const { once = true } = this.params;

        targets.forEach(card => {
            if (!card || typeof card !== "object") return;

            // 已经有复活效果则跳过
            if (card._rebornGranted) return;
            card._rebornGranted = true;

            // 记录原始 onEnd
            const originOnEnd = card.onEnd;

            // 拍快照用于复活（避免引用造成循环）
            const snapshot = this._buildSnapshot(card);

            card.onEnd = ({ myGameData, specialMethod, thisCard }) => {
                if (originOnEnd) {
                    originOnEnd({ myGameData, specialMethod, thisCard });
                }

                if (once && card._rebornUsed) {
                    return;
                }

                card._rebornUsed = true;

                const newCard = {
                    ...snapshot,
                    k: specialMethod.getGameCardKForMe(),
                    attackBase: snapshot.attack,
                    lifeBase: snapshot.life
                };

                myGameData.tableCards.push(newCard);
                specialMethod.outCardAnimation(true, newCard);
            };

            this._playBuffAnimation(context, card);
        });
    }

    _buildSnapshot(card) {
        const { id, name, cardType, cost, attack, life, content } = card;
        return {
            id,
            name,
            cardType,
            cost,
            attack,
            life,
            content,
            types: (card.types && [...card.types]) || (card.type && [...card.type]) || [],
            tags: card.tags ? [...card.tags] : [],
            effects: card.effects ? JSON.parse(JSON.stringify(card.effects)) : undefined,
            buffList: card.buffList
                ? card.buffList.map(buff => ({
                    ...buff,
                    from: buff.from && typeof buff.from === "object"
                        ? { id: buff.from.id, k: buff.from.k, name: buff.from.name }
                        : buff.from
                }))
                : []
        };
    }
}

module.exports = GrantRebornEffect;

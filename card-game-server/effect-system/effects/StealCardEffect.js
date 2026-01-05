/**
 * StealCardEffect - 夺取卡牌效果
 * 从对方场上夺取卡牌到己方场上
 */
const BaseEffect = require('./BaseEffect');

class StealCardEffect extends BaseEffect {
    constructor(config) {
        super(config);
        this.type = "StealCard";
    }

    execute(context, targets) {
        const {
            source = "otherTable",  // 来源位置: myTable, otherTable
            target = "myTable",     // 目标位置
            count = 1,
            random = true,
            filter = null           // 过滤条件
        } = this.params;

        const { myGameData, otherGameData, specialMethod, tagRegistry } = context;

        // 获取来源场上的卡牌
        let sourceCards = source === "otherTable"
            ? [...otherGameData.tableCards]
            : [...myGameData.tableCards];

        // 过滤卡牌
        if (filter && tagRegistry) {
            sourceCards = sourceCards.filter(card =>
                tagRegistry.matchQuery(card, filter)
            );
        }

        if (sourceCards.length === 0) {
            this._refreshGameData(context);
            return;
        }

        // 选择要夺取的卡牌
        let toSteal = [];

        if (context.chooseCard && targets.length > 0) {
            // 玩家指定目标
            toSteal = targets;
        } else if (random) {
            // 随机选择
            const rand = () => Math.floor(specialMethod.rand() * sourceCards.length);
            const stealCount = Math.min(count, sourceCards.length);
            const usedIndices = new Set();

            for (let i = 0; i < stealCount; i++) {
                let idx;
                do {
                    idx = rand();
                } while (usedIndices.has(idx) && usedIndices.size < sourceCards.length);
                usedIndices.add(idx);
                toSteal.push(sourceCards[idx]);
            }
        } else {
            // 取前 count 张
            toSteal = sourceCards.slice(0, count);
        }

        // 执行夺取
        toSteal.forEach(card => {
            // 从来源场移除
            const sourceArray = source === "otherTable"
                ? otherGameData.tableCards
                : myGameData.tableCards;

            const sourceIdx = sourceArray.indexOf(card);
            if (sourceIdx !== -1) {
                sourceArray.splice(sourceIdx, 1);

                // 触发原卡牌的 onEnd（如果有）
                if (card.onEnd) {
                    card.onEnd({
                        myGameData,
                        otherGameData,
                        thisCard: card,
                        specialMethod
                    });
                }

                // 触发死亡动画
                const kList = source === "otherTable" ? [card.k] : [];
                if (kList.length > 0) {
                    specialMethod.dieCardAnimation(true, [], kList);
                }
            }

            // 添加到目标场
            const targetArray = target === "myTable"
                ? myGameData.tableCards
                : otherGameData.tableCards;

            if (!targetArray.includes(card)) {
                targetArray.push(card);
                // 播放出场动画
                specialMethod.outCardAnimation(true, card);
            }
        });

        this._refreshGameData(context);
    }

    getDescription() {
        const { count = 1, random = true } = this.params;
        if (random) {
            return `随机夺取${count}张对方场上的卡牌`;
        }
        return `夺取${count}张对方场上的卡牌`;
    }
}

module.exports = StealCardEffect;

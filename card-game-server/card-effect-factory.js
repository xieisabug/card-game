const {BuffType} = require('./constants');
const cards = require('./cards');

/**
 * 移除卡牌的 Tag（同时同步 legacy 属性）
 */
function removeCardTag(card, tagName) {
    const effectEngine = cards.effectEngine;
    if (effectEngine && effectEngine.tagRegistry) {
        effectEngine.tagRegistry.removeTag(card, tagName);
    } else {
        // 降级处理：手动移除
        if (card.tags && card.tags.includes(tagName)) {
            card.tags.splice(card.tags.indexOf(tagName), 1);
        }
    }
}

module.exports = {
    haveTypeAddAttack: function(type, addAttack) {
        return function ({myGameData, thisCard, specialMethod}) {
            let add = 0;
            myGameData.tableCards.forEach(c => {
                if (c.type.indexOf(type) !== -1) {
                    add += addAttack;
                }
            });
            thisCard.attack += add;
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, c)
        }
    },
    oneChooseCardAddAttack: function(addAttack) {
        return function ({chooseCard, thisCard, specialMethod, source}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            chooseCard.attack += addAttack;
            chooseCard.buffList.push({
                type: BuffType.ADD_ATTACK,
                value: addAttack,
                from: thisCard ? thisCard : source
            });
            specialMethod.buffCardAnimation(true, -1, -1, thisCard ? thisCard : source, chooseCard)
        }
    },
    oneChooseCardAddLife: function(addLife) {
        return function ({chooseCard, thisCard, specialMethod}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            chooseCard.life += addLife;
            chooseCard.buffList.push({
                type: BuffType.ADD_LIFE,
                value: addLife,
                from: thisCard
            });
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard)
        }
    },
    oneChooseCardAddDedication: function() {
        return function ({chooseCard, thisCard, specialMethod}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            chooseCard.isDedication = true;
            chooseCard.buffList.push({
                type: BuffType.ADD_DEDICATION,
                from: thisCard
            });
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard)
        }
    },
    allOtherCardDamage: function (damage) {
        return function ({otherGameData, specialMethod}) {
            otherGameData.tableCards.forEach(c => {
                if (c.isStrong) {
                    c.isStrong = false;
                    removeCardTag(c, "Status.Buff.Strong");
                } else {
                    c.life -= damage;
                }
            });
            specialMethod.refreshGameData();
        }
    },
    combineEffect: function(...effect) {
        return function() {
            let arg = arguments;
            effect.forEach(f => {
                f(...arg)
            })
        }

    }
};
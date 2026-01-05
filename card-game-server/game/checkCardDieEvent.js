const {getSpecialMethod} = require("./getSpecialMethod");
const {getRoomData} = require("../cache");
const cards = require("../cards");

/**
 * 触发卡牌效果（兼容新旧格式）
 */
function triggerCardEffect(hookName, card, myGameData, otherGameData, specialMethod, extraContext = {}) {
    const isEffectHook = card._effectHookNames && card._effectHookNames[hookName];

    // 触发旧版函数式钩子
    if (card[hookName] && typeof card[hookName] === 'function') {
        card[hookName]({
            myGameData,
            otherGameData,
            thisCard: card,
            specialMethod,
            ...extraContext
        });
    }

    // 触发新版 Effect 系统钩子
    const effectEngine = cards.effectEngine;
    if (!isEffectHook && effectEngine && card.effects && card.effects[hookName]) {
        const context = {
            myGameData,
            otherGameData,
            thisCard: card,
            specialMethod,
            ...extraContext
        };
        effectEngine.executeCardEffects(card, hookName, context);
    }
}

/**
 * 检查卡片是否有死亡
 * @param roomNumber 游戏房间
 * @param level 递归层级
 * @param myKList 我方死亡卡牌k值
 * @param otherKList 对方死亡卡牌k值
 */
function checkCardDieEvent(roomNumber, level, myKList, otherKList) {
    if (!level) {
        level = 1;
        myKList = [];
        otherKList = [];
    }
    const memoryData = getRoomData(roomNumber)
    if (memoryData["one"]["tableCards"].some(c => c.life <= 0) || memoryData["two"]["tableCards"].some(c => c.life <= 0)) {

        let oneSpecialMethod = getSpecialMethod("one", roomNumber),
            twoSpecialMethod = getSpecialMethod("two", roomNumber);

        for (let i = memoryData["one"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData["one"]["tableCards"][i];
            if (c.life <= 0) {
                triggerCardEffect('onEnd', c, memoryData["one"], memoryData["two"], oneSpecialMethod);
                memoryData["one"]["tableCards"].splice(i, 1);
                myKList.push(c.k);
            }
        }

        for (let i = memoryData["two"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData["two"]["tableCards"][i];
            if (c.life <= 0) {
                triggerCardEffect('onEnd', c, memoryData["two"], memoryData["one"], twoSpecialMethod);
                memoryData["two"]["tableCards"].splice(i, 1);
                otherKList.push(c.k);
            }
        }
        checkCardDieEvent(roomNumber, level + 1, myKList, otherKList);
    }
    if (level === 1 && (myKList.length !== 0 || otherKList.length !== 0)) {
        let oneSpecialMethod = getSpecialMethod("one", roomNumber);

        oneSpecialMethod.dieCardAnimation(true, myKList, otherKList);
    }
}

module.exports = {
    checkCardDieEvent
}

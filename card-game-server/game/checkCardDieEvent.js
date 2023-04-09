const {getSpecialMethod} = require("./getSpecialMethod");
const {getRoomData} = require("../cache");

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
                if (c.onEnd) {
                    c.onEnd({
                        myGameData: memoryData["one"],
                        otherGameData: memoryData["two"],
                        thisCard: c,
                        specialMethod: oneSpecialMethod
                    });
                }
                memoryData["one"]["tableCards"].splice(i, 1);
                myKList.push(c.k);
                // oneSpecialMethod.dieCardAnimation(true, c);
            }
        }

        for (let i = memoryData["two"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData["two"]["tableCards"][i];
            if (c.life <= 0) {
                if (c.onEnd) {
                    c.onEnd({
                        myGameData: memoryData["two"],
                        otherGameData: memoryData["one"],
                        thisCard: c,
                        specialMethod: twoSpecialMethod
                    });
                }
                memoryData["two"]["tableCards"].splice(i, 1);
                otherKList.push(c.k);
                // twoSpecialMethod.dieCardAnimation(true, c);
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
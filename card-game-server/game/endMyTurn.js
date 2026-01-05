const {CardPosition} = require("../constants");
const {getRoomData, getSocket} = require("../cache");
const {getNextCard} = require("./utils");
const {getSpecialMethod} = require("./getSpecialMethod");
const {sendCards} = require("./sendCards");
const {error} = require("./log");
const log4js = require("log4js");
const {giveUp} = require("./giveUp");
const cards = require("../cards");
const logger = log4js.getLogger('play');

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
 * 结束当前回合
 * @param args r: 房间号
 * @param socket
 */
function endMyTurn(args, socket) {
    let roomNumber = args.r;
    const memoryData = getRoomData(roomNumber);
    // 停止之前的超时计时
    clearTimeout(memoryData.timeoutId);

    const oneSocket = getSocket(roomNumber, "one")
    let belong = oneSocket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = oneSocket.id !== socket.id ? "one" : "two";

    if (memoryData[belong].maxFee < 10) {
        memoryData[belong].maxFee += 1;
    }
    let mySpecialMethod = getSpecialMethod(belong, roomNumber);
    memoryData[belong]["cards"].forEach((c, index) => {
        triggerCardEffect('onMyTurnStart', c, memoryData[belong], memoryData[other], mySpecialMethod, {
            thisCardIndex: index,
            position: CardPosition.HANDS
        });
    });
    memoryData[belong].tableCards.forEach((c, index) => {
        triggerCardEffect('onMyTurnEnd', c, memoryData[belong], memoryData[other], mySpecialMethod, {
            thisCardIndex: index,
            position: CardPosition.TABLE
        });

        if (c.isShortInvincible) {
            c.shortInvincibleRound -= 1;
            if (c.shortInvincibleRound === 0) {
                c.isShortInvincible = false;
            }
        }

        c.isActionable = true;
    });

    if (belong === "two") {
        memoryData.round += 1;
    }

    memoryData[other].fee = memoryData[other].maxFee;
    memoryData[other].useSkillRoundTimes = 0;

    getSocket(roomNumber, other).emit("YOUR_TURN");
    socket.emit("END_MY_TURN");

    // 超时计时
    memoryData.timeoutId = setTimeout(() => {
        logger.info(`${roomNumber} ${other} 超时 ${memoryData[other].myMaxThinkTimeNumber}秒, 自动结束回合`);

        endMyTurn(args, getSocket(roomNumber, other));
        if (memoryData[other].timeoutTimes) {
            memoryData[other].timeoutTimes += 1;

            if (memoryData[other].timeoutTimes === 4) {
                logger.info(`${roomNumber} ${other} 超时 ${memoryData[other].myMaxThinkTimeNumber}秒, 达到4次, 开始超时惩罚`);
                memoryData[other].myMaxThinkTimeNumber = memoryData[other].myMaxThinkTimeNumber / 2;
            } else if (memoryData[other].timeoutTimes >= 6) {
                logger.info(`${roomNumber} ${other} 超时 ${memoryData[other].myMaxThinkTimeNumber}秒, 达到6次, 惩罚输掉游戏`);
                giveUp(args, getSocket(roomNumber, other));
            }
        } else {
            memoryData[other].timeoutTimes = 1;
        }
    }, memoryData[other].myMaxThinkTimeNumber * 1000);

    memoryData['currentRound'] = other;
    if (memoryData[other]["cards"].length < memoryData[other]["maxHandCardNumber"]
        && memoryData[other]['remainingCards'].length > 0) {
        memoryData[other]["cards"].push(getNextCard(memoryData[other]['remainingCards']));
    } else {
        if (memoryData[other]["cards"].length >= memoryData[other]["maxHandCardNumber"]) {
            error(getSocket(roomNumber, other), `您的手牌超过了${memoryData[other]["maxHandCardNumber"]}张，不能抽牌`)
        } else if (memoryData[other]['remainingCards'].length === 0) {
            error(getSocket(roomNumber, other), `没有剩余卡牌了，不能抽牌`)
        }

    }
    let otherSpecialMethod = getSpecialMethod(other, roomNumber);

    memoryData[other]["cards"].forEach((c, index) => {
        triggerCardEffect('onMyTurnStart', c, memoryData[other], memoryData[belong], otherSpecialMethod, {
            thisCardIndex: index,
            position: CardPosition.HANDS
        });
    });
    memoryData[other]["tableCards"].forEach((c, index) => {
        triggerCardEffect('onMyTurnStart', c, memoryData[other], memoryData[belong], otherSpecialMethod, {
            thisCardIndex: index,
            position: CardPosition.TABLE
        });

        if (c.isShortInvincible) {
            c.shortInvincibleRound -= 1;
            if (c.shortInvincibleRound === 0) {
                c.isShortInvincible = false;
            }
        }
    });

    sendCards(roomNumber)
}

module.exports = {
    endMyTurn
}

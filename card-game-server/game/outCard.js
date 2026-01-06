const {TargetType, CardPosition} = require("../constants");
const {extractHeroInfo, hasTag, Tags} = require("../utils");
const {getRoomData, getSocket} = require("../cache");
const {checkPvpWin, checkPveWin} = require("./checkWin");
const {error} = require("./log");
const {getSpecialMethod} = require("./getSpecialMethod");
const {checkCardDieEvent} = require("./checkCardDieEvent");
const cards = require("../cards");
const {sanitizeCard} = require("./sanitizeCard");

// 选择目标的处理器，用于当卡牌需要选择目标时，根据目标类型获取目标列表
const targetTypeHandlers = {
    [TargetType.MY_TABLE_CARD]: (belong, other, memoryData, card) => memoryData[belong]["tableCards"],
    [TargetType.OTHER_TABLE_CARD]: (belong, other, memoryData, card) => memoryData[other]["tableCards"],
    [TargetType.ALL_TABLE_CARD]: (belong, other, memoryData, card) => memoryData[other]["tableCards"].concat(memoryData[belong]["tableCards"]),
    [TargetType.ALL_TABLE_CARD_FILTER_INCLUDE]: (belong, other, memoryData, card) => filterCards(memoryData[other]["tableCards"], card.filter, false).concat(filterCards(memoryData[belong]["tableCards"], card.filter, false)),
    [TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE]: (belong, other, memoryData, card) => filterCards(memoryData[other]["tableCards"], card.filter, true).concat(filterCards(memoryData[belong]["tableCards"], card.filter, true)),
    [TargetType.MY_TABLE_CARD_FILTER_INCLUDE]: (belong, other, memoryData, card) => filterCards(memoryData[belong]["tableCards"], card.filter, false),
    [TargetType.MY_TABLE_CARD_FILTER_EXCLUDE]: (belong, other, memoryData, card) => filterCards(memoryData[belong]["tableCards"], card.filter, true),
    [TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE]: (belong, other, memoryData, card) => filterCards(memoryData[other]["tableCards"], card.filter, false),
    [TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE]: (belong, other, memoryData, card) => filterCards(memoryData[other]["tableCards"], card.filter, true),
};

function filterCards(cards, filter, isExclude) {
    return cards.filter(i => filter.every(t => isExclude ? i.type.indexOf(t) === -1 : i.type.indexOf(t) !== -1));
}

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
 * 出牌
 * @param args
 * @param socket
 */
function outCard(args, socket) {
    let roomNumber = args.r, index = args.index, card;
    const memoryData = getRoomData(roomNumber);

    let belong = getSocket(roomNumber, "one").id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = getSocket(roomNumber, "one").id !== socket.id ? "one" : "two";

    if (index !== -1 && memoryData[belong]["cards"][index].cost <= memoryData[belong]["fee"]) {
        card = memoryData[belong]["cards"].splice(index, 1)[0];
        if (hasTag(card, Tags.Character) && memoryData[belong]["tableCards"].length >= memoryData[belong]['maxTableCardNumber']) {
            error(getSocket(roomNumber, belong), `您的基础卡牌只能有${memoryData[belong]['maxTableCardNumber']}张`);
            return;
        }

        // 检查是否违反卡牌的必须选择施法对象属性（isForceTarget）
        let targetIndex = args.targetIndex;
        let chooseCardList = [];
        
        if (card.isTarget) {
            chooseCardList = targetTypeHandlers[card.targetType](belong, other, memoryData, card);
            if (chooseCardList.length === 0 && targetIndex === -1 && card.isForceTarget) {
                error(getSocket(roomNumber, belong), "请选择目标");
                return;
            }
        }

        memoryData[belong]['useCards'].push(Object.assign({outRound: memoryData.round}, card));
        memoryData[belong]["fee"] -= card.cost;

        let mySpecialMethod = getSpecialMethod(belong, roomNumber);

        // 精力充沛卡牌出场即可行动
        if (hasTag(card, Tags.FullOfEnergy)) {
            card.isActionable = true;
        }

        if (hasTag(card, Tags.Character)) {
            memoryData[belong]["tableCards"].push(card);
            const safeCard = sanitizeCard(card);
            getSocket(roomNumber, belong).emit("OUT_CARD", {
                index,
                toIndex: -1,
                card: safeCard,
                isMine: true,
                myHero: extractHeroInfo(memoryData[belong]),
                otherHero: extractHeroInfo(memoryData[other])
            });
            getSocket(roomNumber, other).emit("OUT_CARD", {
                index,
                toIndex: -1,
                card: safeCard,
                isMine: false,
                myHero: extractHeroInfo(memoryData[other]),
                otherHero: extractHeroInfo(memoryData[belong])
            })
        } else if (hasTag(card, Tags.Effect)) {
            const safeCard = sanitizeCard(card);
            getSocket(roomNumber, belong).emit("OUT_EFFECT", {
                index,
                card: safeCard,
                isMine: true,
                myHero: extractHeroInfo(memoryData[belong]),
                otherHero: extractHeroInfo(memoryData[other])
            });
            getSocket(roomNumber, other).emit("OUT_EFFECT", {
                index,
                card: safeCard,
                isMine: false,
                myHero: extractHeroInfo(memoryData[other]),
                otherHero: extractHeroInfo(memoryData[belong])
            })
        }

        if (card.isTarget) {
            triggerCardEffect('onChooseTarget', card, memoryData[belong], memoryData[other], mySpecialMethod, {
                chooseCard: chooseCardList[targetIndex],
                effectIndex: args.effectIndex,
                fromIndex: -1,
                toIndex: targetIndex
            });
        }

        triggerCardEffect('onStart', card, memoryData[belong], memoryData[other], mySpecialMethod);

        memoryData[belong]["tableCards"].forEach(c => {
            triggerCardEffect('onOtherCardStart', c, memoryData[belong], memoryData[other], mySpecialMethod, {
                position: CardPosition.TABLE
            });
        });
        memoryData[belong]["cards"].forEach(c => {
            triggerCardEffect('onOtherCardStart', c, memoryData[belong], memoryData[other], mySpecialMethod, {
                position: CardPosition.HANDS
            });
        });
        memoryData[other]["tableCards"].forEach(c => {
            triggerCardEffect('onOtherCardStart', c, memoryData[other], memoryData[belong], mySpecialMethod, {
                position: CardPosition.TABLE
            });
        });
        memoryData[other]["cards"].forEach(c => {
            triggerCardEffect('onOtherCardStart', c, memoryData[other], memoryData[belong], mySpecialMethod, {
                position: CardPosition.HANDS
            });
        });

        checkCardDieEvent(roomNumber);
    } else {
        error(socket, '费用不足或未选择卡牌');
    }

    checkPvpWin(roomNumber);
    checkPveWin(roomNumber);
}

module.exports = {
    outCard
}

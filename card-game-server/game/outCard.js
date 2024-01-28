const {CardType, TargetType, CardPosition} = require("../constants");
const {extractHeroInfo} = require("../utils");
const {getRoomData, getSocket} = require("../cache");
const {checkPvpWin, checkPveWin} = require("./checkWin");
const {error} = require("./log");
const {getSpecialMethod} = require("./getSpecialMethod");
const {checkCardDieEvent} = require("./checkCardDieEvent");


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
        if (card.cardType === CardType.CHARACTER && memoryData[belong]["tableCards"].length >= memoryData[belong]['maxTableCardNumber']) {
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

        if (card.isFullOfEnergy) {
            card.isActionable = true;
        }

        if (card.cardType === CardType.CHARACTER) {
            memoryData[belong]["tableCards"].push(card);
            getSocket(roomNumber, belong).emit("OUT_CARD", {
                index,
                toIndex: -1,
                card,
                isMine: true,
                myHero: extractHeroInfo(memoryData[belong]),
                otherHero: extractHeroInfo(memoryData[other])
            });
            getSocket(roomNumber, other).emit("OUT_CARD", {
                index,
                toIndex: -1,
                card,
                isMine: false,
                myHero: extractHeroInfo(memoryData[other]),
                otherHero: extractHeroInfo(memoryData[belong])
            })
        } else if (card.cardType === CardType.EFFECT) {
            getSocket(roomNumber, belong).emit("OUT_EFFECT", {
                index,
                card,
                isMine: true,
                myHero: extractHeroInfo(memoryData[belong]),
                otherHero: extractHeroInfo(memoryData[other])
            });
            getSocket(roomNumber, other).emit("OUT_EFFECT", {
                index,
                card,
                isMine: false,
                myHero: extractHeroInfo(memoryData[other]),
                otherHero: extractHeroInfo(memoryData[belong])
            })
        }

        if (card.isTarget) {
            card.onChooseTarget({
                myGameData: memoryData[belong],
                otherGameData: memoryData[other],
                thisCard: card,
                chooseCard: chooseCardList[targetIndex],
                effectIndex: args.effectIndex,
                fromIndex: -1,
                toIndex: targetIndex,
                specialMethod: mySpecialMethod
            });
        }

        if (card && card.onStart) {
            card.onStart({
                myGameData: memoryData[belong],
                otherGameData: memoryData[other],
                thisCard: card,
                specialMethod: mySpecialMethod
            });
        }

        memoryData[belong]["tableCards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[belong],
                    otherGameData: memoryData[other],
                    thisCard: c,
                    position: CardPosition.TABLE,
                    specialMethod: mySpecialMethod
                })
            }
        });
        memoryData[belong]["cards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[belong],
                    otherGameData: memoryData[other],
                    thisCard: c,
                    position: CardPosition.HANDS,
                    specialMethod: mySpecialMethod
                })
            }
        });
        memoryData[other]["tableCards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[other],
                    otherGameData: memoryData[belong],
                    thisCard: c,
                    position: CardPosition.TABLE,
                    specialMethod: mySpecialMethod
                })
            }
        });
        memoryData[other]["cards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[other],
                    otherGameData: memoryData[belong],
                    thisCard: c,
                    position: CardPosition.HANDS,
                    specialMethod: mySpecialMethod
                })
            }
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
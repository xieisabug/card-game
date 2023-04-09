const {CardType, TargetType, CardPosition} = require("../constants");
const {extractHeroInfo} = require("../utils");
const {getRoomData, getSocket} = require("../cache");
const {checkPvpWin, checkPveWin} = require("./checkWin");
const {error} = require("./log");
const {getSpecialMethod} = require("./getSpecialMethod");
const {checkCardDieEvent} = require("./checkCardDieEvent");

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
            let targetIndex = args.targetIndex;
            let chooseCardList = [];

            if (card.targetType === TargetType.MY_TABLE_CARD) {
                chooseCardList = memoryData[belong]["tableCards"];
            } else if (card.targetType === TargetType.OTHER_TABLE_CARD) {
                chooseCardList = memoryData[other]["tableCards"];
            } else if (card.targetType === TargetType.ALL_TABLE_CARD) {
                chooseCardList =
                    memoryData[other]["tableCards"].slice()
                        .concat(memoryData[belong]["tableCards"].slice());
            } else if (card.targetType === TargetType.ALL_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList =
                    memoryData[other]["tableCards"]
                        .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1) && !i.isHide)
                        .concat(memoryData[belong]["tableCards"]
                            .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1)));
            } else if (card.targetType === TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList =
                    memoryData[other]["tableCards"]
                        .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1) && !i.isHide)
                        .concat(memoryData[belong]["tableCards"]
                            .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1)));
            } else if (card.targetType === TargetType.MY_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList = memoryData[belong]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1));
            } else if (card.targetType === TargetType.MY_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList = memoryData[belong]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1));
            } else if (card.targetType === TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList = memoryData[other]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1));
            } else if (card.targetType === TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList = memoryData[other]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1));
            }
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
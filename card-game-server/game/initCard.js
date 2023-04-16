const log4js = require("log4js");
const logger = log4js.getLogger('play');

const {getRoomData} = require("../cache");
const {sendCards} = require("./sendCards");
const {getNextCard} = require("./utils");
const {findCardsById, findUserById} = require("../db");
const {shuffle} = require("../utils");
const {CardMap, MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, MAX_THINK_TIME_NUMBER} = require("../constants");

/**
 * 开局
 */
function initCard(roomNumber, oneCardsId, twoCardsId, oneUserId, twoUserId) {
    const memoryData = getRoomData(roomNumber);
    let random = memoryData.rand() * 2;

    let first = random >= 1 ? "one" : "two"; // 判断当前是哪个玩家出牌
    let second = random < 1 ? "one" : "two";

    logger.info(`roomNumber:${roomNumber} 先手:${first} 初始化抽牌`);

    Promise
        .all([findCardsById(oneCardsId), findCardsById(twoCardsId), findUserById(oneUserId), findUserById(twoUserId)])
        .then((results) => {
            let oneCards = results[0].cardIdList;
            let twoCards = results[1].cardIdList;
            let oneUser = {nickname: results[2].nickname};
            let twoUser = {nickname: results[3].nickname};

            memoryData["one"]["remainingCards"] = shuffle(memoryData.rand, oneCards.map((id, index) => Object.assign({k: `one-${index}`}, CardMap[id])));
            memoryData["two"]["remainingCards"] = shuffle(memoryData.rand, twoCards.map((id, index) => Object.assign({k: `two-${index}`}, CardMap[id])));

            let firstRemainingCards = memoryData[first]["remainingCards"];
            let secondRemainingCards = memoryData[second]["remainingCards"];

            Object.assign(memoryData[first], {
                cards: [
                    getNextCard(firstRemainingCards),
                    getNextCard(firstRemainingCards),
                    getNextCard(firstRemainingCards),
                    getNextCard(firstRemainingCards),
                ],
                tableCards: [],
                useCards: [],
                life: 30,
                fee: 1,
                maxFee: 1,
                cardIndexNo: 40
            });
            Object.assign(memoryData[second], {
                cards: [
                    getNextCard(secondRemainingCards),
                    getNextCard(secondRemainingCards),
                    getNextCard(secondRemainingCards),
                    getNextCard(secondRemainingCards)
                ],
                tableCards: [],
                useCards: [],
                life: 30,
                fee: 1,
                maxFee: 1,
                cardIndexNo: 40
            });

            memoryData['currentRound'] = first;
            memoryData[first]['info'] = oneUser;
            memoryData[second]['info'] = twoUser;

            memoryData[first]['maxHandCardNumber'] = MAX_HAND_CARD_NUMBER;
            memoryData[second]['maxHandCardNumber'] = MAX_HAND_CARD_NUMBER;
            memoryData[first]['maxTableCardNumber'] = MAX_BASE_TABLE_CARD_NUMBER;
            memoryData[second]['maxTableCardNumber'] = MAX_BASE_TABLE_CARD_NUMBER;
            memoryData[first]['maxThinkTimeNumber'] = MAX_THINK_TIME_NUMBER;
            memoryData[second]['maxThinkTimeNumber'] = MAX_THINK_TIME_NUMBER;
            sendCards(roomNumber);


            memoryData[first]["cards"].push(getNextCard(firstRemainingCards));
            sendCards(roomNumber);

            memoryData[first].socket.emit("YOUR_TURN");
        })
        .catch(r => {
            logger.error(JSON.stringify(r));
        });
}

module.exports = {
    initCard
}
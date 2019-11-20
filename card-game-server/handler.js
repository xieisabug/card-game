let {
    CardType, TargetType, CardMap, CardPosition, MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, MAX_THINK_TIME_NUMBER, 
    AttackAnimationType, AttackType, GameMode, UserOperatorType
} = require('./constants');
const log4js = require('log4js');
const uuidv4 = require('uuid/v4');
const {findCardsById, findUserById, findNextLevel, userLevelUp, saveUserOperator} = require('./db');
const {shuffle, extractHeroInfo, levelCanUp, getLevelUpExp} = require('./utils');
const {levelList, maxLevelId} = require('./level/level-utils');
const logger = log4js.getLogger('play');
const seedrandom = require('seedrandom');

const waitPairQueue = []; // 等待排序的队列
const memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
const existUserGameRoomMap = {}; // 缓存用户的房间号， key => 用户标识，value => 房间号

module.exports = function handleSynchronousClient(args, socket, socketServer) {
    switch (args.type) {
        case "CONNECT":
            connect(args, socket, socketServer);
            break;
        case "END_MY_TURN":
            endMyTurn(args, socket);
            break;
        case "OUT_CARD":
            outCard(args, socket);
            break;
        case "ATTACK_CARD":
            attackCard(args, socket);
            break;
        case "ATTACK_HERO":
            attackHero(args, socket);
            break;
        case "RESTART":
            restart(args, socket);
            break;
        case "NEXT_LEVEL":
            nextLevel(args, socket);
            break;
        case "WIN_EXIT":
            winExit(args, socket);
            break;
    }
};

/**
 * 连接
 * @param args r:房间号码
 * @param socket
 * @param socketServer
 */
function connect(args, socket, socketServer) {
    // let roomNumber = args.r;
    let userId = args.userId, cardsId = args.cardsId, isPve = args.isPve;

    // 断线重连
    if (existUserGameRoomMap[userId]) {
        let roomNumber = existUserGameRoomMap[userId];
        let identity = memoryData[roomNumber]["one"].userId === userId ? "one" : "two";
        memoryData[roomNumber][identity].socket = socket;
        memoryData[roomNumber][identity].socket.emit("RECONNECT", {
            roomNumber: roomNumber,
            memberId: identity
        });
        logger.info(`roomNumber:${roomNumber} userId:${userId} identity:${identity} reconnect`);

        sendCards(roomNumber, identity);

        if (memoryData[roomNumber]['currentRound'] === identity) {
            memoryData[roomNumber][identity].socket.emit("YOUR_TURN");
        }
    } else {
        if (isPve) {
            findNextLevel(userId)
                .then(levelId => {
                    if (levelId <= maxLevelId) {
                        let roomNumber = uuidv4();
                        let seed = Math.floor(Math.random() * 10000);
                        memoryData[roomNumber] = {
                            isPve,
                            startTime: new Date(),
                            gameMode: GameMode.PVE1,
                            seed,
                            rand: seedrandom(seed)
                        };
                        existUserGameRoomMap[userId] = roomNumber;

                        memoryData[roomNumber]['one'] = {
                            userId, cardsId, socket, roomNumber
                        };
                        memoryData[roomNumber]['two'] = new levelList[levelId](memoryData[roomNumber], {
                            outCard,
                            attackCard,
                            endMyTurn
                        });

                        logger.info(`roomNumber:${roomNumber} userId:${userId} levelId:${levelId} pve start`);

                        socket.join(roomNumber);
                        socket.emit("START", {
                            roomNumber: roomNumber,
                            memberId: "one"
                        });

                        memoryData[roomNumber]['two'].initCard();

                        saveUserOperator(userId, { type: UserOperatorType.playPve, levelId: levelId });
                    } else {
                        socket.emit("NO_MORE_LEVEL");
                    }
                });
            return;
        }

        if (waitPairQueue.length === 0) {
            waitPairQueue.push({
                userId, cardsId, socket
            });

            logger.info(`userId:${userId} cardsId:${cardsId} pvp wait`);
            socket.emit("WAITE");
        } else {
            if (waitPairQueue.some(p => p.userId === userId)) { // 当前用户已经在匹配了
                socket.emit("WAITE");
                return;
            }

            let waitPlayer = waitPairQueue.splice(0, 1)[0];

            let roomNumber = uuidv4();
            let seed = Math.floor(Math.random() * 10000);
            memoryData[roomNumber] = {
                isPve,
                startTime: new Date(),
                gameMode: GameMode.PVP1,
                seed,
                rand: seedrandom(seed),
                round: 1
            };
            // 缓存两个用户的房间代码
            existUserGameRoomMap[waitPlayer.userId] = roomNumber;
            existUserGameRoomMap[userId] = roomNumber;

            waitPlayer.roomNumber = roomNumber;
            memoryData[roomNumber]['one'] = waitPlayer;
            memoryData[roomNumber]['two'] = {
                userId, cardsId, socket, roomNumber
            };

            logger.info(`roomNumber:${roomNumber} one userId1:${waitPlayer.userId} cardsId1:${waitPlayer.cardsId} two userId2:${userId} cardsId2:${cardsId} pvp start`);

            socket.join(roomNumber);
            waitPlayer.socket.join(roomNumber);

            waitPlayer.socket.emit("START", {
                roomNumber: roomNumber,
                memberId: "one"
            });

            socket.emit("START", {
                roomNumber: roomNumber,
                memberId: "two"
            });

            initCard(roomNumber, waitPlayer.cardsId, cardsId, waitPlayer.userId, userId);

            saveUserOperator(userId, { type: UserOperatorType.playPvp, with: memoryData[roomNumber]['one'].userId, roomNumber: roomNumber });
        }
    }
}

/**
 * 开局
 */
function initCard(roomNumber, oneCardsId, twoCardsId, oneUserId, twoUserId) {
    let random = memoryData[roomNumber].rand() * 2;

    let first = random >= 1 ? "one" : "two"; // 判断当前是哪个玩家出牌
    let second = random < 1 ? "one" : "two";

    logger.info(`roomNumber:${roomNumber} first:${first} init first`);

    Promise
        .all([findCardsById(oneCardsId), findCardsById(twoCardsId), findUserById(oneUserId), findUserById(twoUserId)])
        .then((results) => {
            let oneCards = results[0].cardIdList;
            let twoCards = results[1].cardIdList;
            let oneUser = {nickname: results[2].nickname};
            let twoUser = {nickname: results[3].nickname};

            memoryData[roomNumber]["one"]["remainingCards"] = shuffle(memoryData[roomNumber].rand, oneCards.map((id, index) => Object.assign({k: `one-${index}`}, CardMap[id])));
            memoryData[roomNumber]["two"]["remainingCards"] = shuffle(memoryData[roomNumber].rand, twoCards.map((id, index) => Object.assign({k: `two-${index}`}, CardMap[id])));

            let firstRemainingCards = memoryData[roomNumber][first]["remainingCards"];
            let secondRemainingCards = memoryData[roomNumber][second]["remainingCards"];

            Object.assign(memoryData[roomNumber][first], {
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
            Object.assign(memoryData[roomNumber][second], {
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

            memoryData[roomNumber]['currentRound'] = first;
            memoryData[roomNumber][first]['info'] = oneUser;
            memoryData[roomNumber][second]['info'] = twoUser;

            memoryData[roomNumber][first]['maxHandCardNumber'] = MAX_HAND_CARD_NUMBER;
            memoryData[roomNumber][second]['maxHandCardNumber'] = MAX_HAND_CARD_NUMBER;
            memoryData[roomNumber][first]['maxTableCardNumber'] = MAX_BASE_TABLE_CARD_NUMBER;
            memoryData[roomNumber][second]['maxTableCardNumber'] = MAX_BASE_TABLE_CARD_NUMBER;
            memoryData[roomNumber][first]['maxThinkTimeNumber'] = MAX_THINK_TIME_NUMBER;
            memoryData[roomNumber][second]['maxThinkTimeNumber'] = MAX_THINK_TIME_NUMBER;
            sendCards(roomNumber);


            memoryData[roomNumber][first]["cards"].push(getNextCard(firstRemainingCards));
            sendCards(roomNumber);

            memoryData[roomNumber][first].socket.emit("YOUR_TURN");
        })
        .catch(r => {
            logger.error(JSON.stringify(r));
        });
}

/**
 * 结束当前回合
 * @param args r: 房间号
 * @param socket
 */
function endMyTurn(args, socket) {
    let roomNumber = args.r;
    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    if (memoryData[roomNumber][belong].maxFee < 10) {
        memoryData[roomNumber][belong].maxFee += 1;
    }
    let mySpecialMethod = getSpecialMethod(belong, roomNumber);
    memoryData[roomNumber][belong]["cards"].forEach((c, index) => {
        if (c.onMyTurnStart) {
            c.onMyTurnStart({
                myGameData: memoryData[roomNumber][belong],
                otherGameData: memoryData[roomNumber][other],
                thisCard: c,
                thisCardIndex: index,
                position: CardPosition.HANDS,
                specialMethod: mySpecialMethod
            });
        }
    });
    memoryData[roomNumber][belong].tableCards.forEach((c, index) => {
        if (c.onMyTurnEnd) {
            c.onMyTurnEnd({
                myGameData: memoryData[roomNumber][belong],
                otherGameData: memoryData[roomNumber][other],
                thisCard: c,
                thisCardIndex: index,
                position: CardPosition.TABLE,
                specialMethod: mySpecialMethod
            })
        }

        if (c.isShortInvincible) {
            c.shortInvincibleRound -= 1;
            if (c.shortInvincibleRound === 0) {
                c.isShortInvincible = false;
            }
        }

        c.isActionable = true;
    });

    if (belong === "two") {
        memoryData[roomNumber].round += 1;
    }

    memoryData[roomNumber][other].fee = memoryData[roomNumber][other].maxFee;
    memoryData[roomNumber][other].socket.emit("YOUR_TURN");
    memoryData[roomNumber]['currentRound'] = other;
    if (memoryData[roomNumber][other]["cards"].length < memoryData[roomNumber][other]["maxHandCardNumber"]
        && memoryData[roomNumber][other]['remainingCards'].length > 0) {
        memoryData[roomNumber][other]["cards"].push(getNextCard(memoryData[roomNumber][other]['remainingCards']));
    } else {
        if (memoryData[roomNumber][other]["cards"].length < memoryData[roomNumber][other]["maxHandCardNumber"]) {
            error(memoryData[roomNumber][other].socket, `您的手牌超过了${memoryData[roomNumber][other]["maxHandCardNumber"]}张，不能抽牌`)
        } else if (memoryData[roomNumber][other]['remainingCards'].length === 0) {
            error(memoryData[roomNumber][other].socket, `没有剩余卡牌了，不能抽牌`)
        }
        
    }
    let otherSpecialMethod = getSpecialMethod(other, roomNumber);

    memoryData[roomNumber][other]["cards"].forEach((c, index) => {
        if (c.onMyTurnStart) {
            c.onMyTurnStart({
                myGameData: memoryData[roomNumber][other],
                otherGameData: memoryData[roomNumber][belong],
                thisCard: c,
                thisCardIndex: index,
                position: CardPosition.HANDS,
                specialMethod: otherSpecialMethod
            });
        }
    });
    memoryData[roomNumber][other]["tableCards"].forEach((c, index) => {
        if (c.onMyTurnStart) {
            c.onMyTurnStart({
                myGameData: memoryData[roomNumber][other],
                otherGameData: memoryData[roomNumber][belong],
                thisCard: c,
                thisCardIndex: index,
                position: CardPosition.TABLE,
                specialMethod: otherSpecialMethod
            });
        }

        if (c.isShortInvincible) {
            c.shortInvincibleRound -= 1;
            if (c.shortInvincibleRound === 0) {
                c.isShortInvincible = false;
            }
        }
    });

    sendCards(roomNumber)
}

/**
 * 出牌
 * @param args
 * @param socket
 */
function outCard(args, socket) {
    let roomNumber = args.r, index = args.index, card;
    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    if (index !== -1 && memoryData[roomNumber][belong]["cards"][index].cost <= memoryData[roomNumber][belong]["fee"]) {
        card = memoryData[roomNumber][belong]["cards"].splice(index, 1)[0];
        if (card.cardType === CardType.CHARACTER && memoryData[roomNumber][belong]["tableCards"].length >= memoryData[roomNumber][belong]['maxTableCardNumber']) {
            error(memoryData[roomNumber][belong].socket, `您的基础卡牌只能有${memoryData[roomNumber][belong]['maxTableCardNumber']}张`);
            return;
        }
        memoryData[roomNumber][belong]['useCards'].push(Object.assign({outRound: memoryData[roomNumber].round}, card));
        memoryData[roomNumber][belong]["fee"] -= card.cost;

        let mySpecialMethod = getSpecialMethod(belong, roomNumber); 

        if (card.isFullOfEnergy) {
            card.isActionable = true;
        }

        if (card.cardType === CardType.CHARACTER) {
            memoryData[roomNumber][belong]["tableCards"].push(card);
            memoryData[roomNumber][belong].socket.emit("OUT_CARD", {
                index,
                toIndex: -1,
                card,
                isMine: true,
                myHero: extractHeroInfo(memoryData[roomNumber][belong]),
                otherHero: extractHeroInfo(memoryData[roomNumber][other])
            });
            memoryData[roomNumber][other].socket.emit("OUT_CARD", {
                index,
                toIndex: -1,
                card,
                isMine: false,
                myHero: extractHeroInfo(memoryData[roomNumber][other]),
                otherHero: extractHeroInfo(memoryData[roomNumber][belong])
            })
        } else if (card.cardType === CardType.EFFECT) {
            memoryData[roomNumber][belong].socket.emit("OUT_EFFECT", {
                index,
                card,
                isMine: true,
                myHero: extractHeroInfo(memoryData[roomNumber][belong]),
                otherHero: extractHeroInfo(memoryData[roomNumber][other])
            });
            memoryData[roomNumber][other].socket.emit("OUT_EFFECT", {
                index,
                card,
                isMine: false,
                myHero: extractHeroInfo(memoryData[roomNumber][other]),
                otherHero: extractHeroInfo(memoryData[roomNumber][belong])
            })
        }

        if (card.isTarget) {
            let targetIndex = args.targetIndex;
            let chooseCardList = [];

            if (card.targetType === TargetType.MY_TABLE_CARD) {
                chooseCardList = memoryData[roomNumber][belong]["tableCards"];
            } else if (card.targetType === TargetType.OTHER_TABLE_CARD) {
                chooseCardList = memoryData[roomNumber][other]["tableCards"];
            } else if (card.targetType === TargetType.ALL_TABLE_CARD) {
                chooseCardList =
                    memoryData[roomNumber][other]["tableCards"].slice()
                        .concat(memoryData[roomNumber][belong]["tableCards"].slice());
            } else if (card.targetType === TargetType.ALL_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList =
                    memoryData[roomNumber][other]["tableCards"]
                        .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1) && !i.isHide)
                        .concat(memoryData[roomNumber][belong]["tableCards"]
                            .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1)));
            } else if (card.targetType === TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList =
                    memoryData[roomNumber][other]["tableCards"]
                        .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1) && !i.isHide)
                        .concat(memoryData[roomNumber][belong]["tableCards"]
                            .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1)));
            } else if (card.targetType === TargetType.MY_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList = memoryData[roomNumber][belong]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1));
            } else if (card.targetType === TargetType.MY_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList = memoryData[roomNumber][belong]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1));
            } else if (card.targetType === TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList = memoryData[roomNumber][other]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) !== -1));
            } else if (card.targetType === TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList = memoryData[roomNumber][other]["tableCards"]
                    .slice().filter(i => card.filter.every(t => i.type.indexOf(t) === -1));
            }
            card.onChooseTarget({
                myGameData: memoryData[roomNumber][belong],
                otherGameData: memoryData[roomNumber][other],
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
                myGameData: memoryData[roomNumber][belong],
                otherGameData: memoryData[roomNumber][other],
                thisCard: card,
                specialMethod: mySpecialMethod
            });
        }

        memoryData[roomNumber][belong]["tableCards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[roomNumber][belong],
                    otherGameData: memoryData[roomNumber][other],
                    thisCard: c,
                    position: CardPosition.TABLE,
                    specialMethod: mySpecialMethod
                })
            }
        });
        memoryData[roomNumber][belong]["cards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[roomNumber][belong],
                    otherGameData: memoryData[roomNumber][other],
                    thisCard: c,
                    position: CardPosition.HANDS,
                    specialMethod: mySpecialMethod
                })
            }
        });
        memoryData[roomNumber][other]["tableCards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[roomNumber][other],
                    otherGameData: memoryData[roomNumber][belong],
                    thisCard: c,
                    position: CardPosition.TABLE,
                    specialMethod: mySpecialMethod
                })
            }
        });
        memoryData[roomNumber][other]["cards"].forEach(c => {
            if (c.onOtherCardStart) {
                c.onOtherCardStart({
                    myGameData: memoryData[roomNumber][other],
                    otherGameData: memoryData[roomNumber][belong],
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

/**
 * 攻击某个卡牌
 * @param args index: 攻击牌, attackIndex: 被攻击牌
 * @param socket
 */
function attackCard(args, socket) {
    let roomNumber = args.r, myK = args.myK, attackK = args.attackK, card, attackCard;
    if (!memoryData[roomNumber]) {
        logger.error(`No this room: ${roomNumber}`);
        return
    }

    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    let index = memoryData[roomNumber][belong]["tableCards"].findIndex(c => c.k === myK);
    let attackIndex = memoryData[roomNumber][other]["tableCards"].findIndex(c => c.k === attackK);

    if (index !== -1 && attackIndex !== -1
        && memoryData[roomNumber][other]["tableCards"].length > attackIndex
        && memoryData[roomNumber][belong]["tableCards"].length > index) {

        card = memoryData[roomNumber][belong]["tableCards"][index];
        attackCard = memoryData[roomNumber][other]["tableCards"][attackIndex];
        let hasDedication = memoryData[roomNumber][other]["tableCards"].some(c => c.isDedication);

        if (attackCard.isDedication || !hasDedication) { // 如果有奉献，必须攻击奉献单位
            if (attackCard.isStrong) { // 强壮
                attackCard.isStrong = false;
            } else if (attackCard.isShortInvincible) { // 短时间无敌

            } else {
                attackCard.life -= card.attack;
            }

            if (card.isStrong) { // 强壮
                card.isStrong = false;
            } else if (attackCard.isShortInvincible) { // 短时间无敌

            } else {
                card.life -= attackCard.attack;
            }

            card.isActionable = false;
            if (card.isHide) {
                card.isHide = false;
            }

            memoryData[roomNumber][belong].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });
            memoryData[roomNumber][other].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });

            if (card.onAttack) {
                card.onAttack({
                    myGameData: memoryData[roomNumber][belong],
                    otherGameData: memoryData[roomNumber][other],
                    thisCard: card,
                    beAttackedCard: attackCard,
                    specialMethod: getSpecialMethod(belong, roomNumber),
                })
            }
            if (attackCard.onBeAttacked) {
                attackCard.onBeAttacked({
                    myGameData: memoryData[roomNumber][other],
                    otherGameData: memoryData[roomNumber][belong],
                    thisCard: attackCard,
                    attackCard: card,
                    specialMethod: getSpecialMethod(other, roomNumber),
                })
            }

            memoryData[roomNumber][belong]["tableCards"].forEach(c => {
                if (c.onOtherCardAttack && c.k !== card.k) {
                    c.onOtherCardAttack({
                        myGameData: memoryData[roomNumber][belong],
                        otherGameData: memoryData[roomNumber][other],
                        attackCard: card,
                        beAttackedCard: attackCard,
                        thisCard: c,
                        specialMethod: getSpecialMethod(belong, roomNumber),
                    })
                }
            });

            memoryData[roomNumber][other]["tableCards"].forEach(c => {
                if (c.onOtherCardBeAttacked && c.k !== attackCard.k) {
                    c.onOtherCardBeAttacked({
                        myGameData: memoryData[roomNumber][other],
                        otherGameData: memoryData[roomNumber][belong],
                        attackCard: card,
                        beAttackedCard: attackCard,
                        thisCard: c,
                        specialMethod: getSpecialMethod(other, roomNumber),
                    })
                }
            });

            checkCardDieEvent(roomNumber);
        } else {
            error(socket, `您必须攻击带有奉献的单位`);
        }
    } else {
        logger.error(`roomNumber:${roomNumber} Not exist card my ${myK} and other ${attackK}, index: ${index} attackIndex: ${attackIndex}`)
    }

    checkPvpWin(roomNumber);
    checkPveWin(roomNumber);
}

/**
 * 攻击对方英雄
 * @param args
 * @param socket
 */
function attackHero(args, socket) {
    let roomNumber = args.r, k = args.k, card;
    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    let index = memoryData[roomNumber][belong]["tableCards"].findIndex(c => c.k === k);

    if (index !== -1) {
        let hasDedication = memoryData[roomNumber][other]["tableCards"].some(c => c.isDedication);

        card = memoryData[roomNumber][belong]["tableCards"][index];

        if (!hasDedication) {
            memoryData[roomNumber][other].life -= card.attack;
            card.isActionable = false;
            memoryData[roomNumber][belong].socket.emit("ATTACK_HERO", {
                k,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card: card,
                hero: {
                    life: memoryData[roomNumber][other].life
                }
            });

            memoryData[roomNumber][other].socket.emit("ATTACK_HERO", {
                k,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card: card,
                hero: {
                    life: memoryData[roomNumber][other].life
                }
            });
        } else {
            error(socket, `您必须攻击带有奉献的单位`);
        }
    }

    checkPvpWin(roomNumber);
    checkPveWin(roomNumber);
}

/**
 * 重新开始牌局，仅限于pve
 * @param args
 */
function restart(args) {
    let roomNumber = args.r;
    if (memoryData[roomNumber] && memoryData[roomNumber].gameMode === GameMode.PVE1) {
        memoryData[roomNumber]['two'].initCard();
    }
}

/**
 * 进入下一关，仅限于pve
 * @param args
 * @param socket
 */
function nextLevel(args, socket) {

    let roomNumber = args.r;
    let userId = memoryData[roomNumber]['one']['userId'];
    memoryData[roomNumber].startTime = new Date();

    findNextLevel(userId)
        .then(levelId => {
            if (levelId <= maxLevelId) {
                memoryData[roomNumber]['two'] = new levelList[levelId](memoryData[roomNumber]);

                socket.join(roomNumber);
                socket.emit("START", {
                    roomNumber: roomNumber,
                    memberId: "one"
                });

                memoryData[roomNumber]['two'].initCard();
            } else {

            }
        })
}

/**
 * 胜利之后退出
 * @param args
 * @param socket
 */
function winExit(args, socket) {
    let roomNumber = args.r;
    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two";
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";
    let userId = memoryData[roomNumber][belong].userId;

    delete memoryData[roomNumber][belong];

    if (!memoryData[roomNumber][other]) {
        delete memoryData[roomNumber]
    }

    delete existUserGameRoomMap[userId];
}

/**
 * 发送最新的牌局信息
 * @param roomNumber 房间号
 * @param identity 发送给哪一方，如果指定了则发送给一方，否则两方都发送
 */
function sendCards(roomNumber, identity) {

    if (identity) {
        let otherIdentity = identity === "one" ? "two" : "one";

        memoryData[roomNumber][identity].socket.emit("SEND_CARD", {
            myCard: memoryData[roomNumber][identity]["cards"],
            myTableCard: memoryData[roomNumber][identity]["tableCards"],
            otherTableCard: memoryData[roomNumber][otherIdentity]["tableCards"],
            myLife: memoryData[roomNumber][identity]["life"],
            otherLife: memoryData[roomNumber][otherIdentity]["life"],
            myFee: memoryData[roomNumber][identity]["fee"],
            otherFee: memoryData[roomNumber][otherIdentity]["fee"],
            myMaxFee: memoryData[roomNumber][identity]["maxFee"],
            otherMaxFee: memoryData[roomNumber][otherIdentity]["maxFee"],
            myMaxThinkTimeNumber: memoryData[roomNumber][otherIdentity]["maxThinkTimeNumber"],
            myInfo: memoryData[roomNumber][identity]["info"],
            otherInfo: memoryData[roomNumber][otherIdentity]["info"],
            gameMode: memoryData[roomNumber]['gameMode']
        });
    } else {
        sendCards(roomNumber, "one");
        sendCards(roomNumber, "two");
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
    if (memoryData[roomNumber]["one"]["tableCards"].some(c => c.life <= 0) || memoryData[roomNumber]["two"]["tableCards"].some(c => c.life <= 0)) {

        let oneSpecialMethod = getSpecialMethod("one", roomNumber),
            twoSpecialMethod = getSpecialMethod("two", roomNumber);

        for (let i = memoryData[roomNumber]["one"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData[roomNumber]["one"]["tableCards"][i];
            if (c.life <= 0) {
                if (c.onEnd) {
                    c.onEnd({
                        myGameData: memoryData[roomNumber]["one"],
                        otherGameData: memoryData[roomNumber]["two"],
                        thisCard: c,
                        specialMethod: oneSpecialMethod
                    });
                }
                memoryData[roomNumber]["one"]["tableCards"].splice(i, 1);
                myKList.push(c.k);
                // oneSpecialMethod.dieCardAnimation(true, c);
            }
        }

        for (let i = memoryData[roomNumber]["two"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData[roomNumber]["two"]["tableCards"][i];
            if (c.life <= 0) {
                if (c.onEnd) {
                    c.onEnd({
                        myGameData: memoryData[roomNumber]["two"],
                        otherGameData: memoryData[roomNumber]["one"],
                        thisCard: c,
                        specialMethod: twoSpecialMethod
                    });
                }
                memoryData[roomNumber]["two"]["tableCards"].splice(i, 1);
                otherKList.push(c.k);
                // twoSpecialMethod.dieCardAnimation(true, c);
            }
        }
        checkCardDieEvent(roomNumber, level + 1, myKList, otherKList);
    }
    if (level === 1 && (myKList.length !== 0 || otherKList.length !== 0)) {
        let oneSpecialMethod = getSpecialMethod("one", roomNumber),
            twoSpecialMethod = getSpecialMethod("two", roomNumber);

        oneSpecialMethod.dieCardAnimation(true, myKList, otherKList);
    }
}

/**
 * 检查pve模式下是否获胜
 * @param roomNumber 房间号码
 */
function checkPveWin(roomNumber) {
    if (memoryData[roomNumber].isPve) {
        if (memoryData[roomNumber]['two'].checkWin()) {
            memoryData[roomNumber]['two'].saveWin().then(result => {
                memoryData[roomNumber]['one'].socket.emit("END_GAME", {win: true, reward: result.reward});
                checkLevelUp(roomNumber);
            });
        }
    }
}

/**
 * 检查pvp模式是否获胜
 * @param roomNumber
 */
function checkPvpWin(roomNumber) {
    if (!memoryData[roomNumber].isPve) {
        if (memoryData[roomNumber]["one"].life <= 0) {
            memoryData[roomNumber]["two"].socket.emit("END_GAME", {win: true});
            memoryData[roomNumber]["one"].socket.emit("END_GAME", {win: false});
        } else if (memoryData[roomNumber]["two"].life <= 0) {
            memoryData[roomNumber]["one"].socket.emit("END_GAME", {win: true});
            memoryData[roomNumber]["two"].socket.emit("END_GAME", {win: false});
        }
    }
}

/**
 * 检查房间中的玩家是否可升级
 * @param roomNumber
 */
function checkLevelUp(roomNumber) {
    if (memoryData[roomNumber].isPve) {
        findUserById(memoryData[roomNumber]["one"].userId).then(u => {
            if (levelCanUp(u)) {
                userLevelUp(memoryData[roomNumber]["one"].userId, getLevelUpExp(u.level))
                    .then(() => {
                        memoryData[roomNumber]["one"].socket.emit("LEVEL_UP", {win: true});
                    })
            }
        })
    }
}

function log(socket, text) {
    socket.emit("LOG", {text});
}

function logAll(roomNumber, text) {
    memoryData[roomNumber]["one"]["socket"].emit("LOG", text);
    memoryData[roomNumber]["two"]["socket"].emit("LOG", text);
}

function error(socket, text) {
    socket.emit("ERROR", text);
}

function errorAll(roomNumber, text) {
    memoryData[roomNumber]["one"]["socket"].emit("ERROR", text);
    memoryData[roomNumber]["two"]["socket"].emit("ERROR", text);
}

function getNextCard(remainingCards) {
    if (remainingCards.length > 0) {
        return remainingCards.splice(0, 1)[0]
    } else {
        return null
    }
}

function getRandomCard(rand, remainingCards) {
    let index = Math.floor(rand() * remainingCards.length);
    return remainingCards.splice(index, 1)[0];
}

function getFilterCardTypeRandomCard(rand, remainingCards, cardType) {
    let cardIndex = [];
    remainingCards.forEach((c, index) => {
        if (c.cardType.indexOf(cardType) !== -1) {
            cardIndex.push(index)
        }
    });
    if (cardIndex.length !== 0) {
        let index = Math.floor(rand() * cardIndex.length);
        return remainingCards.splice(cardIndex[index], 1)[0]
    } else {
        return null
    }
}

function getSpecialMethod(identity, roomNumber) {
    let otherIdentity = identity === "one" ? "two" : "one";

    return {
        rand() {
            return memoryData[roomNumber].rand()
        },
        getGameCardKForMe() {
            memoryData[roomNumber][identity]['cardIndexNo'] += 1;
            return identity + '-' + memoryData[roomNumber][identity]['cardIndexNo']
        },
        getGameCardKForOther() {
            memoryData[roomNumber][otherIdentity]['cardIndexNo'] += 1;
            return otherIdentity + '-' + memoryData[roomNumber][otherIdentity]['cardIndexNo']
        },
        getRandomCardForMe(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][identity]['remainingCards']))
            }
            return ret;
        },
        getRandomCardForOther(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][otherIdentity]['remainingCards']))
            }
            return ret;
        },
        getNextCardForMe(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getNextCard(memoryData[roomNumber][identity]['remainingCards']))
            }
            return ret;
        },
        getNextCardForOther(number) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                ret.push(getRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][otherIdentity]['remainingCards']))
            }
            return ret;
        },
        getFilterCardTypeRandomCardForMe(number, cardType) {
            let ret = [];
            for (let i = 0; i < number; i++) {
                let randomCard = getFilterCardTypeRandomCard(memoryData[roomNumber].rand, memoryData[roomNumber][otherIdentity]['remainingCards'], cardType);
                if (randomCard) {
                    ret.push(randomCard)
                }
            }
            return ret;
        },
        outCardAnimation(isMine, card) {
            memoryData[roomNumber][identity].socket.emit("OUT_CARD", {
                index: -1,
                toIndex: -1,
                card,
                isMine: isMine,
                myHero: extractHeroInfo(memoryData[roomNumber][identity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][otherIdentity])
            });

            memoryData[roomNumber][otherIdentity].socket.emit("OUT_CARD", {
                index: -1,
                toIndex: -1,
                card,
                isMine: !isMine,
                myHero: extractHeroInfo(memoryData[roomNumber][otherIdentity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][identity])
            })
        },
        buffCardAnimation(isMine, fromIndex, toIndex, fromCard, toCard) {
            memoryData[roomNumber][identity].socket.emit("BUFF_CARD", {
                fromIndex,
                toIndex,
                fromCard,
                toCard,
                isMine,
                myHero: extractHeroInfo(memoryData[roomNumber][identity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][otherIdentity])
            });

            memoryData[roomNumber][otherIdentity].socket.emit("BUFF_CARD", {
                fromIndex,
                toIndex,
                fromCard,
                toCard,
                isMine: !isMine,
                myHero: extractHeroInfo(memoryData[roomNumber][otherIdentity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][identity])
            })
        },
        getCardAnimation(isMine, card) {
            memoryData[roomNumber][identity].socket.emit("GET_CARD", {
                isMine,
                card: isMine ? card : null,
                myHero: extractHeroInfo(memoryData[roomNumber][identity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][otherIdentity])
            });

            memoryData[roomNumber][otherIdentity].socket.emit("GET_CARD", {
                isMine: !isMine,
                card: !isMine ? card : null,
                myHero: extractHeroInfo(memoryData[roomNumber][identity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][otherIdentity])
            });
        },
        dieCardAnimation(isMine, myKList, otherKList) {
            memoryData[roomNumber][identity].socket.emit("DIE_CARD", {
                isMine,
                myKList,
                otherKList,
                myHero: extractHeroInfo(memoryData[roomNumber][identity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][otherIdentity])
            });

            memoryData[roomNumber][otherIdentity].socket.emit("DIE_CARD", {
                isMine: !isMine,
                myKList: otherKList,
                otherKList: myKList,
                myHero: extractHeroInfo(memoryData[roomNumber][identity]),
                otherHero: extractHeroInfo(memoryData[roomNumber][otherIdentity])
            });
        },
        attackCardAnimation(index, attackIndex, card, attackCard) {
            memoryData[roomNumber][identity].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });
            memoryData[roomNumber][otherIdentity].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });
        },
        checkWin() {
            checkPvpWin(roomNumber)
        },
        refreshGameData() {
            sendCards(roomNumber)
        }
    }
}
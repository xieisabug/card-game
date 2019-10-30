const {
    Cards,
    CardType,
    AttackType,
    AttackAnimationType
} = require("./constants");

const {shuffle} = require("./utils");

const uuidv4 = require('uuid/v4');
const seedrandom = require("seedrandom");

const waitPairQueue = []; // 等待排序的队列
const memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
const existUserGameRoomMap = {}; // 缓存用户的房间号， key => 用户标识，value => 房间号


module.exports = function handleSynchronousClient(args, socket, socketServer) {
    switch (args.type) {
        case "CONNECT":
            connect(args, socket, socketServer);
            break;
        case "ATTACK_CARD":
            attackCard(args, socket);
            break;
        case "OUT_CARD":
            outCard(args, socket);
            break;
    }
};

function connect(args, socket, socketServer) {
    const {userId} = args;
    if (existUserGameRoomMap[userId]) { // 如果存在已经加入的对局，则直接进入之前的对战
        let roomNumber = existUserGameRoomMap[userId];
        let identity = memoryData[roomNumber]["one"].userId === userId ? "one" : "two";
        memoryData[roomNumber][identity].socket = socket;
        memoryData[roomNumber][identity].socket.emit("RECONNECT", {
            roomNumber: roomNumber,
            memberId: identity
        });

        sendCards(roomNumber, identity); // 把牌发送给玩家

    } else {
        socket.emit("WAITE"); // 不管三七二十一，先给老子等起

        if (waitPairQueue.length === 0) {
            waitPairQueue.push({
                userId, socket
            });
    
            socket.emit("WAITE");
        } else {
            let waitPlayer = waitPairQueue.splice(0, 1)[0]; // 随便拉个小伙干一架
            let roomNumber = uuidv4(); // 生成房间号码
    
            let seed = Math.floor(Math.random() * 10000);
    
            // 初始化游戏数据
            waitPlayer.roomNumber = roomNumber; 
            memoryData[roomNumber] = {
                "one": waitPlayer,
                "two": {
                    userId, socket, roomNumber
                },
                seed, // 随机数种子
                rand: seedrandom(seed), // 随机方法
            };
            existUserGameRoomMap[userId] = roomNumber;
            existUserGameRoomMap[waitPlayer.userId] = roomNumber;
    
            // 进入房间
            socket.join(roomNumber);
            waitPlayer.socket.join(roomNumber);
    
            // 游戏初始化完成，发送游戏初始化数据
            waitPlayer.socket.emit("START", {
                roomNumber,
                memberId: "one"
            });
            socket.emit("START", {
                roomNumber,
                memberId: "two"
            });
    
            initCard(roomNumber);
        }
    }
}

function initCard(roomNumber) {
    let random = memoryData[roomNumber].rand() * 2;

    let first = random >= 1 ? "one" : "two"; // 判断当前是哪个玩家出牌
    let second = random < 1 ? "one" : "two";

    memoryData[roomNumber]["one"]["remainingCards"] = shuffle(memoryData[roomNumber].rand, Cards.map((c, index) => Object.assign({k : `one-${index}`}, c)));
    memoryData[roomNumber]["two"]["remainingCards"] = shuffle(memoryData[roomNumber].rand, Cards.map((c, index) => Object.assign({k : `two-${index}`}, c)));

    let firstRemainingCards = memoryData[roomNumber][first]["remainingCards"];
    let secondRemainingCards = memoryData[roomNumber][second]["remainingCards"];

    Object.assign(memoryData[roomNumber][first], {
        tableCards:[
            getNextCard(firstRemainingCards),
        ],
        cards: [
            getNextCard(firstRemainingCards),
            getNextCard(firstRemainingCards),
        ],
        fee: 10
    });

    Object.assign(memoryData[roomNumber][second], {
        tableCards:[
            getNextCard(secondRemainingCards),
        ],
        cards: [
            getNextCard(secondRemainingCards),
        ],
        fee: 10
    });

    sendCards(roomNumber);
    
}



function attackCard(args, socket) {
    let roomNumber = args.r, myK = args.myK, attackK = args.attackK, card, attackCard;

    if (!memoryData[roomNumber]) {
        return
    }

    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    let index = memoryData[roomNumber][belong]["tableCards"].findIndex(c => c.k === myK);
    let attackIndex = memoryData[roomNumber][other]["tableCards"].findIndex(c => c.k === attackK);

    if (index !== -1 && attackIndex !== -1 
        && memoryData[roomNumber][belong]["tableCards"].length > index 
        && memoryData[roomNumber][other]["tableCards"].length > attackIndex) {
        card = memoryData[roomNumber][belong]["tableCards"][index];
        attackCard = memoryData[roomNumber][other]["tableCards"][attackIndex];

        // 奉献处理
        let hasDedication = memoryData[roomNumber][other]["tableCards"].some(c => c.isDedication);

        if (attackCard.isDedication || !hasDedication) {
            // 符合奉献的条件
            if (attackCard.isStrong) { // 强壮
                attackCard.isStrong = false;
            } else {
                attackCard.life -= card.attack;
            }

            if (card.isStrong) { // 强壮
                card.isStrong = false;
            } else {
                card.life -= attackCard.attack;
            }

            if (card.onAttack) {
                card.onAttack({
                    myGameData: memoryData[roomNumber][belong],
                    otherGameData: memoryData[roomNumber][other],
                    thisCard: card,
                    beAttackCard: attackCard,
                })
            }

            if (attackCard.onBeAttacked) {
                attackCard.onBeAttacked({
                    myGameData: memoryData[roomNumber][other],
                    otherGameData: memoryData[roomNumber][belong],
                    thisCard: attackCard,
                    beAttackCard: card,
                })
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

            checkCardDieEvent(roomNumber);
        } else {
            // error 您必须攻击带有奉献的单位
        }
    }
    
}

function outCard(args, socket) {
    let roomNumber = args.r, index = args.index, card;

    if (!memoryData[roomNumber]) {
        return
    }

    let belong = memoryData[roomNumber]["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData[roomNumber]["one"].socket.id !== socket.id ? "one" : "two";

    // 判断费用和位置是否已经满了
    if (index !== -1 && memoryData[roomNumber][belong]['cards'][index].cost <= memoryData[roomNumber][belong]["fee"]) {
        card = memoryData[roomNumber][belong]["cards"].splice(index, 1)[0];
        if (card.cardType === CardType.CHARACTER && memoryData[roomNumber][belong]["tableCards"].length >= 10) {
            // error 场上怪物满了
            return;
        }

        memoryData[roomNumber][belong]["fee"] -= card.cost;

        memoryData[roomNumber][belong]["tableCards"].push(card);
        memoryData[roomNumber][belong].socket.emit("OUT_CARD", {
            index,
            card,
            isMine: true
        });
        memoryData[roomNumber][other].socket.emit("OUT_CARD", {
            index,
            card,
            isMine: false
        });

        let mySpecialMethod = getSpecialMethod(belong, roomNumber);
        if (card && card.onStart) {
            card.onStart({
                myGameData: memoryData[roomNumber][belong],
                otherGameData: memoryData[roomNumber][other],
                thisCard: card,
                specialMethod: mySpecialMethod
            })
        }

        checkCardDieEvent(roomNumber);
    } else {
        // error 费用不足
    }
}


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
                if (c.onEnd) { // 亡语
                    c.onEnd({
                        myGameData: memoryData[roomNumber]["one"],
                        otherGameData: memoryData[roomNumber]["two"],
                        thisCard: card,
                        specialMethod: oneSpecialMethod
                    })
                }
                myKList.push(c.k);
                memoryData[roomNumber]["one"]["tableCards"].splice(i, 1);
            }
        }
    
        for (let i = memoryData[roomNumber]["two"]["tableCards"].length - 1; i >= 0; i--) {
            let c = memoryData[roomNumber]["two"]["tableCards"][i];
    
            if (c.life <= 0) {
                if (c.onEnd) { // 亡语
                    c.onEnd({
                        myGameData: memoryData[roomNumber]["two"],
                        otherGameData: memoryData[roomNumber]["one"],
                        thisCard: card,
                        specialMethod: twoSpecialMethod
                    })
                }
                otherKList.push(c.k);
                memoryData[roomNumber]["two"]["tableCards"].splice(i, 1);
            }
        }
    
        checkCardDieEvent(roomNumber, level + 1, myKList, otherKList);
    }
    
    if (level === 1 && (myKList.length !== 0 || otherKList.length !== 0)) {
        getSpecialMethod("one", roomNumber).dieCardAnimation(true, myKList, otherKList);
    }
}

function getSpecialMethod(identity, roomNumber) {
    let otherIdentity = identity === "one" ? "two": "one";

    return {
        dieCardAnimation(isMine, myKList, otherKList) {
            memoryData[roomNumber][identity].socket.emit("DIE_CARD", {
                isMine,
                myKList,
                otherKList
            });

            memoryData[roomNumber][otherIdentity].socket.emit("DIE_CARD", {
                isMine: !isMine,
                myKList,
                otherKList
            });
        }
    }
}


function getNextCard(remainingCards) {
    if (remainingCards.length > 0) {
        return remainingCards.splice(0, 1)[0]
    } else {
        return null
    }
}

function sendCards(roomNumber, identity) {
    if (identity) {
        let otherIdentity = identity === "one" ? "two" : "one";

        memoryData[roomNumber][identity].socket.emit("SEND_CARD", {
            myCard: memoryData[roomNumber][identity]["cards"],
            myTableCard: memoryData[roomNumber][identity]["tableCards"],
            otherTableCard: memoryData[roomNumber][otherIdentity]["tableCards"],
        })
    } else {
        sendCards(roomNumber, "one");
        sendCards(roomNumber, "two");
    }
}
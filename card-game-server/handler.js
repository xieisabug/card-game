const {
    Cards
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
    }
};

function connect(args, socket, socketServer) {
    const {userId} = args;

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

function initCard(roomNumber) {
    let random = memoryData[roomNumber].rand() * 2;

    let first = random >= 1 ? "one" : "two"; // 判断当前是哪个玩家出牌
    let second = random < 1 ? "one" : "two";

    memoryData[roomNumber]["one"]["remainingCards"] = shuffle(memoryData[roomNumber].rand, Cards.map((c, index) => Object.assign({k : `one-${index}`}, c)));
    memoryData[roomNumber]["two"]["remainingCards"] = shuffle(memoryData[roomNumber].rand, Cards.map((c, index) => Object.assign({k : `two-${index}`}, c)));

    let firstRemainingCards = memoryData[roomNumber][first]["remainingCards"];
    let secondRemainingCards = memoryData[roomNumber][second]["remainingCards"];

    Object.assign(memoryData[roomNumber][first], {
        cards: [
            getNextCard(firstRemainingCards),
            getNextCard(firstRemainingCards),
        ]
    });

    Object.assign(memoryData[roomNumber][second], {
        cards: [
            getNextCard(secondRemainingCards),
        ]
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

    memoryData[roomNumber][belong].socket.emit("ATTACK_CARD", {
        k: attackK
    });

    memoryData[roomNumber][other].socket.emit("ATTACK_CARD", {
        k: attackK
    });
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
            myCard: memoryData[roomNumber][identity]["cards"]
        })
    } else {
        sendCards(roomNumber, "one");
        sendCards(roomNumber, "two");
    }
}
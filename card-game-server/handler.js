const uuidv4 = require('uuid/v4');

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

        // 初始化游戏数据
        waitPlayer.roomNumber = roomNumber; 
        memoryData[roomNumber] = {
            "one": waitPlayer,
            "two": {
                userId, socket, roomNumber
            },
            count: 0
        };
        existUserGameRoomMap[userId] = roomNumber;
        existUserGameRoomMap[waitPlayer.userId] = roomNumber;

        // 进入房间
        socket.join(roomNumber);
        waitPlayer.socket.join(roomNumber);

        // 游戏初始化完成，发送游戏初始化数据
        waitPlayer.socket.emit("START", {
            start: 0,
            roomNumber,
            memberId: "one"
        });
        socket.emit("START", {
            start: 0,
            roomNumber,
            memberId: "two"
        });
    }
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
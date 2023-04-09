const {
    existUserGameRoom,
    getRoomData,
    createRoomData,
    saveSocket,
    saveUserGameRoom,
    changeRoomData,
    waitPairQueue
} = require("../cache");
const {GameMode, UserOperatorType} = require("../constants");
const {levelList, maxLevelId} = require("../level/level-utils");
const {findNextLevel, saveUserOperator} = require("../db");
const {sendCards} = require("./sendCards");
const { v4: uuidv4 } = require('uuid');
const log4js = require("log4js");
const {initCard} = require("./initCard");
const {outCard} = require("./outCard");
const {endMyTurn} = require("./endMyTurn");
const {attackCard} = require("./attackCard");
const {attackHero} = require("./attackHero");
const logger = log4js.getLogger('play');
const seedrandom = require('seedrandom');

/**
 * 连接
 * @param args r:房间号码
 * @param socket
 * @param socketServer
 */
function connect(args, socket, socketServer) {
    // let roomNumber = args.r;
    let userId = args.userId, cardsId = args.cardsId, isPve = args.isPve;
    // 2023.4.9新增可以选择pvp模式，指定匹配某个房间或者随机匹配
    let pvpGameMode = args.pvpGameMode;

    // 断线重连
    if (existUserGameRoom(userId)) {
        let roomNumber = existUserGameRoom(userId);
        let memoryData = getRoomData(roomNumber);
        let identity = memoryData["one"].userId === userId ? "one" : "two";
        saveSocket(roomNumber, identity, socket);
        socket.emit("RECONNECT", {
            roomNumber: roomNumber,
            memberId: identity
        });
        logger.info(`roomNumber:${roomNumber} userId:${userId} identity:${identity} reconnect`);

        sendCards(roomNumber, identity);

        if (memoryData['currentRound'] === identity) {
            socket.emit("YOUR_TURN");
        }
    } else {
        if (isPve) {
            findNextLevel(userId)
                .then(levelId => {
                    if (levelId <= maxLevelId) {
                        const roomNumber = uuidv4();
                        const seed = Math.floor(Math.random() * 10000);
                        createRoomData(roomNumber, {
                            isPve,
                            startTime: new Date(),
                            gameMode: GameMode.PVE1,
                            seed,
                            rand: seedrandom(seed)
                        });
                        const memoryData = getRoomData(roomNumber);
                        saveUserGameRoom(userId, roomNumber);

                        changeRoomData(roomNumber, 'one', {
                            userId, cardsId, socket, roomNumber
                        });
                        changeRoomData(roomNumber, 'two', new levelList[levelId](memoryData, {
                            outCard,
                            attackCard,
                            attackHero,
                            endMyTurn
                        }));

                        logger.info(`roomNumber:${roomNumber} userId:${userId} levelId:${levelId} pve start`);

                        socket.join(roomNumber);
                        socket.emit("START", {
                            roomNumber: roomNumber,
                            memberId: "one"
                        });

                        getRoomData(roomNumber)['two'].initCard();

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
            socket.emit("WAIT");
        } else {
            if (waitPairQueue.some(p => p.userId === userId)) { // 当前用户已经在匹配了
                socket.emit("WAIT");
                return;
            }

            const waitPlayer = waitPairQueue.splice(0, 1)[0];

            const roomNumber = uuidv4();
            const seed = Math.floor(Math.random() * 10000);
            createRoomData(roomNumber, {
                isPve,
                startTime: new Date(),
                gameMode: GameMode.PVP1,
                seed,
                rand: seedrandom(seed),
                round: 1
            });

            // 缓存两个用户的房间代码
            saveUserGameRoom(waitPlayer.userId, roomNumber);
            saveUserGameRoom(userId, roomNumber);

            waitPlayer.roomNumber = roomNumber;
            changeRoomData(roomNumber, 'one', waitPlayer);
            changeRoomData(roomNumber, 'two', {
                userId, cardsId, socket, roomNumber
            });

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

            saveUserOperator(userId, { type: UserOperatorType.playPvp, with: memoryData['one'].userId, roomNumber: roomNumber });
        }
    }
}

module.exports = {
    connect
}
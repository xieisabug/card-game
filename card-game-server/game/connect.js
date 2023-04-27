const {
    existStartingUserGameRoom,
    getRoomData,
    createRoomData,
    saveSocket,
    saveUserGameRoom,
    changeRoomData,
    waitPairQueue
} = require("../cache");
const {MAX_THINK_TIME_NUMBER} = require("../constants")
const {GameMode, UserOperatorType, PvpMode} = require("../constants");
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
const {useSkill} = require("./useSkill");


/**
 * 连接
 * @param args r:房间号码
 * @param socket
 * @param socketServer
 */
function connect(args, socket, socketServer) {
    let userId = args.userId, cardsId = args.cardsId, isPve = args.isPve;
    let pvpGameMode = +args.pvpGameMode, // 2023.4.9新增可以选择pvp模式，指定匹配某个房间或者随机匹配
        r = args.r;

    // 断线重连
    if (existStartingUserGameRoom(userId)) {
        let roomNumber = existStartingUserGameRoom(userId);
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
        // pve部分
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
                            userId, cardsId, socket, roomNumber, myMaxThinkTimeNumber: MAX_THINK_TIME_NUMBER
                        });
                        changeRoomData(roomNumber, 'two', new levelList[levelId](memoryData, {
                            outCard,
                            useSkill,
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

        // pvp部分
        // 加入房间
        if (pvpGameMode === PvpMode.JOIN_ROOM) {
            if (!r) {
                socket.emit("ERROR", "房间号不能为空");
                return;
            }

            if (!getRoomData(r)) {
                socket.emit("ERROR", "房间号未找到");
                return;
            }

            if (getRoomData(r).startTime) {
                socket.emit("ERROR", "房间游戏已经开始");
                return;
            }

            // r就是房间号
            const roomNumber = r;
            const memoryData = getRoomData(roomNumber);
            saveUserGameRoom(userId, roomNumber);

            changeRoomData(roomNumber, 'startTime', new Date());
            changeRoomData(roomNumber, 'two', {
                userId, cardsId, socket, roomNumber, myMaxThinkTimeNumber: MAX_THINK_TIME_NUMBER
            });

            logger.info(`roomNumber:${roomNumber} one userId1:${memoryData['one'].userId} cardsId1:${memoryData['one'].cardsId} two userId2:${userId} cardsId2:${cardsId} pvp start`);

            socket.join(roomNumber);

            memoryData['one'].socket.emit("START", {
                roomNumber: roomNumber,
                memberId: "one"
            });

            socket.emit("START", {
                roomNumber: roomNumber,
                memberId: "two"
            });

            initCard(roomNumber, memoryData['one'].cardsId, cardsId, memoryData['one'].userId, userId);

            saveUserOperator(userId, { type: UserOperatorType.playPvp, with: memoryData['one'].userId, roomNumber: roomNumber });
        } else if (pvpGameMode === PvpMode.CREATE_ROOM) {
            // 创建房间
            let roomNumber = uuidv4();

            while (getRoomData(roomNumber)) {
                roomNumber = uuidv4();
            }
            console.log("create room : " + roomNumber)

            // r就是房间号
            const seed = Math.floor(Math.random() * 10000);
            createRoomData(roomNumber, {
                isPve,
                gameMode: GameMode.PVP1,
                seed,
                rand: seedrandom(seed),
                round: 1
            });
            saveUserGameRoom(userId, roomNumber);

            changeRoomData(roomNumber, 'one', {
                userId, cardsId, socket, roomNumber, myMaxThinkTimeNumber: MAX_THINK_TIME_NUMBER
            });

            logger.info(`roomNumber:${roomNumber} userId:${userId} cardsId:${cardsId} pvp create`);

            socket.emit("WAIT", {
                roomNumber
            });
            socket.join(roomNumber);
        } else {
            // 如果等待列表是空的，则加入等待列表
            if (waitPairQueue.length === 0) {
                waitPairQueue.push({
                    userId, cardsId, socket, myMaxThinkTimeNumber: MAX_THINK_TIME_NUMBER
                });

                logger.info(`userId:${userId} cardsId:${cardsId} pvp wait`);
                socket.emit("WAIT");
            } else {
                if (waitPairQueue.some(p => p.userId === userId)) { // 当前用户已经在匹配了
                    socket.emit("WAIT");
                    return;
                }

                // 获取一个正在等待的用户
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
                    userId, cardsId, socket, roomNumber, myMaxThinkTimeNumber: MAX_THINK_TIME_NUMBER
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

                saveUserOperator(userId, { type: UserOperatorType.playPvp, with: waitPlayer.userId, roomNumber: roomNumber });
            }
        }
    }
}

module.exports = {
    connect
}

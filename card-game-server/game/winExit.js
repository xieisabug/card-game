const {getRoomData, removeRoomData, removeUserGameRoom} = require("../cache");

/**
 * 胜利之后退出
 * @param args
 * @param socket
 */
function winExit(args, socket) {
    let roomNumber = args.r;
    const memoryData = getRoomData(roomNumber);
    let belong = memoryData["one"].socket.id === socket.id ? "one" : "two";
    let other = memoryData["one"].socket.id !== socket.id ? "one" : "two";
    let userId = memoryData[belong].userId;

    delete memoryData[belong];

    if (!memoryData[other]) {
        removeRoomData(roomNumber)
    }

    removeUserGameRoom(userId)
}

module.exports = {
    winExit
}
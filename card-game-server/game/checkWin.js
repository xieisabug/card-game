const {getRoomData, getSocket} = require("../cache");
const {checkLevelUp} = require("./checkLevelUp");

/**
 * 检查pve模式下是否获胜
 * @param roomNumber 房间号码
 */
function checkPveWin(roomNumber) {
    const memoryData = getRoomData(roomNumber)
    if (memoryData.isPve) {
        if (memoryData['two'].checkWin()) {
            memoryData['two'].saveWin().then(result => {
                getSocket(roomNumber, "one").emit("END_GAME", {win: true, reward: result.reward});
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
    const memoryData = getRoomData(roomNumber)
    if (!memoryData.isPve) {
        if (memoryData["one"].life <= 0) {
            getSocket(roomNumber, "two").emit("END_GAME", {win: true});
            getSocket(roomNumber, "one").emit("END_GAME", {win: false});
        } else if (memoryData["two"].life <= 0) {
            getSocket(roomNumber, "one").emit("END_GAME", {win: true});
            getSocket(roomNumber, "two").emit("END_GAME", {win: false});
        }
    }
}

module.exports = {
    checkPveWin,
    checkPvpWin
}
const {findUserById, userLevelUp} = require("../db");
const {levelCanUp, getLevelUpExp} = require("../utils");
const {getRoomData, getSocket} = require("../cache");

/**
 * 检查房间中的玩家是否可升级
 * @param roomNumber
 */
function checkLevelUp(roomNumber) {
    const memoryData = getRoomData(roomNumber)
    if (memoryData.isPve) {
        findUserById(memoryData["one"].userId).then(u => {
            if (levelCanUp(u)) {
                userLevelUp(memoryData["one"].userId, getLevelUpExp(u.level))
                    .then(() => {
                        getSocket(roomNumber, "one").emit("LEVEL_UP", {win: true});
                    })
            }
        })
    }
}

module.exports = {
    checkLevelUp
}
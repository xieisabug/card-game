const {getRoomData} = require("../cache");
const {findNextLevel} = require("../db");
const {maxLevelId, levelList} = require("../level/level-utils");

/**
 * 进入下一关，仅限于pve
 * @param args
 * @param socket
 */
function nextLevel(args, socket) {
    let roomNumber = args.r;
    const memoryData = getRoomData(roomNumber);
    let userId = memoryData['one']['userId'];
    memoryData.startTime = new Date();

    findNextLevel(userId)
        .then(levelId => {
            if (levelId <= maxLevelId) {
                memoryData['two'] = new levelList[levelId](memoryData);

                socket.join(roomNumber);
                socket.emit("START", {
                    roomNumber: roomNumber,
                    memberId: "one"
                });

                memoryData['two'].initCard();
            } else {

            }
        })
}

module.exports = {
    nextLevel
}
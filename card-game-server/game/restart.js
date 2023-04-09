const {GameMode} = require("../constants");
const {getRoomData} = require("../cache");

/**
 * 重新开始牌局，仅限于pve
 * @param args
 */
function restart(args) {
    let roomNumber = args.r;
    const memoryData = getRoomData(roomNumber);
    if (memoryData && memoryData.gameMode === GameMode.PVE1) {
        memoryData['two'].initCard();
    }
}

module.exports = {
    restart
}
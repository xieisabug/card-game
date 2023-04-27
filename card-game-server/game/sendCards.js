const {getSocket, getRoomData} = require("../cache");

/**
 * 发送最新的牌局信息
 * @param roomNumber 房间号
 * @param identity 发送给哪一方，如果指定了则发送给一方，否则两方都发送
 */
function sendCards(roomNumber, identity) {

    if (identity) {
        let otherIdentity = identity === "one" ? "two" : "one";
        const memoryData = getRoomData(roomNumber)

        getSocket(roomNumber, identity).emit("SEND_CARD", {
            myCard: memoryData[identity]["cards"],
            myTableCard: memoryData[identity]["tableCards"],
            otherTableCard: memoryData[otherIdentity]["tableCards"],
            mySkillList: memoryData[identity]["skillList"],
            otherSkillList: memoryData[otherIdentity]["skillList"],
            myLife: memoryData[identity]["life"],
            otherLife: memoryData[otherIdentity]["life"],
            myFee: memoryData[identity]["fee"],
            otherFee: memoryData[otherIdentity]["fee"],
            myMaxFee: memoryData[identity]["maxFee"],
            otherMaxFee: memoryData[otherIdentity]["maxFee"],
            myMaxThinkTimeNumber: memoryData[otherIdentity]["maxThinkTimeNumber"],
            myInfo: memoryData[identity]["info"],
            otherInfo: memoryData[otherIdentity]["info"],
            gameMode: memoryData['gameMode']
        });
    } else {
        sendCards(roomNumber, "one");
        sendCards(roomNumber, "two");
    }
}

module.exports = {
    sendCards
}
const {AttackType, AttackAnimationType} = require("../constants");
const {getRoomData, getSocket} = require("../cache");
const {error} = require("./log");
const {checkPvpWin, checkPveWin} = require("./checkWin");


/**
 * 攻击对方英雄
 * @param args
 * @param socket
 */
function attackHero(args, socket) {
    let roomNumber = args.r, k = args.k, card;
    const memoryData = getRoomData(roomNumber);
    let belong = memoryData["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData["one"].socket.id !== socket.id ? "one" : "two";

    let index = memoryData[belong]["tableCards"].findIndex(c => c.k === k);

    if (index !== -1) {
        let hasDedication = memoryData[other]["tableCards"].some(c => c.isDedication);

        card = memoryData[belong]["tableCards"][index];

        if (!hasDedication) {
            memoryData[other].life -= card.attack;
            card.isActionable = false;
            getSocket(roomNumber, belong).emit("ATTACK_HERO", {
                k,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card: card,
                hero: {
                    life: memoryData[other].life
                }
            });

            getSocket(roomNumber, other).emit("ATTACK_HERO", {
                k,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card: card,
                hero: {
                    life: memoryData[other].life
                }
            });
        } else {
            error(socket, `您必须攻击带有奉献的单位`);
        }
    }

    checkPvpWin(roomNumber);
    checkPveWin(roomNumber);
}

module.exports = {
    attackHero
}
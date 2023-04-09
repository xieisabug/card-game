const {getSpecialMethod} = require("./getSpecialMethod");
const {AttackType, AttackAnimationType} = require("../constants");
const {checkPvpWin, checkPveWin} = require("./checkWin");
const {error} = require("./log");
const {getRoomData} = require("../cache");
const {checkCardDieEvent} = require("./checkCardDieEvent");
const log4js = require("log4js");
const logger = log4js.getLogger('play');
/**
 * 攻击某个卡牌
 * @param args index: 攻击牌, attackIndex: 被攻击牌
 * @param socket
 */
function attackCard(args, socket) {
    let roomNumber = args.r, myK = args.myK, attackK = args.attackK, card, attackCard;
    const memoryData = getRoomData(roomNumber)
    if (!memoryData) {
        logger.error(`No this room: ${roomNumber}`);
        return
    }

    let belong = memoryData["one"].socket.id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = memoryData["one"].socket.id !== socket.id ? "one" : "two";

    let index = memoryData[belong]["tableCards"].findIndex(c => c.k === myK);
    let attackIndex = memoryData[other]["tableCards"].findIndex(c => c.k === attackK);

    if (index !== -1 && attackIndex !== -1
        && memoryData[other]["tableCards"].length > attackIndex
        && memoryData[belong]["tableCards"].length > index) {

        card = memoryData[belong]["tableCards"][index];
        attackCard = memoryData[other]["tableCards"][attackIndex];
        let hasDedication = memoryData[other]["tableCards"].some(c => c.isDedication);

        if (attackCard.isDedication || !hasDedication) { // 如果有奉献，必须攻击奉献单位
            if (attackCard.isStrong) { // 强壮
                attackCard.isStrong = false;
            } else if (attackCard.isShortInvincible) { // 短时间无敌

            } else {
                attackCard.life -= card.attack;
            }

            if (card.isStrong) { // 强壮
                card.isStrong = false;
            } else if (attackCard.isShortInvincible) { // 短时间无敌

            } else {
                card.life -= attackCard.attack;
            }

            card.isActionable = false;
            if (card.isHide) {
                card.isHide = false;
            }

            memoryData[belong].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });
            memoryData[other].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card,
                attackCard
            });

            if (card.onAttack) {
                card.onAttack({
                    myGameData: memoryData[belong],
                    otherGameData: memoryData[other],
                    thisCard: card,
                    beAttackedCard: attackCard,
                    specialMethod: getSpecialMethod(belong, roomNumber),
                })
            }
            if (attackCard.onBeAttacked) {
                attackCard.onBeAttacked({
                    myGameData: memoryData[other],
                    otherGameData: memoryData[belong],
                    thisCard: attackCard,
                    attackCard: card,
                    specialMethod: getSpecialMethod(other, roomNumber),
                })
            }

            memoryData[belong]["tableCards"].forEach(c => {
                if (c.onOtherCardAttack && c.k !== card.k) {
                    c.onOtherCardAttack({
                        myGameData: memoryData[belong],
                        otherGameData: memoryData[other],
                        attackCard: card,
                        beAttackedCard: attackCard,
                        thisCard: c,
                        specialMethod: getSpecialMethod(belong, roomNumber),
                    })
                }
            });

            memoryData[other]["tableCards"].forEach(c => {
                if (c.onOtherCardBeAttacked && c.k !== attackCard.k) {
                    c.onOtherCardBeAttacked({
                        myGameData: memoryData[other],
                        otherGameData: memoryData[belong],
                        attackCard: card,
                        beAttackedCard: attackCard,
                        thisCard: c,
                        specialMethod: getSpecialMethod(other, roomNumber),
                    })
                }
            });

            checkCardDieEvent(roomNumber);
        } else {
            error(socket, `您必须攻击带有奉献的单位`);
        }
    } else {
        logger.error(`roomNumber:${roomNumber} Not exist card my ${myK} and other ${attackK}, index: ${index} attackIndex: ${attackIndex}`)
    }

    checkPvpWin(roomNumber);
    checkPveWin(roomNumber);
}

module.exports = {
    attackCard
}
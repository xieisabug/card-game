const {getSpecialMethod} = require("./getSpecialMethod");
const {AttackType, AttackAnimationType} = require("../constants");
const {checkPvpWin, checkPveWin} = require("./checkWin");
const {error} = require("./log");
const {getRoomData} = require("../cache");
const {checkCardDieEvent} = require("./checkCardDieEvent");
const cards = require("../cards");
const log4js = require("log4js");
const logger = log4js.getLogger('play');
const {sanitizeCard} = require("./sanitizeCard");

/**
 * 触发卡牌效果（兼容新旧格式）
 */
function triggerCardEffect(hookName, card, myGameData, otherGameData, specialMethod, extraContext = {}) {
    const isEffectHook = card._effectHookNames && card._effectHookNames[hookName];

    // 触发旧版函数式钩子
    if (card[hookName] && typeof card[hookName] === 'function') {
        card[hookName]({
            myGameData,
            otherGameData,
            thisCard: card,
            specialMethod,
            ...extraContext
        });
    }

    // 触发新版 Effect 系统钩子
    const effectEngine = cards.effectEngine;
    if (!isEffectHook && effectEngine && card.effects && card.effects[hookName]) {
        const context = {
            myGameData,
            otherGameData,
            thisCard: card,
            specialMethod,
            ...extraContext
        };
        effectEngine.executeCardEffects(card, hookName, context);
    }
}
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
            } else if (card.isShortInvincible) { // 短时间无敌

            } else {
                card.life -= attackCard.attack;
            }

            card.isActionable = false;
            if (card.isHide) {
                card.isHide = false;
            }

            const safeCard = sanitizeCard(card);
            const safeAttackCard = sanitizeCard(attackCard);
            memoryData[belong].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.ATTACK,
                animationType: AttackAnimationType.NORMAL,
                card: safeCard,
                attackCard: safeAttackCard
            });
            memoryData[other].socket.emit("ATTACK_CARD", {
                index,
                attackIndex,
                attackType: AttackType.BE_ATTACKED,
                animationType: AttackAnimationType.NORMAL,
                card: safeCard,
                attackCard: safeAttackCard
            });

            let mySpecialMethod = getSpecialMethod(belong, roomNumber);
            let otherSpecialMethod = getSpecialMethod(other, roomNumber);

            triggerCardEffect('onAttack', card, memoryData[belong], memoryData[other], mySpecialMethod, {
                beAttackedCard: attackCard
            });
            triggerCardEffect('onBeAttacked', attackCard, memoryData[other], memoryData[belong], otherSpecialMethod, {
                attackCard: card
            });

            memoryData[belong]["tableCards"].forEach(c => {
                if (c.k !== card.k) {
                    triggerCardEffect('onOtherCardAttack', c, memoryData[belong], memoryData[other], mySpecialMethod, {
                        attackCard: card,
                        beAttackedCard: attackCard
                    });
                }
            });

            memoryData[other]["tableCards"].forEach(c => {
                if (c.k !== attackCard.k) {
                    triggerCardEffect('onOtherCardBeAttacked', c, memoryData[other], memoryData[belong], otherSpecialMethod, {
                        attackCard: card,
                        beAttackedCard: attackCard
                    });
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

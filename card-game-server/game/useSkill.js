const {CardType, TargetType, CardPosition} = require("../constants");
const {extractHeroInfo} = require("../utils");
const {getRoomData, getSocket} = require("../cache");
const {checkPvpWin, checkPveWin} = require("./checkWin");
const {error} = require("./log");
const {getSpecialMethod} = require("./getSpecialMethod");
const {checkCardDieEvent} = require("./checkCardDieEvent");

/**
 * 使用技能
 * @param args
 * @param socket
 */
function useSkill(args, socket) {
    let roomNumber = args.r, index = args.index, targetIndex = args.targetIndex, skill;
    const memoryData = getRoomData(roomNumber);

    let belong = getSocket(roomNumber, "one").id === socket.id ? "one" : "two"; // 判断当前是哪个玩家出牌
    let other = getSocket(roomNumber, "one").id !== socket.id ? "one" : "two";

    if (index !== -1 && memoryData[belong]["skillList"][index].cost <= memoryData[belong]["fee"]) {
        skill = memoryData[belong]["skillList"][index];

        if (!skill.roundMaxUseTimes) {
            skill.roundMaxUseTimes = 1;
        }
        if (!memoryData[belong]["useSkillRoundTimes"]) {
            memoryData[belong]["useSkillRoundTimes"] = 0;
        }
        if (skill.roundMaxUseTimes <= memoryData[belong]["useSkillRoundTimes"]
            || (skill.maxUseTimes && skill.maxUseTimes <= +memoryData[belong]["useSkillTimes"])) {
            error(socket, "技能使用次数超过上限");
            return;
        }

        // 检查是否违反卡牌的必须选择施法对象属性（isForceTarget）
        let chooseCardList = [];
        if (skill.isTarget) {
            if (skill.targetType === TargetType.MY_TABLE_CARD) {
                chooseCardList = memoryData[belong]["tableCards"];
            } else if (skill.targetType === TargetType.OTHER_TABLE_CARD) {
                chooseCardList = memoryData[other]["tableCards"];
            } else if (skill.targetType === TargetType.ALL_TABLE_CARD) {
                chooseCardList =
                    memoryData[other]["tableCards"].slice()
                        .concat(memoryData[belong]["tableCards"].slice());
            } else if (skill.targetType === TargetType.ALL_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList =
                    memoryData[other]["tableCards"]
                        .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) !== -1) && !i.isHide)
                        .concat(memoryData[belong]["tableCards"]
                            .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) !== -1)));
            } else if (skill.targetType === TargetType.ALL_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList =
                    memoryData[other]["tableCards"]
                        .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) === -1) && !i.isHide)
                        .concat(memoryData[belong]["tableCards"]
                            .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) === -1)));
            } else if (skill.targetType === TargetType.MY_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList = memoryData[belong]["tableCards"]
                    .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) !== -1));
            } else if (skill.targetType === TargetType.MY_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList = memoryData[belong]["tableCards"]
                    .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) === -1));
            } else if (skill.targetType === TargetType.OTHER_TABLE_CARD_FILTER_INCLUDE) {
                chooseCardList = memoryData[other]["tableCards"]
                    .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) !== -1));
            } else if (skill.targetType === TargetType.OTHER_TABLE_CARD_FILTER_EXCLUDE) {
                chooseCardList = memoryData[other]["tableCards"]
                    .slice().filter(i => skill.filter.every(t => i.type.indexOf(t) === -1));
            }
            // 必须选择施法对象，返回错误
            if (chooseCardList.length === 0 && targetIndex === -1 && skill.isForceTarget) {
                error(getSocket(roomNumber, belong), "请选择目标");
                return;
            }
        }
        memoryData[belong]["fee"] -= skill.cost;

        let mySpecialMethod = getSpecialMethod(belong, roomNumber);

        getSocket(roomNumber, belong).emit("USE_SKILL", {
            index,
            skill,
            isMine: true,
            myHero: extractHeroInfo(memoryData[belong]),
            otherHero: extractHeroInfo(memoryData[other])
        });
        getSocket(roomNumber, other).emit("USE_SKILL", {
            index,
            skill,
            isMine: false,
            myHero: extractHeroInfo(memoryData[other]),
            otherHero: extractHeroInfo(memoryData[belong])
        })

        if (skill.isTarget) {
            skill.onChooseTarget({
                myGameData: memoryData[belong],
                otherGameData: memoryData[other],
                source: skill,
                chooseCard: chooseCardList[targetIndex],
                effectIndex: args.effectIndex,
                fromIndex: -1,
                toIndex: targetIndex,
                specialMethod: mySpecialMethod
            });
        }

        if (skill && skill.onStart) {
            skill.onStart({
                myGameData: memoryData[belong],
                otherGameData: memoryData[other],
                source: skill,
                specialMethod: mySpecialMethod
            });
        }

        memoryData[belong]["useSkillTimes"]++;
        memoryData[belong]["useSkillRoundTimes"]++;

        checkCardDieEvent(roomNumber);
    } else {
        error(socket, '费用不足或未选择使用的技能');
    }

    checkPvpWin(roomNumber);
    checkPveWin(roomNumber);
}

module.exports = {
    useSkill
}
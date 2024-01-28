const {GameMode} = require('../constants');
const {userWinPve} = require('../db');
const {MAX_THINK_TIME_NUMBER} = require("../constants")

class LevelBase {
    constructor(gameData, socketFunction) {
        this.gameData = gameData;

        this.socket = {
            id: "two",
            emit: (type, param) => {
                switch (type) {
                    case "YOUR_TURN":
                        if (this.gameData.gameMode === GameMode.PVE1) {
                            this.gameData['one'].socket.emit("END_GAME", {win: false});
                        } else if (this.gameData.gameMode === GameMode.PVE2) {

                            let actList = this.bot.getRunActionList(
                                this.gameData["two"].tableCards,
                                this.gameData["one"].tableCards,
                                this.gameData["two"]["cards"],
                                this.gameData["two"]["remainingCards"],
                                this.gameData["two"].fee,
                                this.gameData["two"].life,
                                this.gameData["one"].life);

                            console.log(actList)

                            let baseTime = 0;

                            actList.forEach(act => {
                                baseTime += Math.random() * 2000;

                                setTimeout(() => {
                                    switch(act.event) {
                                        case "OUT_CARD":
                                            this.socketFunction.outCard({r: this.roomNumber, index: act.i}, this.socket);
                                            break;
                                        case "USE_SKILL":
                                            this.socketFunction.useSkill({r: this.roomNumber, index: act.i}, this.socket);
                                            break;
                                        case "ATTACK_CARD":
                                            this.socketFunction.attackCard({r: this.roomNumber, myK: act.myK, attackK: act.attackK}, this.socket);
                                            break;
                                        case "ATTACK_HERO":
                                            this.socketFunction.attackHero({r: this.roomNumber, k: act.k}, this.socket);
                                            break;
                                        case "END_MY_TURN":
                                            this.socketFunction.endMyTurn({r: this.roomNumber}, this.socket);
                                            break;
                                    }
                                }, baseTime);

                            });

                            // 检查规则后，如果符合规则，则执行脚本，执行完成后删除脚本
                            this.ruleScriptList.forEach(ruleScript => {
                                if (ruleScript.ruleFunction(this.gameData)) {
                                    ruleScript.scriptFunction(this.gameData);
                                    this.ruleScriptList.splice(this.ruleScriptList.indexOf(ruleScript), 1);
                                }
                            })

                        }
                        break;
                }
            }
        };
        this.myMaxThinkTimeNumber = MAX_THINK_TIME_NUMBER;
        this.cards = [];
        this.tableCards = [];
        this.remainingCards = [];
        this.levelId = -1;
        this.taskList = [];
        this.socketFunction = socketFunction;
        this.roomNumber = this.gameData['one'].roomNumber;
        this.ruleScriptList = [];

        this.initValue();

        this.gameData['one'].socket.emit("SEND_TASK", this.taskList);
    }

    sendCards() {
        this.gameData['one'].socket.emit("SEND_CARD", {
            myCard: this.gameData["one"]["cards"],
            myTableCard: this.gameData["one"]["tableCards"],
            otherTableCard: this.gameData["two"]["tableCards"],
            mySkillList: this.gameData["one"]["skillList"],
            otherSkillList: this.gameData["two"]["skillList"],
            myLife: this.gameData["one"]["life"],
            otherLife: this.gameData["two"]["life"],
            myFee: this.gameData["one"]["fee"],
            otherFee: this.gameData["two"]["fee"],
            myMaxFee: this.gameData["one"]["maxFee"],
            otherMaxFee: this.gameData["two"]["maxFee"],
            myMaxThinkTimeNumber: this.gameData["one"]["maxThinkTimeNumber"],
            myInfo: this.gameData["one"]["info"],
            otherInfo: this.gameData["two"]["info"],
            gameMode: this.gameData.gameMode
        });
    }

    sendTalk(content) {
        this.gameData['one'].socket.emit("SEND_TALK", content);
    }

    saveWin() {
        return userWinPve(this.gameData['one']['userId'], this.levelId)
    }

    /**
     * 用于复写本地变量，最少要复写一个levelId
     */
    initValue() {}

    // 用于注册条件执行脚本函数
    registerRuleScript(ruleFunction, scriptFunction) {
        this.ruleScriptList.push({
            ruleFunction,
            scriptFunction
        })
    }
}

module.exports = LevelBase;
let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, TargetType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level4 extends LevelBase {

    initValue() {
        this.levelId = 999;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "计算机导论" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        Object.assign(this.gameData[first], {
            cards: [],
            tableCards: [
                {
                    k: "6",
                    id: 6,
                    name: "大脑",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "当记忆细胞 受伤且没有死亡 的时候，强化大脑的1点攻击",
                    attack: 2,
                    life: 5,
                    attackBase: 2,
                    lifeBase: 5,
                    type: "",
                    isActionable: true,
                    onOtherCardAttack({attackCard, thisCard, specialMethod}) {
                        if (attackCard.life > 0) {
                            thisCard.attack += 1;
                            specialMethod.buffCardAnimation(true, -1, -1, attackCard, thisCard);
                        }
                    }
                },
                {
                    k: "1",
                    id: 1,
                    name: "记忆细胞1",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: "",
                    isActionable: true,
                    targetType: TargetType.MY_TABLE_CARD
                },
                {
                    k: "2",
                    id: 2,
                    name: "记忆细胞2",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 4,
                    attackBase: 3,
                    lifeBase: 4,
                    type: "",
                    isActionable: true,
                    targetType: TargetType.MY_TABLE_CARD
                },
                {
                    k: "3",
                    id: 3,
                    name: "记忆细胞3",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 5,
                    attackBase: 2,
                    lifeBase: 5,
                    type: "",
                    isActionable: true,
                    targetType: TargetType.MY_TABLE_CARD
                },
                {
                    k: "4",
                    id: 4,
                    name: "记忆细胞4",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 6,
                    attackBase: 3,
                    lifeBase: 6,
                    type: "",
                    isActionable: true,
                    targetType: TargetType.MY_TABLE_CARD
                }
            ],
            life: 1,
            fee: 1,
            maxFee: 1
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "7",
                    id: 7,
                    name: "知识点1",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 2,
                    attackBase: 1,
                    lifeBase: 2,
                    type: "",
                    isActionable: true
                },
                {
                    k: "8",
                    id: 8,
                    name: "知识点2",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 5,
                    life: 3,
                    attackBase: 5,
                    lifeBase: 3,
                    type: "",
                    isActionable: true
                },
                {
                    k: "9",
                    id: 9,
                    name: "知识点3",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 2,
                    attackBase: 3,
                    lifeBase: 2,
                    type: "",
                    isActionable: true
                },
                {
                    k: "10",
                    id: 10,
                    name: "知识点4",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 4,
                    life: 1,
                    attackBase: 4,
                    lifeBase: 1,
                    type: "",
                    isActionable: true
                },
                {
                    k: "11",
                    id: 11,
                    name: "课程章节",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 5,
                    life: 6,
                    attackBase: 5,
                    lifeBase: 6,
                    type: "",
                    isActionable: true
                }
            ],
            life: 99,
            fee: 1,
            maxFee: 1
        });

        this.gameData['currentRound'] = first;
        this.gameData[first]['info'] = oneUser;
        this.gameData[second]['info'] = twoUser;

        this.gameData[first]['maxHandCardNumber'] = MAX_HAND_CARD_NUMBER;
        this.gameData[second]['maxHandCardNumber'] = MAX_HAND_CARD_NUMBER;
        this.gameData[first]['maxTableCardNumber'] = MAX_BASE_TABLE_CARD_NUMBER;
        this.gameData[second]['maxTableCardNumber'] = MAX_BASE_TABLE_CARD_NUMBER;
        this.gameData[first]['maxThinkTimeNumber'] = -1;
        this.gameData[second]['maxThinkTimeNumber'] = -1;
        this.sendCards();
        this.gameData[first].socket.emit("YOUR_TURN");

        this.sendTalk({
            text: "好啦好啦~老师要讲第一章了，努力消化掉<span style='color: red'>所有的</span>知识点和章节吧！"
        });
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level4;
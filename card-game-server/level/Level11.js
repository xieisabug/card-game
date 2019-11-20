let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, GameMode, TargetType, CardPosition
} = require('../constants');
const cardEffectFactory = require('../card-effect-factory');
const LevelBase = require('./LevelBase');
const WebBot1 = require("../bot/webBot1");

class Level11 extends LevelBase {

    initValue() {
        this.levelId = 9;
        this.taskList = [
            "消灭对方所有随从"
        ];

        this.bot = new WebBot1();
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "神秘人" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        Object.assign(this.gameData[first], {
            cards: [],
            tableCards: [
                {
                    k: "1",
                    id: 1,
                    name: "我愿意",
                    cardType: CardType.CHARACTER,
                    cost: 10,
                    content: "",
                    attack: 5,
                    life: 10,
                    attackBase: 5,
                    lifeBase: 10,
                    type: "",
                    isActionable: true,
                }
            ],
            useCards: [],
            life: 1,
            fee: 10,
            maxFee: 10
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "2",
                    id: 2,
                    name: "加入！",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 5,
                    attackBase: 1,
                    lifeBase: 5,
                    type: "",
                    onEnd: () => {
                        this.sendTalk([
                            {
                                text: "太好了！"
                            },
                            {
                                text: "接下来你的任务就是不断提升自己，成为能够独挡一面的角色"
                            },
                            {
                                text: "慢着慢着~",
                                npcImg: "bad1"
                            },
                            {
                                text: "我可没同意啊~",
                                npcImg: "bad1"
                            },
                            {
                                text: "就是他们！",
                            },
                            {
                                text: "来不及教你太多东西，先用我的卡组来作战吧！",
                            },
                        ]);
                        Object.assign(this.gameData, {
                            gameMode: GameMode.PVE2,
                        });
                        Object.assign(this.gameData[first], {
                            cards: [
                                {
                                    k: "3",
                                    id: 13,
                                    name: "没毕业的天才程序员",
                                    cardType: CardType.CHARACTER,
                                    cost: 3,
                                    content: `每回合结束时，获得+1/+1`,
                                    attack: 1,
                                    life: 1,
                                    attackBase: 1,
                                    lifeBase: 1,
                                    type: [""],
                                    onMyTurnEnd: function ({ thisCard, specialMethod, position }) {
                                        if (position === CardPosition.TABLE) {
                                            thisCard.attack += 1;
                                            thisCard.life += 1;
                                            specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
                                        }
                                    }
                                },
                                {
                                    k: "4",
                                    id: 13,
                                    name: "没毕业的天才程序员",
                                    cardType: CardType.CHARACTER,
                                    cost: 3,
                                    content: `每回合结束时，获得+1/+1`,
                                    attack: 1,
                                    life: 1,
                                    attackBase: 1,
                                    lifeBase: 1,
                                    type: [""],
                                    onMyTurnEnd: function ({ thisCard, specialMethod, position }) {
                                        if (position === CardPosition.TABLE) {
                                            thisCard.attack += 1;
                                            thisCard.life += 1;
                                            specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
                                        }
                                    }
                                },
                                {
                                    k: "5",
                                    id: 14,
                                    name: "IDE大师",
                                    cardType: CardType.CHARACTER,
                                    cost: 7,
                                    content: `出场：场上所有人员获得+1/+1`,
                                    attack: 6,
                                    life: 4,
                                    attackBase: 6,
                                    lifeBase: 4,
                                    type: [""],
                                    onStart: function ({ myGameData, specialMethod, thisCard }) {
                                        myGameData.tableCards.forEach((c, i) => {
                                            c.attack += 1;
                                            c.life += 1;
                                            specialMethod.buffCardAnimation(true, -1, i, thisCard, c)
                                        })
                                    }
                                },
                                {
                                    k: "6",
                                    id: 16,
                                    name: "断点调试",
                                    cardType: CardType.EFFECT,
                                    cost: 3,
                                    content: `指定一个己方召唤物本回合（当前操作回合）不受伤害`,
                                    type: ["效果卡"],
                                    isTarget: true,
                                    targetType: TargetType.MY_TABLE_CARD,
                                    onChooseTarget: function ({ chooseCard, toIndex, thisCard, specialMethod }) {
                                        chooseCard.isShortInvincible = true;
                                        chooseCard.shortInvincibleRound = 1;
                                        specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard)
                                    }
                                },
                            ],
                            tableCards: [],
                            life: 10,
                            fee: 5,
                            maxFee: 5
                        });
                        Object.assign(this.gameData[second], {
                            cards: [
                                {
                                    k: "7",
                                    id: 13,
                                    name: "没毕业的天才程序员",
                                    cardType: CardType.CHARACTER,
                                    cost: 3,
                                    content: `每回合结束时，获得+1/+1`,
                                    attack: 1,
                                    life: 1,
                                    attackBase: 1,
                                    lifeBase: 1,
                                    type: [""],
                                    onMyTurnEnd: function ({ thisCard, specialMethod, position }) {
                                        if (position === CardPosition.TABLE) {
                                            thisCard.attack += 1;
                                            thisCard.life += 1;
                                            specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
                                        }
                                    }
                                },
                                {
                                    k: "8",
                                    id: 13,
                                    name: "没毕业的天才程序员",
                                    cardType: CardType.CHARACTER,
                                    cost: 3,
                                    content: `每回合结束时，获得+1/+1`,
                                    attack: 1,
                                    life: 1,
                                    attackBase: 1,
                                    lifeBase: 1,
                                    type: [""],
                                    onMyTurnEnd: function ({ thisCard, specialMethod, position }) {
                                        if (position === CardPosition.TABLE) {
                                            thisCard.attack += 1;
                                            thisCard.life += 1;
                                            specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
                                        }
                                    }
                                },
                                {
                                    k: "9",
                                    id: 14,
                                    name: "IDE大师",
                                    cardType: CardType.CHARACTER,
                                    cost: 7,
                                    content: `出场：场上所有人员获得+1/+1`,
                                    attack: 6,
                                    life: 4,
                                    attackBase: 6,
                                    lifeBase: 4,
                                    type: [""],
                                    onStart: function ({ myGameData, specialMethod, thisCard }) {
                                        myGameData.tableCards.forEach((c, i) => {
                                            c.attack += 1;
                                            c.life += 1;
                                            specialMethod.buffCardAnimation(true, -1, i, thisCard, c)
                                        })
                                    }
                                },
                            ],
                            tableCards: [],
                            life: 10,
                            fee: 5,
                            maxFee: 5
                        });

                        this.sendCards();
                    }
                }
            ],
            useCards: [],
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
        this.gameData[first]['cardIndexNo'] = 30;
        this.gameData[second]['cardIndexNo'] = 30;

        this.sendCards();
        this.gameData[first].socket.emit("YOUR_TURN");

        this.sendTalk([
            {
                text: "我要和你说的秘密非常重要，你一定要记住"
            },
            {
                text: "计算机世界不是像大家想的那么简单"
            },
            {
                text: "在前辈的努力下，我们的技术进步的非常快，但也慢慢发现了另一个恐怖的东西，那就是一个<span style='color: red'>隐藏的黑暗计算机世界</span>"
            },
            {
                text: "那个世界的技术被用来进行各种<span style='color: red'>犯罪活动</span>，所以我们一定要阻止他们"
            },
            {
                text: "他们资金雄厚，并且技术非常强大，所以，我们才需要像你这样的新血液，来帮助我们战胜他们！"
            }
        ]);
    }

    checkWin() {
        return this.gameData["two"].life <= 0
    }
}

module.exports = Level11;
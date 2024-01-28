let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, GameMode, TargetType, CardPosition
} = require('../constants');
const cardEffectFactory = require('../card-effect-factory');
const LevelBase = require('./LevelBase');
const WebBotBoss1 = require("../bot/webBot-boss1");

class Level13 extends LevelBase {

    initValue() {
        this.levelId = 11;
        this.taskList = [
            "在黑暗计算机世界四大天王之一的手下存活3个回合"
        ];

        this.bot = new WebBotBoss1();
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "神秘人" };

        this.gameData.round = 1;
        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

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
                // 附加亡语效果的卡牌，效果为 复活
                {
                    k: "4",
                    id: 14,
                    name: "打点滴",
                    cardType: CardType.EFFECT,
                    cost: 1,
                    content: "为友方单位添加亡语：死亡后复活1次",
                    type: [""],
                    isTarget: true,
                    targetType: TargetType.MY_TABLE_CARD,
                    onChooseTarget: function ({ chooseCard, thisCard, specialMethod, toIndex }) {
                        if (!chooseCard) {
                            return;
                        }
                        let rebornCard = Object.assign({}, chooseCard);
                        let originOnEnd = chooseCard.onEnd;
                        // 亡语效果为复活
                        chooseCard.onEnd = function ({ myGameData, specialMethod }) {
                            if (originOnEnd) {
                                originOnEnd(arguments);
                            }
                            myGameData.tableCards.push(rebornCard);
                        }
                        chooseCard.content += "，退出：死亡后复活1次";
                        specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard)
                    }
                },
                // 为场上所有卡牌添加强壮效果
                {
                    k: "5",
                    id: 15,
                    name: "吃鸡",
                    cardType: CardType.EFFECT,
                    cost: 4,
                    content: "为场上所有单位添加 坚强 效果",
                    type: [""],
                    targetType: TargetType.MY_TABLE_CARD,
                    onStart: function ({ myGameData, specialMethod, thisCard }) {
                        myGameData.tableCards.forEach((card, index) => {
                            card.isStrong = true;
                            specialMethod.buffCardAnimation(true, -1, index, thisCard, card)
                        })
                    }
                },
            ],
            tableCards: [],
            useCards: [],
            life: 1,
            fee: 4,
            maxFee: 4,
            maxHandCardNumber: 10
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "1",
                    id: 1,
                    name: "四大天王 神秘人",
                    cardImage: "http://cdn.xiejingyang.com/cardGame/f375608e-87bb-411d-ac73-ddf1c5d81ea9.webp",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "洁癖，清场后才会攻击玩家",
                    attack: 20,
                    life: 99,
                    attackBase: 20,
                    lifeBase: 99,
                    type: "",
                    // 第4回合的时候，召唤黑客精英
                    onMyTurnEnd: function ({ myGameData, thisCard, specialMethod, position }) {
                        if (position === CardPosition.TABLE) {
                            if (!thisCard.myRoundNumber) {
                                thisCard.myRoundNumber = 1;
                            } else {
                                thisCard.myRoundNumber++;
                            }
                            if (thisCard.myRoundNumber === 3) {
                                let card = {
                                    k: "2",
                                    id: 2,
                                    name: "黑客精英",
                                    cardType: CardType.CHARACTER,
                                    cost: 10,
                                    content: "每击败一张卡牌，对对方所有卡牌造成5点伤害。",
                                    attack: 25,
                                    life: 25,
                                    attackBase: 25,
                                    lifeBase: 25,
                                    type: [""],
                                    onAttack: function ({ myGameData, otherGameData, thisCard, beAttackedCard, specialMethod }) {
                                        if (beAttackedCard.life <= 0) {
                                            cardEffectFactory.allOtherCardDamage(5)({ myGameData, otherGameData, thisCard, beAttackedCard, specialMethod })
                                        }
                                    }
                                };
                                
                                myGameData.tableCards.push(card);
                                specialMethod.outCardAnimation(true, card);

                                myGameData.tableCards.splice(0, 1);
                                specialMethod.dieCardAnimation(true, ['1'], []);
                            }
                        }
                    }
                },
            ],
            useCards: [],
            life: 99,
            fee: 1,
            maxFee: 1
        });
        Object.assign(this.gameData, {
            gameMode: GameMode.PVE2,
        });

        this.gameData['currentRound'] = first;
        this.gameData[first]['info'] = oneUser;
        this.gameData[second]['info'] = twoUser;
        this.gameData[first]['skillList'] = [
            {
                name: "阅读书籍",
                cost: 1,
                isTarget: true,
                targetType: TargetType.MY_TABLE_CARD,
                description: '通过阅读书籍提高自己，选择提高牌桌上1张卡牌1点攻击力',
                onChooseTarget: cardEffectFactory.oneChooseCardAddAttack(1)
            }
        ]

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
        // 第四回合开始时进行对话，对话完成后将四大天王的卡牌移除
        this.registerRuleScript(
            (gameData) => {
                console.log("gameData", gameData)
                return gameData.round === 3
            },
            () => {
                this.sendTalk([
                    {
                        text: "我找到办法引走四大天王了，你对付他的手下吧",
                    },
                ]);

                // 给手牌增加5张1费的卡牌：无私的组长，亡语为死亡后给在场所有的单位 坚强 效果
                for (let i = 0; i < 5; i++) {
                    this.gameData[first].cards.push({
                        k: 6 + i + "",
                        id: 16 + i,
                        name: "无私的组长",
                        cardType: CardType.CHARACTER,
                        cost: 2,
                        content: "精力充沛，退出：给在场所有的单位 坚强 效果",
                        attack: 2,
                        life: 2,
                        attackBase: 2,
                        lifeBase: 2,
                        isFullOfEnergy: true,
                        targetType: TargetType.MY_TABLE_CARD,
                        type: [""],
                        onEnd: function ({ myGameData, specialMethod, thisCard }) {
                            myGameData.tableCards.forEach((card, index) => {
                                card.isStrong = true;
                                specialMethod.buffCardAnimation(true, -1, index, thisCard, card)
                            })
                        }
                    })
                }

                this.sendCards();
                
            }
        );

        this.sendTalk([
            {
                text: "不好，他是黑暗计算机世界的四大天王之一，你先帮我拖住他，我想想办法",
            },
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level13;
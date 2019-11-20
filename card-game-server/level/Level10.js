let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const cardEffectFactory = require('../card-effect-factory');
const LevelBase = require('./LevelBase');

class Level10 extends LevelBase {

    initValue() {
        this.levelId = 8;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "神秘人" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        Object.assign(this.gameData[first], {
            cards: [
                {
                    k: "1",
                    id: 1,
                    name: "启用微服务",
                    cardType: CardType.EFFECT,
                    cost: 3,
                    content: "召唤3个1/1且带有精力充沛的基础服务",
                    attack: '',
                    life: '',
                    attackBase: '',
                    lifeBase: '',
                    type: "效果卡",
                    onStart: function({myGameData, specialMethod}) {
                        for(let i = 1; i < 4; i++) {
                            let card = {
                                k: specialMethod.getGameCardKForMe(),
                                id: "s3-" + i,
                                name: "基础微服务",
                                cardType: CardType.CHARACTER,
                                cost: 1,
                                content: "精力充沛",
                                attack: 1,
                                life: 1,
                                attackBase: 1,
                                lifeBase: 1,
                                type: [""],
                                isFullOfEnergy: true,
                                isActionable: true
                            };
                            myGameData.tableCards.push(card);
                            specialMethod.outCardAnimation(true, card);
                        }
                    }
                },
                {
                    k: "2",
                    id: 2,
                    name: "颈椎病",
                    cardType: CardType.EFFECT,
                    cost: 2,
                    content: "对场上所有对方卡牌造成1点伤害",
                    attack: "",
                    life: "",
                    attackBase: "",
                    lifeBase: "",
                    type: "",
                    animationName: "normalAoe",
                    onStart: cardEffectFactory.allOtherCardDamage(1)
                },
                {
                    k: "3",
                    id: 2,
                    name: "颈椎病",
                    cardType: CardType.EFFECT,
                    cost: 2,
                    content: "对场上所有对方卡牌造成1点伤害",
                    attack: "",
                    life: "",
                    attackBase: "",
                    lifeBase: "",
                    type: "",
                    animationName: "normalAoe",
                    onStart: cardEffectFactory.allOtherCardDamage(1)
                }
            ],
            tableCards: [],
            life: 1,
            fee: 10,
            maxFee: 10
        });
        Object.assign(this.gameData[second], {
            cards: [
                {
                    k: "4",
                    id: 4,
                    name: "源源不断的资讯",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "强壮，退场：随机召唤手牌中的一个伙伴",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: "",
                    isActionable: true,
                    isStrong: true,
                    onEnd: function({ myGameData, specialMethod }) {
                        if (myGameData.cards.length > 0) {
                            let randomIndex = Math.floor(specialMethod.rand() * myGameData.cards.length);
                            let randomCard = myGameData.cards.splice(randomIndex, 1)[0];
                            randomCard.k = specialMethod.getGameCardKForMe();
                            myGameData.tableCards.push(randomCard);
                            specialMethod.outCardAnimation(true, randomCard);
                        }
                    }
                },
                {
                    k: "5",
                    id: 4,
                    name: "源头的资讯",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: "",
                    isActionable: true,
                }
            ],
            tableCards: [
                {
                    k: "6",
                    id: 4,
                    name: "源源不断的资讯",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "强壮，退场：随机召唤手牌中的一个伙伴",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: "",
                    isActionable: true,
                    isStrong: true,
                    onEnd: function({ myGameData, specialMethod }) {
                        if (myGameData.cards.length > 0) {
                            let randomIndex = Math.floor(specialMethod.rand() * myGameData.cards.length);
                            let randomCard = myGameData.cards.splice(randomIndex, 1)[0];
                            randomCard.k = specialMethod.getGameCardKForMe();
                            myGameData.tableCards.push(randomCard);
                            specialMethod.outCardAnimation(true, randomCard);
                        }
                    }
                },
                {
                    k: "7",
                    id: 4,
                    name: "源源不断的资讯",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "强壮，退场：随机召唤手牌中的一个伙伴",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: "",
                    isActionable: true,
                    isStrong: true,
                    onEnd: function({ myGameData, specialMethod }) {
                        if (myGameData.cards.length > 0) {
                            let randomIndex = Math.floor(specialMethod.rand() * myGameData.cards.length);
                            let randomCard = myGameData.cards.splice(randomIndex, 1)[0];
                            randomCard.k = specialMethod.getGameCardKForMe();
                            myGameData.tableCards.push(randomCard);
                            specialMethod.outCardAnimation(true, randomCard);
                        }
                    }
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
        this.gameData[first]['cardIndexNo'] = 30;
        this.gameData[second]['cardIndexNo'] = 30;

        this.sendCards();
        this.gameData[first].socket.emit("YOUR_TURN");

        this.sendTalk([
            {
                text: "这是我对你的最后一个考验，也是你大一的毕业考试"
            },
            {
                text: "如果你通过了这场考验，我将会对你说一些这个世界<span style='color: red'>隐藏的秘密</span>"
            },
            {
                text: "来吧"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level10;
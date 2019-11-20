let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level8 extends LevelBase {

    initValue() {
        this.levelId = 6;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "论坛导师" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        Object.assign(this.gameData[first], {
            cards: [
                {
                    k: "1",
                    id: "s3",
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
                }
            ],
            tableCards: [],
            life: 1,
            fee: 3,
            maxFee: 3
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "2",
                    id: 2,
                    name: "访问量",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: ""
                },
                {
                    k: "3",
                    id: 3,
                    name: "访问量",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: ""
                },
                {
                    k: "4",
                    id: 4,
                    name: "访问量",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: ""
                },
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
                text: "闲来无事可以在网络上看看，了解世界上各种各样的新技术，瞧啊，这就是微服务技术"
            },
            {
                text: "哦！对了，忘了给你介绍了，这是<span style='color: red'>效果牌</span>，有各种各样的效果牌可以使用哟"
            },
            {
                text: "了解一下吧"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level8;
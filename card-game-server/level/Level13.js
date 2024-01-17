let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, GameMode, TargetType, CardPosition
} = require('../constants');
const cardEffectFactory = require('../card-effect-factory');
const LevelBase = require('./LevelBase');
const WebBot1 = require("../bot/webBot1");

class Level13 extends LevelBase {

    initValue() {
        this.levelId = 11;
        this.taskList = [
            "在黑暗计算机世界四大天王之一的手下存活4个回合"
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
            ],
            useCards: [],
            life: 1,
            fee: 2,
            maxFee: 2,
            maxHandCardNumber: 10
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "1",
                    id: 1,
                    name: "四大天王 神秘人",
                    cardImage: "http://cdn.xiejingyang.com/cardGame/%E6%B5%8B%E8%AF%95%E5%8D%A1%E7%89%8C.png",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "有洁癖，要清场了才会攻击玩家",
                    attack: 20,
                    life: 99,
                    attackBase: 20,
                    lifeBase: 99,
                    type: ""
                },
            ],
            useCards: [],
            life: 99,
            fee: 1,
            maxFee: 1
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

        this.sendTalk([
            {
                text: "不愧是被选中的英雄，你真是天赋异禀"
            },
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level13;
let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, GameMode, TargetType, CardPosition
} = require('../constants');
const cardEffectFactory = require('../card-effect-factory');
const LevelBase = require('./LevelBase');
const WebBot1 = require("../bot/webBot1");

class Level12 extends LevelBase {

    initValue() {
        this.levelId = 10;
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
                    name: "开发助理",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: ``,
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: [""],
                    isActionable: true
                },
                {
                    k: "2",
                    id: 1,
                    name: "开发助理",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: ``,
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: [""],
                    isActionable: true
                },
                {
                    k: "3",
                    id: 1,
                    name: "开发助理",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: ``,
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: [""],
                    isActionable: true
                }
            ],
            useCards: [],
            life: 1,
            fee: 1,
            maxFee: 1,
            maxHandCardNumber: 10
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "4",
                    id: 2,
                    name: "恶毒追兵",
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
                    k: "5",
                    id: 3,
                    name: "恶毒追兵头子",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 2,
                    attackBase: 1,
                    lifeBase: 2,
                    type: ""
                },
                {
                    k: "6",
                    id: 2,
                    name: "恶毒追兵",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: ""
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
            {
                text: "不过不要高兴的太早，他们马上就会追上来，我现在要教你一些东西，你注意看"
            },
            {
                text: "在你的右侧，会有一个新的能力出现<span style='color: red'>技能</span>"
            },
            {
                text: "你会慢慢领悟到更多的<span style='color: red'>技能</span>，目前你可以使用的是<span style='color: red'>阅读书籍</span>，它能让你消耗1点能量来提高牌桌上某张卡牌1点攻击力"
            },
            {
                text: "他们来了，你开始战斗吧！"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level12;
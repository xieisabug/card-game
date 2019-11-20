let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level6 extends LevelBase {

    initValue() {
        this.levelId = 4;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "计算机组成原理" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        Object.assign(this.gameData[first], {
            cards: [
                {
                    k: "1",
                    id: 1,
                    name: "精力充沛的同学",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "精力充沛",
                    attack: 1,
                    life: 2,
                    attackBase: 1,
                    lifeBase: 2,
                    type: "",
                    isFullOfEnergy: true
                }
            ],
            tableCards: [
                {
                    k: "2",
                    id: 1,
                    name: "学霸笔记",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: "",
                    isActionable: true
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
                    k: "3",
                    id: 3,
                    name: "预习题",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "奉献",
                    attack: 2,
                    life: 1,
                    attackBase: 2,
                    lifeBase: 1,
                    type: "",
                    isDedication: true
                },
                {
                    k: "4",
                    id: 4,
                    name: "复习题",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 2,
                    attackBase: 1,
                    lifeBase: 2,
                    type: ""
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

        this.sendTalk([
            {
                text: "'精力充沛' 只是其中一个效果，还有各种各样的效果在游戏中等着你来探索，你瞧桌面上！"
            },
            {
                text: "一道预习题挡在了你的前面，他可是<span style='color: red'>奉献</span>自己保护别人的呢，所以，当有 '奉献' 卡牌出现的时候，必须要<span style='color: red'>先攻击它</span>哟"
            },
            {
                text: "来吧，试着攻克它"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level6;
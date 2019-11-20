let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level7 extends LevelBase {

    initValue() {
        this.levelId = 5;
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
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: "",
                    isFullOfEnergy: true
                },
                {
                    k: "2",
                    id: 2,
                    name: "精力充沛的同学",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "精力充沛",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: "",
                    isFullOfEnergy: true
                },
                {
                    k: "3",
                    id: 3,
                    name: "精力充沛的小组长",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "精力充沛",
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: "",
                    isFullOfEnergy: true
                },
                {
                    k: "4",
                    id: 4,
                    name: "精力充沛的小组长",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "精力充沛",
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: "",
                    isFullOfEnergy: true
                },
                {
                    k: "5",
                    id: 5,
                    name: "精力充沛的课代表",
                    cardType: CardType.CHARACTER,
                    cost: 3,
                    content: "精力充沛",
                    attack: 5,
                    life: 1,
                    attackBase: 5,
                    lifeBase: 1,
                    type: "",
                    isFullOfEnergy: true
                },
            ],
            tableCards: [],
            life: 1,
            fee: 7,
            maxFee: 7
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "6",
                    id: 6,
                    name: "考题",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "奉献，强壮",
                    attack: 10,
                    life: 2,
                    attackBase: 10,
                    lifeBase: 2,
                    type: "",
                    isDedication: true,
                    isStrong: true
                },
                {
                    k: "7",
                    id: 7,
                    name: "考题",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "奉献，强壮",
                    attack: 10,
                    life: 2,
                    attackBase: 10,
                    lifeBase: 2,
                    type: "",
                    isDedication: true,
                    isStrong: true
                },
                {
                    k: "8",
                    id: 8,
                    name: "送分题",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 0,
                    life: 5,
                    attackBase: 0,
                    lifeBase: 5,
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
        this.sendCards();
        this.gameData[first].socket.emit("YOUR_TURN");

        this.sendTalk([
            {
                text: "这是你的第一次考试，考题一般要比习题要难一些哦。"
            },
            {
                text: "你看到了么，考题的拥有<span style='color: red'>强壮</span>，这个能力能够完美<span style='color: red'>抵御你的一次攻击</span>。"
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

module.exports = Level7;
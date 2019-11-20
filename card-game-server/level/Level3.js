let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level3 extends LevelBase {

    initValue() {
        this.levelId = 2;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "电脑" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        Object.assign(this.gameData[first], {
            cards: [],
            tableCards: [
                {
                    k: "1",
                    id: 1,
                    name: "安装",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 5,
                    attackBase: 2,
                    lifeBase: 5,
                    type: "",
                    isActionable: true
                },
                {
                    k: "2",
                    id: 2,
                    name: "安装",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 5,
                    attackBase: 2,
                    lifeBase: 5,
                    type: "",
                    isActionable: true
                },
                {
                    k: "3",
                    id: 3,
                    name: "安装",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 5,
                    attackBase: 2,
                    lifeBase: 5,
                    type: "",
                    isActionable: true
                },
                {
                    k: "4",
                    id: 4,
                    name: "安装",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 5,
                    attackBase: 2,
                    lifeBase: 5,
                    type: "",
                    isActionable: true
                },
                {
                    k: "5",
                    id: 5,
                    name: "下载",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 1,
                    attackBase: 3,
                    lifeBase: 1,
                    type: "",
                    isActionable: true
                },
                {
                    k: "6",
                    id: 6,
                    name: "下载",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 1,
                    attackBase: 3,
                    lifeBase: 1,
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
                    k: "7",
                    id: 7,
                    name: "浏览器",
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
                    k: "8",
                    id: 8,
                    name: "编辑器",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 1,
                    attackBase: 2,
                    lifeBase: 1,
                    type: "",
                    isActionable: true
                },
                {
                    k: "9",
                    id: 9,
                    name: "阅读器",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 5,
                    life: 5,
                    attackBase: 5,
                    lifeBase: 5,
                    type: "",
                    isActionable: true
                },
                {
                    k: "10",
                    id: 10,
                    name: "编译器",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 4,
                    attackBase: 1,
                    lifeBase: 4,
                    type: "",
                    isActionable: true
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
                text: "工欲善其事必先利其器，动手之前我们先把软件都下载好吧"
            },
            {
                text: "记得要<span style='color: red'>一个不落</span>哟"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level3;
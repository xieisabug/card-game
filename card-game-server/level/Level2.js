let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level2 extends LevelBase {

    initValue() {
        this.levelId = 1;
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
                    name: "左眼",
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
                    k: "2",
                    id: 2,
                    name: "右眼",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 2,
                    life: 1,
                    attackBase: 2,
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
                    k: "3",
                    id: 3,
                    name: "屏幕",
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
                    k: "4",
                    id: 4,
                    name: "黑板",
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
                text: "是谁的小眼睛没有在看老师啊~"
            },
            {
                text: "上课要认真哟~一定要全部<span style='color: red'>学完</span>哟~"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level2;
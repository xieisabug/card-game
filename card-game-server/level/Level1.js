let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level1 extends LevelBase {

    initValue() {
        this.levelId = 0;
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
                    name: "手指",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
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
                    k: "2",
                    id: 2,
                    name: "开机键",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 1,
                    life: 1,
                    attackBase: 1,
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
                text: "欢迎入学，我的朋友~"
            },
            {
                text: "这里是充满魅力的编程世界，让我们从第一步开始， '用你的手指打开你的电脑' 吧~"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level1;
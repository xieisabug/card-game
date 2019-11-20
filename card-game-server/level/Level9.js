let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level9 extends LevelBase {

    initValue() {
        this.levelId = 7;
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
                    k: "21",
                    id: 21,
                    name: "马克·扎克伯格",
                    cardType: CardType.CHARACTER,
                    cost: 5,
                    content: "出场：随机夺取对方一个场上单位的使用权",
                    attack: 3,
                    life: 3,
                    attackBase: 3,
                    lifeBase: 3,
                    type: "",
                    onStart: function ({myGameData, otherGameData, specialMethod}) {
                        if (otherGameData.tableCards.length !== 0) {
                            let randomIndex = Math.floor(specialMethod.rand() * otherGameData.tableCards.length);
                            let card = otherGameData.tableCards.splice(randomIndex, 1)[0];
                            myGameData.tableCards.push(card);
                            specialMethod.outCardAnimation(true, card);
                            specialMethod.refreshGameData();
                        }
                    }
                }
            ],
            tableCards: [],
            life: 1,
            fee: 5,
            maxFee: 5
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: [
                {
                    k: "2",
                    id: 2,
                    name: "奇妙想法",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 3,
                    attackBase: 3,
                    lifeBase: 3,
                    type: "",
                    isActionable: true
                },
                {
                    k: "3",
                    id: 3,
                    name: "奇妙想法",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: "",
                    attack: 3,
                    life: 3,
                    attackBase: 3,
                    lifeBase: 3,
                    type: "",
                    isActionable: true
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
                text: "嗯....还有各种各样的名人故事"
            },
            {
                text: "对！这是<span style='color: red'>伙伴效果牌</span>，像效果牌一样也有各种效果哟"
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

module.exports = Level9;
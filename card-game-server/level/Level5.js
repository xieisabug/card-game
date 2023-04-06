let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');

class Level5 extends LevelBase {

    initValue() {
        this.levelId = 3;
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
            tableCards: [],
            useCards: [],
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
                    name: "难题",
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
                text: "恭喜恭喜，没想到你的学习能力这么强。那么，现在见见你的伙伴吧"
            },
            {
                text: "看到你的伙伴牌了么，在你的手中可以打出他，只有桌面上的牌，才是可与对手对战的牌哟"
            },
            {
                text: "伙伴拥有各种不同的能力，看看你手中的伙伴，他<span style='color: red'>精力充沛</span>呢！</br>那就意味着，他一上场，就能开始行动了，要知道其他的伙伴刚上场的第一回合是需要休息的呢。"
            },
            {
                text: "好了，带上你的伙伴，一起攻克难题吧"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level5;
let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER
} = require('../constants');
const { Tags } = require('../utils');
const LevelBase = require('./LevelBase');
const { effectEngine } = require('../effect-system');

// Level9 卡牌配置
const Level9Cards = {
    // 玩家手牌
    handCards: [
        {
            id: "l9-zuckerberg",
            name: "马克·扎克伯格",
            tags: [Tags.Character],
            cost: 5,
            attack: 3,
            life: 3,
            content: "出场：随机夺取对方一个场上单位的使用权",
            types: [],
            tags: [],
            effects: {
                onStart: [{
                    type: "StealCard",
                    params: {
                        source: "otherTable",
                        count: 1,
                        random: true
                    }
                }]
            }
        }
    ],
    // 敌方随从
    enemyCards: [
        {
            id: "l9-idea1",
            name: "奇妙想法",
            tags: [Tags.Character],
            cost: 1,
            attack: 3,
            life: 3,
            content: "",
            types: [],
            tags: ["Status.Action.CanAct"]
        },
        {
            id: "l9-idea2",
            name: "奇妙想法",
            tags: [Tags.Character],
            cost: 1,
            attack: 3,
            life: 3,
            content: "",
            types: [],
            tags: ["Status.Action.CanAct"]
        }
    ]
};

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

        // 创建卡牌实例
        const createCard = (config, k) => {
            const card = {
                ...config,
                k,
                attackBase: config.attack,
                lifeBase: config.life,
                type: config.types || []
            };
            effectEngine.createCardHooks(card);
            return card;
        };

        // 创建玩家手牌
        const handCards = Level9Cards.handCards.map((card, idx) =>
            createCard(card, String(idx + 21))
        );

        // 创建敌方随从
        const enemyCards = Level9Cards.enemyCards.map((card, idx) =>
            createCard(card, String(idx + 2))
        );

        Object.assign(this.gameData[first], {
            useCards: [],
            cards: handCards,
            tableCards: [],
            life: 1,
            fee: 5,
            maxFee: 5
        });
        Object.assign(this.gameData[second], {
            useCards: [],
            cards: [],
            tableCards: enemyCards,
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

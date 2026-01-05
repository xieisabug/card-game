let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, TargetType
} = require('../constants');
const LevelBase = require('./LevelBase');
const { effectEngine } = require('../effect-system');

// 使用 Effect 配置的关卡卡牌定义
const Level4Cards = [
    // 我方卡牌
    {
        id: "l4-brain",
        name: "大脑",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 2,
        life: 5,
        content: "当记忆细胞受伤且没有死亡的时候，强化大脑的1点攻击",
        types: [],
        tags: [],
        effects: {
            onOtherCardAttack: [
                {
                    type: "ModifyAttribute",
                    target: { type: "self" },
                    params: { attribute: "attack", value: 1 }
                }
            ]
        }
    },
    {
        id: "l4-memory1",
        name: "记忆细胞1",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 2,
        life: 2,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-memory2",
        name: "记忆细胞2",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 3,
        life: 4,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-memory3",
        name: "记忆细胞3",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 2,
        life: 5,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-memory4",
        name: "记忆细胞4",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 3,
        life: 6,
        content: "",
        types: [],
        tags: []
    },
    // 敌方卡牌
    {
        id: "l4-knowledge1",
        name: "知识点1",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 1,
        life: 2,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-knowledge2",
        name: "知识点2",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 5,
        life: 3,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-knowledge3",
        name: "知识点3",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 3,
        life: 2,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-knowledge4",
        name: "知识点4",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 4,
        life: 1,
        content: "",
        types: [],
        tags: []
    },
    {
        id: "l4-chapter",
        name: "课程章节",
        cardType: CardType.CHARACTER,
        cost: 1,
        attack: 5,
        life: 6,
        content: "",
        types: [],
        tags: []
    }
];

class Level4 extends LevelBase {

    initValue() {
        this.levelId = 999;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "计算机导论" };

        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        // 创建卡牌实例
        const createCard = (config, k) => {
            const card = {
                ...config,
                k,
                attackBase: config.attack,
                lifeBase: config.life,
                isActionable: true,
                type: config.types || []
            };

            // 如果有 effects，添加钩子函数
            if (config.effects && Object.keys(config.effects).length > 0) {
                effectEngine.createCardHooks(card);
            }

            return card;
        };

        Object.assign(this.gameData[first], {
            useCards: [],
            cards: [],
            tableCards: [
                createCard(Level4Cards[0], "6"),  // 大脑
                createCard(Level4Cards[1], "1"),  // 记忆细胞1
                createCard(Level4Cards[2], "2"),  // 记忆细胞2
                createCard(Level4Cards[3], "3"),  // 记忆细胞3
                createCard(Level4Cards[4], "4"),  // 记忆细胞4
            ],
            life: 1,
            fee: 1,
            maxFee: 1
        });

        Object.assign(this.gameData[second], {
            useCards: [],
            cards: [],
            tableCards: [
                createCard(Level4Cards[5], "7"),   // 知识点1
                createCard(Level4Cards[6], "8"),   // 知识点2
                createCard(Level4Cards[7], "9"),   // 知识点3
                createCard(Level4Cards[8], "10"),  // 知识点4
                createCard(Level4Cards[9], "11"),  // 课程章节
            ],
            life: 99,
            fee: 1,
            maxFee: 1
        });

        // 为我方卡牌添加 targetType
        this.gameData[first].tableCards.forEach(card => {
            card.targetType = TargetType.MY_TABLE_CARD;
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

        this.sendTalk({
            text: "好啦好啦~老师要讲第一章了，努力消化掉<span style='color: red'>所有的</span>知识点和章节吧！"
        });
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level4;
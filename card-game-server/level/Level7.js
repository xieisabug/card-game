let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');
const { effectEngine } = require('../effect-system');

// Level7 卡牌配置
const Level7Cards = {
    // 玩家手牌
    handCards: [
        {
            id: "l7-student1",
            name: "精力充沛的同学",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 1,
            life: 1,
            content: "精力充沛",
            types: [],
            tags: ["Status.Buff.FullOfEnergy"]
        },
        {
            id: "l7-student2",
            name: "精力充沛的同学",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 1,
            life: 1,
            content: "精力充沛",
            types: [],
            tags: ["Status.Buff.FullOfEnergy"]
        },
        {
            id: "l7-leader1",
            name: "精力充沛的小组长",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 2,
            life: 2,
            content: "精力充沛",
            types: [],
            tags: ["Status.Buff.FullOfEnergy"]
        },
        {
            id: "l7-leader2",
            name: "精力充沛的小组长",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 2,
            life: 2,
            content: "精力充沛",
            types: [],
            tags: ["Status.Buff.FullOfEnergy"]
        },
        {
            id: "l7-representative",
            name: "精力充沛的课代表",
            cardType: CardType.CHARACTER,
            cost: 3,
            attack: 5,
            life: 1,
            content: "精力充沛",
            types: [],
            tags: ["Status.Buff.FullOfEnergy"]
        }
    ],
    // 敌方随从
    enemyCards: [
        {
            id: "l7-exam1",
            name: "考题",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 10,
            life: 2,
            content: "奉献，强壮",
            types: [],
            tags: ["Status.Buff.Dedication", "Status.Buff.Strong"]
        },
        {
            id: "l7-exam2",
            name: "考题",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 10,
            life: 2,
            content: "奉献，强壮",
            types: [],
            tags: ["Status.Buff.Dedication", "Status.Buff.Strong"]
        },
        {
            id: "l7-gift",
            name: "送分题",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 0,
            life: 5,
            content: "",
            types: [],
            tags: []
        }
    ]
};

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
        const handCards = Level7Cards.handCards.map((card, idx) =>
            createCard(card, String(idx + 1))
        );

        // 创建敌方随从
        const enemyCards = Level7Cards.enemyCards.map((card, idx) =>
            createCard(card, String(idx + 6))
        );

        Object.assign(this.gameData[first], {
            useCards: [],
            cards: handCards,
            tableCards: [],
            life: 1,
            fee: 7,
            maxFee: 7
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

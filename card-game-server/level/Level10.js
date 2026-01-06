let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER
} = require('../constants');
const { Tags } = require('../utils');
const LevelBase = require('./LevelBase');
const { effectEngine } = require('../effect-system');

// Level10 卡牌配置
const Level10Cards = {
    // 玩家手牌
    handCards: [
        {
            id: "l10-microservice",
            name: "启用微服务",
            tags: [Tags.Effect],
            cost: 3,
            content: "召唤3个1/1且带有精力充沛的基础服务",
            types: ["效果卡"],
            tags: [],
            effects: {
                onStart: [{
                    type: "SummonWithEffects",
                    params: {
                        count: 3,
                        cardTemplate: {
                            id: "l10-base-service",
                            name: "基础微服务",
                            tags: [Tags.Character],
                            cost: 1,
                            attack: 1,
                            life: 1,
                            content: "精力充沛",
                            types: [],
                            tags: ["Status.Buff.FullOfEnergy", "Status.Action.CanAct"]
                        }
                    }
                }]
            }
        },
        {
            id: "l10-neck-pain-1",
            name: "颈椎病",
            tags: [Tags.Effect],
            cost: 2,
            content: "对场上所有对方卡牌造成1点伤害",
            types: ["效果卡"],
            tags: [],
            effects: {
                onStart: [{
                    type: "DamageAll",
                    target: { type: "otherTable" },
                    params: {
                        amount: 1
                    }
                }]
            }
        },
        {
            id: "l10-neck-pain-2",
            name: "颈椎病",
            tags: [Tags.Effect],
            cost: 2,
            content: "对场上所有对方卡牌造成1点伤害",
            types: ["效果卡"],
            tags: [],
            effects: {
                onStart: [{
                    type: "DamageAll",
                    target: { type: "otherTable" },
                    params: {
                        amount: 1
                    }
                }]
            }
        }
    ],
    // 敌方手牌
    enemyHandCards: [
        {
            id: "l10-news1",
            name: "源源不断的资讯",
            tags: [Tags.Character],
            cost: 1,
            attack: 1,
            life: 1,
            content: "强壮，退场：随机召唤手牌中的一个伙伴",
            types: [],
            tags: ["Status.Action.CanAct", "Status.Buff.Strong"],
            effects: {
                onEnd: [{
                    type: "SummonFromHand",
                    params: {
                        count: 1,
                        filter: {
                            tags: [Tags.Character]
                        },
                        side: "my",
                        random: true
                    }
                }]
            }
        },
        {
            id: "l10-news2",
            name: "源头的资讯",
            tags: [Tags.Character],
            cost: 1,
            attack: 1,
            life: 1,
            content: "",
            types: [],
            tags: ["Status.Action.CanAct"]
        }
    ],
    // 敌方随从
    enemyTableCards: [
        {
            id: "l10-news3",
            name: "源源不断的资讯",
            tags: [Tags.Character],
            cost: 1,
            attack: 1,
            life: 1,
            content: "强壮，退场：随机召唤手牌中的一个伙伴",
            types: [],
            tags: ["Status.Action.CanAct", "Status.Buff.Strong"],
            effects: {
                onEnd: [{
                    type: "SummonFromHand",
                    params: {
                        count: 1,
                        filter: {
                            tags: [Tags.Character]
                        },
                        side: "my",
                        random: true
                    }
                }]
            }
        },
        {
            id: "l10-news4",
            name: "源源不断的资讯",
            tags: [Tags.Character],
            cost: 1,
            attack: 1,
            life: 1,
            content: "强壮，退场：随机召唤手牌中的一个伙伴",
            types: [],
            tags: ["Status.Action.CanAct", "Status.Buff.Strong"],
            effects: {
                onEnd: [{
                    type: "SummonFromHand",
                    params: {
                        count: 1,
                        filter: {
                            tags: [Tags.Character]
                        },
                        side: "my",
                        random: true
                    }
                }]
            }
        }
    ]
};

class Level10 extends LevelBase {

    initValue() {
        this.levelId = 8;
        this.taskList = [
            "消灭对方所有随从"
        ]
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "神秘人" };

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
        const handCards = Level10Cards.handCards.map((card, idx) =>
            createCard(card, String(idx + 1))
        );

        // 创建敌方手牌
        const enemyHandCards = Level10Cards.enemyHandCards.map((card, idx) =>
            createCard(card, String(idx + 4))
        );

        // 创建敌方随从
        const enemyTableCards = Level10Cards.enemyTableCards.map((card, idx) =>
            createCard(card, String(idx + 6))
        );

        Object.assign(this.gameData[first], {
            useCards: [],
            cards: handCards,
            tableCards: [],
            life: 1,
            fee: 10,
            maxFee: 10
        });
        Object.assign(this.gameData[second], {
            useCards: [],
            cards: enemyHandCards,
            tableCards: enemyTableCards,
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
        this.gameData[first]['cardIndexNo'] = 30;
        this.gameData[second]['cardIndexNo'] = 30;

        this.sendCards();
        this.gameData[first].socket.emit("YOUR_TURN");

        this.sendTalk([
            {
                text: "这是我对你的最后一个考验，也是你大一的毕业考试"
            },
            {
                text: "如果你通过了这场考验，我将会对你说一些这个世界<span style='color: red'>隐藏的秘密</span>"
            },
            {
                text: "来吧"
            }
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level10;

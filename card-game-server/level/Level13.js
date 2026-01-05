let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, GameMode, TargetType
} = require('../constants');
const cardEffectFactory = require('../card-effect-factory');
const LevelBase = require('./LevelBase');
const WebBotBoss1 = require("../bot/webBot-boss1");
const { effectEngine } = require('../effect-system');

// 黑客精英卡牌模板（用于召唤）
const HackerEliteTemplate = {
    id: "l13-hacker",
    name: "黑客精英",
    cardType: CardType.CHARACTER,
    cost: 10,
    attack: 25,
    life: 25,
    content: "每击败一张卡牌，对对方所有卡牌造成5点伤害。",
    attackBase: 25,
    lifeBase: 25,
    types: [],
    effects: {
        onAttack: [
            {
                type: "ConditionalEffect",
                conditions: [
                    {
                        type: "beAttackedCardAttribute",
                        params: { attribute: "life", operator: "<=", value: 0 }
                    }
                ],
                params: {
                    ifTrue: [
                        {
                            type: "Damage",
                            params: { amount: 5 },
                            target: { type: "otherTable" }
                        }
                    ]
                }
            }
        ]
    }
};

// Level13 卡牌配置
const Level13Cards = {
    // 玩家手牌
    handCards: [
        {
            id: "l13-genius",
            name: "没毕业的天才程序员",
            cardType: CardType.CHARACTER,
            cost: 3,
            attack: 1,
            life: 1,
            content: "每回合结束时，获得+1/+1",
            types: [],
            tags: [],
            effects: {
                onMyTurnEnd: [
                    {
                        type: "ModifyAttribute",
                        params: { attribute: "attack", value: 1 }
                    },
                    {
                        type: "ModifyAttribute",
                        params: { attribute: "life", value: 1 }
                    }
                ]
            }
        },
        {
            id: "l13-drip",
            name: "打点滴",
            cardType: CardType.EFFECT,
            cost: 1,
            content: "为友方单位添加亡语：死亡后复活1次",
            types: ["效果卡"],
            tags: [],
            isTarget: true,
            targetType: TargetType.MY_TABLE_CARD,
            effects: {
                onChooseTarget: [
                    {
                        type: "GrantReborn",
                        params: { once: true },
                        target: { type: "chosen" }
                    }
                ]
            }
        },
        {
            id: "l13-chicken",
            name: "吃鸡",
            cardType: CardType.EFFECT,
            cost: 4,
            content: "为场上所有单位添加 坚强 效果",
            types: ["效果卡"],
            tags: [],
            effects: {
                onStart: [
                    {
                        type: "ApplyTag",
                        params: {
                            tag: "Status.Buff.Strong"
                        },
                        target: { type: "allTable" }
                    }
                ]
            }
        }
    ],
    // 敌方随从
    enemyTableCards: [
        {
            id: "l13-boss",
            name: "四大天王 神秘人",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 20,
            life: 99,
            content: "洁癖，清场后才会攻击玩家",
            types: [],
            tags: [],
            cardImage: "http://cdn.xiejingyang.com/cardGame/f375608e-87bb-411d-ac73-ddf1c5d81ea9.webp",
            myRoundNumber: 0,
            effects: {
                onMyTurnEnd: [
                    {
                        type: "ModifyAttribute",
                        params: { attribute: "myRoundNumber", value: 1 },
                        target: { type: "self" }
                    },
                    {
                        type: "ConditionalEffect",
                        conditions: [
                            {
                                type: "attributeCondition",
                                params: { attribute: "myRoundNumber", operator: ">=", value: 3 }
                            }
                        ],
                        params: {
                            ifTrue: [
                                {
                                    type: "SummonWithEffects",
                                    params: {
                                        side: "my",
                                        cardTemplate: HackerEliteTemplate
                                    }
                                },
                                {
                                    type: "DestroyTarget",
                                    target: { type: "self" }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ],
    // 第三阶段手牌
    phaseThreeHandCards: [
        {
            id: "l13-leader1",
            name: "无私的组长",
            cardType: CardType.CHARACTER,
            cost: 2,
            attack: 2,
            life: 2,
            content: "精力充沛，退出：给在场所有的单位 坚强 效果",
            types: [],
            tags: ["Status.Buff.FullOfEnergy", "Status.Action.CanAct"],
            effects: {
                onEnd: [
                    {
                        type: "ApplyTag",
                        params: { tag: "Status.Buff.Strong" },
                        target: { type: "allTable" }
                    }
                ]
            }
        },
        {
            id: "l13-leader2",
            name: "无私的组长",
            cardType: CardType.CHARACTER,
            cost: 2,
            attack: 2,
            life: 2,
            content: "精力充沛，退出：给在场所有的单位 坚强 效果",
            types: [],
            tags: ["Status.Buff.FullOfEnergy", "Status.Action.CanAct"],
            effects: {
                onEnd: [
                    {
                        type: "ApplyTag",
                        params: { tag: "Status.Buff.Strong" },
                        target: { type: "allTable" }
                    }
                ]
            }
        },
        {
            id: "l13-leader3",
            name: "无私的组长",
            cardType: CardType.CHARACTER,
            cost: 2,
            attack: 2,
            life: 2,
            content: "精力充沛，退出：给在场所有的单位 坚强 效果",
            types: [],
            tags: ["Status.Buff.FullOfEnergy", "Status.Action.CanAct"],
            effects: {
                onEnd: [
                    {
                        type: "ApplyTag",
                        params: { tag: "Status.Buff.Strong" },
                        target: { type: "allTable" }
                    }
                ]
            }
        },
        {
            id: "l13-leader4",
            name: "无私的组长",
            cardType: CardType.CHARACTER,
            cost: 2,
            attack: 2,
            life: 2,
            content: "精力充沛，退出：给在场所有的单位 坚强 效果",
            types: [],
            tags: ["Status.Buff.FullOfEnergy", "Status.Action.CanAct"],
            effects: {
                onEnd: [
                    {
                        type: "ApplyTag",
                        params: { tag: "Status.Buff.Strong" },
                        target: { type: "allTable" }
                    }
                ]
            }
        },
        {
            id: "l13-leader5",
            name: "无私的组长",
            cardType: CardType.CHARACTER,
            cost: 2,
            attack: 2,
            life: 2,
            content: "精力充沛，退出：给在场所有的单位 坚强 效果",
            types: [],
            tags: ["Status.Buff.FullOfEnergy", "Status.Action.CanAct"],
            effects: {
                onEnd: [
                    {
                        type: "ApplyTag",
                        params: { tag: "Status.Buff.Strong" },
                        target: { type: "allTable" }
                    }
                ]
            }
        }
    ]
};

class Level13 extends LevelBase {

    initValue() {
        this.levelId = 11;
        this.taskList = [
            "在黑暗计算机世界四大天王之一的手下存活3个回合"
        ];

        this.bot = new WebBotBoss1();
    }

    initCard() {
        let first = "one", second = "two";
        let oneUser = { nickname: "你" };
        let twoUser = { nickname: "神秘人" };

        this.gameData.round = 1;
        this.gameData["one"]["remainingCards"] = [];
        this.gameData["two"]["remainingCards"] = [];

        // 创建卡牌实例
        const createCard = (config, k) => {
            const types = config.types || config.type || [];
            const card = {
                ...config,
                k,
                attackBase: config.attack,
                lifeBase: config.life,
                type: types,
                types
            };
            effectEngine.createCardHooks(card);
            return card;
        };

        // 创建玩家手牌
        const handCards = Level13Cards.handCards.map((card, idx) =>
            createCard(card, String(idx + 3))
        );

        // 创建敌方随从
        const enemyTableCards = Level13Cards.enemyTableCards.map((card, idx) =>
            createCard(card, String(idx + 1))
        );

        Object.assign(this.gameData[first], {
            cards: handCards,
            tableCards: [],
            useCards: [],
            life: 1,
            fee: 4,
            maxFee: 4,
            maxHandCardNumber: 10
        });
        Object.assign(this.gameData[second], {
            cards: [],
            tableCards: enemyTableCards,
            useCards: [],
            life: 99,
            fee: 1,
            maxFee: 1
        });
        Object.assign(this.gameData, {
            gameMode: GameMode.PVE2,
        });

        this.gameData['currentRound'] = first;
        this.gameData[first]['info'] = oneUser;
        this.gameData[second]['info'] = twoUser;
        this.gameData[first]['skillList'] = [
            {
                name: "阅读书籍",
                cost: 1,
                isTarget: true,
                targetType: TargetType.MY_TABLE_CARD,
                description: '通过阅读书籍提高自己，选择提高牌桌上1张卡牌1点攻击力',
                onChooseTarget: cardEffectFactory.oneChooseCardAddAttack(1)
            }
        ];

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

        // 第三阶段规则脚本
        this.registerRuleScript(
            (gameData) => {
                return gameData.round === 3;
            },
            () => {
                this.sendTalk([
                    { text: "我找到办法引走四大天王了，你对付他的手下吧" },
                ]);

                const phaseThreeCards = Level13Cards.phaseThreeHandCards.map((card, idx) =>
                    createCard(card, String(idx + 6))
                );

                this.gameData[first].cards.push(...phaseThreeCards);
                this.sendCards();
            }
        );

        this.sendTalk([
            {
                text: "不好，他是黑暗计算机世界的四大天王之一，你先帮我拖住他，我想想办法",
            },
        ]);
    }

    checkWin() {
        return this.gameData['two'].tableCards.length === 0
    }
}

module.exports = Level13;

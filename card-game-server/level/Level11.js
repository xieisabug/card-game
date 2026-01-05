let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType, GameMode, TargetType, CardPosition
} = require('../constants');
const LevelBase = require('./LevelBase');
const WebBot1 = require("../bot/webBot1");
const { effectEngine } = require('../effect-system');

// Level11 卡牌配置
const Level11Cards = {
    // 初始随从
    myTableCards: [
        {
            id: "l11-i-will",
            name: "我愿意",
            cardType: CardType.CHARACTER,
            cost: 10,
            attack: 5,
            life: 10,
            content: "",
            types: [],
            tags: ["Status.Action.CanAct"]
        }
    ],
    enemyTableCards: [
        {
            id: "l11-join",
            name: "加入！",
            cardType: CardType.CHARACTER,
            cost: 1,
            attack: 1,
            life: 5,
            content: "",
            types: [],
            tags: [],
            customOnEnd: true  // 需要动态创建新卡牌
        }
    ],
    // 第二阶段卡牌
    myHandCards: [
        {
            id: "l11-genius1",
            name: "没毕业的天才程序员",
            cardType: CardType.CHARACTER,
            cost: 3,
            attack: 1,
            life: 1,
            content: "每回合结束时，获得+1/+1",
            types: [],
            tags: [],
            effects: {
                onMyTurnEnd: [{
                    type: "ModifyAttribute",
                    params: { attribute: "attack", value: 1 }
                }, {
                    type: "ModifyAttribute",
                    params: { attribute: "life", value: 1 }
                }]
            }
        },
        {
            id: "l11-genius2",
            name: "没毕业的天才程序员",
            cardType: CardType.CHARACTER,
            cost: 3,
            attack: 1,
            life: 1,
            content: "每回合结束时，获得+1/+1",
            types: [],
            tags: [],
            effects: {
                onMyTurnEnd: [{
                    type: "ModifyAttribute",
                    params: { attribute: "attack", value: 1 }
                }, {
                    type: "ModifyAttribute",
                    params: { attribute: "life", value: 1 }
                }]
            }
        },
        {
            id: "l11-ide-master",
            name: "IDE大师",
            cardType: CardType.CHARACTER,
            cost: 7,
            attack: 6,
            life: 4,
            content: "出场：场上所有人员获得+1/+1",
            types: [],
            tags: [],
            effects: {
                onStart: [{
                    type: "ModifyAttribute",
                    params: {
                        target: { type: "myTable" },
                        attribute: "attack",
                        value: 1
                    }
                }, {
                    type: "ModifyAttribute",
                    params: {
                        target: { type: "myTable" },
                        attribute: "life",
                        value: 1
                    }
                }]
            }
        },
        {
            id: "l11-debug",
            name: "断点调试",
            cardType: CardType.EFFECT,
            cost: 3,
            content: "指定一个己方召唤物本回合不受伤害",
            types: ["效果卡"],
            tags: [],
            isTarget: true,
            isForceTarget: true,
            targetType: TargetType.MY_TABLE_CARD,
            effects: {
                onChooseTarget: []
            },
            customOnChooseTarget: true
        }
    ],
    enemyHandCards: [
        {
            id: "l11-genius3",
            name: "没毕业的天才程序员",
            cardType: CardType.CHARACTER,
            cost: 3,
            attack: 1,
            life: 1,
            content: "每回合结束时，获得+1/+1",
            types: [],
            tags: [],
            effects: {
                onMyTurnEnd: [{
                    type: "ModifyAttribute",
                    params: { attribute: "attack", value: 1 }
                }, {
                    type: "ModifyAttribute",
                    params: { attribute: "life", value: 1 }
                }]
            }
        },
        {
            id: "l11-genius4",
            name: "没毕业的天才程序员",
            cardType: CardType.CHARACTER,
            cost: 3,
            attack: 1,
            life: 1,
            content: "每回合结束时，获得+1/+1",
            types: [],
            tags: [],
            effects: {
                onMyTurnEnd: [{
                    type: "ModifyAttribute",
                    params: { attribute: "attack", value: 1 }
                }, {
                    type: "ModifyAttribute",
                    params: { attribute: "life", value: 1 }
                }]
            }
        }
    ]
};

class Level11 extends LevelBase {

    initValue() {
        this.levelId = 9;
        this.taskList = [
            "消灭对方所有随从"
        ];

        this.bot = new WebBot1();
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

        // 创建我方初始随从
        const myTableCards = Level11Cards.myTableCards.map((card, idx) =>
            createCard(card, String(idx + 1))
        );

        // 创建敌方初始随从（特殊处理）
        const enemyTableCards = Level11Cards.enemyTableCards.map((card, idx) =>
            createCard(card, String(idx + 2))
        );
        // 为敌方随从添加特殊的 onEnd 逻辑
        enemyTableCards[0].onEnd = () => {
            this._startPhaseTwo();
        };

        Object.assign(this.gameData[first], {
            cards: [],
            tableCards: myTableCards,
            useCards: [],
            life: 1,
            fee: 10,
            maxFee: 10,
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
                text: "我要和你说的秘密非常重要，你一定要记住"
            },
            {
                text: "计算机世界不是像大家想的那么简单"
            },
            {
                text: "在前辈的努力下，我们的技术进步的非常快，但也慢慢发现了另一个恐怖的东西，那就是一个<span style='color: red'>隐藏的黑暗计算机世界</span>"
            },
            {
                text: "那个世界的技术被用来进行各种<span style='color: red'>犯罪活动</span>，所以我们一定要阻止他们"
            },
            {
                text: "他们资金雄厚，并且技术非常强大，所以，我们才需要像你这样的新血液，来帮助我们战胜他们！"
            }
        ]);
    }

    // 第二阶段开始
    _startPhaseTwo() {
        const first = "one", second = "two";

        this.sendTalk([
            { text: "太好了！" },
            { text: "接下来你的任务就是不断提升自己，成为能够独挡一面的角色" },
            { text: "慢着慢着~", npcImg: "bad1" },
            { text: "我可没同意啊~", npcImg: "bad1" },
            { text: "就是他们！" },
            { text: "来不及教你太多东西，先用我的卡组来作战吧！" },
        ]);

        Object.assign(this.gameData, { gameMode: GameMode.PVE2 });

        // 创建第二阶段卡牌
        const createCard = (config, k) => {
            const card = {
                ...config,
                k,
                attackBase: config.attack,
                lifeBase: config.life,
                type: config.types || []
            };
            effectEngine.createCardHooks(card);

            // 断点调试的特殊逻辑
            if (config.customOnChooseTarget) {
                card.onChooseTarget = function({ chooseCard, toIndex, thisCard, specialMethod }) {
                    chooseCard.isShortInvincible = true;
                    chooseCard.shortInvincibleRound = 1;
                    specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard);
                };
            }

            return card;
        };

        const myHandCards = Level11Cards.myHandCards.map((card, idx) =>
            createCard(card, String(idx + 3))
        );
        const enemyHandCards = Level11Cards.enemyHandCards.map((card, idx) =>
            createCard(card, String(idx + 7))
        );

        Object.assign(this.gameData[first], {
            cards: myHandCards,
            tableCards: [],
            life: 10,
            fee: 5,
            maxFee: 5
        });
        Object.assign(this.gameData[second], {
            cards: enemyHandCards,
            tableCards: [],
            life: 10,
            fee: 5,
            maxFee: 5
        });

        this.sendCards();
    }

    checkWin() {
        return this.gameData["two"].life <= 0
    }
}

module.exports = Level11;

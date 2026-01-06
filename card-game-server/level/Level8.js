let {
    MAX_HAND_CARD_NUMBER, MAX_BASE_TABLE_CARD_NUMBER, CardType
} = require('../constants');
const LevelBase = require('./LevelBase');
const { effectEngine } = require('../effect-system');

// 使用 Effect 配置的关卡卡牌定义
const Level8Cards = {
    // 玩家手牌
    handCards: [
        {
            id: "s3",
            name: "启用微服务",
            cardType: CardType.EFFECT,
            cost: 3,
            content: "召唤3个1/1且带有精力充沛的基础服务",
            types: ["效果卡"],
            tags: [],
            effects: {
                onStart: [
                    {
                        type: "SummonWithEffects",
                        params: {
                            count: 3,
                            cardTemplate: {
                                id: "s3-base",
                                name: "基础微服务",
                                cardType: CardType.CHARACTER,
                                cost: 1,
                                content: "精力充沛",
                                attack: 1,
                                life: 1,
                                types: [],
                                tags: ["Status.Buff.FullOfEnergy"]
                            }
                        }
                    }
                ]
            }
        }
    ],
    // 敌方随从
    enemyCards: [
        { name: "访问量", attack: 1, life: 1 },
        { name: "访问量", attack: 1, life: 1 },
        { name: "访问量", attack: 1, life: 1 }
    ]
};

class Level8 extends LevelBase {

    initValue() {
        this.levelId = 6;
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

            // 如果有 effects，添加钩子函数
            if (config.effects && Object.keys(config.effects).length > 0) {
                effectEngine.createCardHooks(card);
            }

            return card;
        };

        // 创建手牌
        const handCards = Level8Cards.handCards.map((card, idx) =>
            createCard(card, String(idx + 1))
        );

        // 创建敌方随从
        const enemyCards = Level8Cards.enemyCards.map((card, idx) =>
            createCard({
                id: `l8-enemy-${idx}`,
                name: card.name,
                cardType: CardType.CHARACTER,
                cost: 1,
                attack: card.attack,
                life: card.life,
                content: "",
                types: [],
                tags: []
            }, String(idx + 2))
        );

        Object.assign(this.gameData[first], {
            useCards: [],
            cards: handCards,
            tableCards: [],
            life: 1,
            fee: 3,
            maxFee: 3
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
        this.gameData[first]['cardIndexNo'] = 30;
        this.gameData[second]['cardIndexNo'] = 30;
        this.sendCards();
        this.gameData[first].socket.emit("YOUR_TURN");

        this.sendTalk([
            {
                text: "闲来无事可以在网络上看看，了解世界上各种各样的新技术，瞧啊，这就是微服务技术"
            },
            {
                text: "哦！对了，忘了给你介绍了，这是<span style='color: red'>效果牌</span>，有各种各样的效果牌可以使用哟"
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

module.exports = Level8;
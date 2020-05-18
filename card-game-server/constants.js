const comboCards = require("./config/comboCards.json");
let cardEffectFactory = require('./card-effect-factory');
const {range, getTypeText} = require('./utils');

const CardType = {
    EFFECT: 1,
    CHARACTER: 2,
};

const TargetType = {
    ALL_TABLE_CARD: 0,
    MY_TABLE_CARD: 1,
    OTHER_TABLE_CARD: 2,
    ME: 3,
    OTHER: 4,
    ANY: 5,
    MY_TABLE_CARD_FILTER_INCLUDE: 6,
    MY_TABLE_CARD_FILTER_EXCLUDE: 7,
    OTHER_TABLE_CARD_FILTER_INCLUDE: 8,
    OTHER_TABLE_CARD_FILTER_EXCLUDE: 9,
    ALL_TABLE_CARD_FILTER_INCLUDE: 10,
    ALL_TABLE_CARD_FILTER_EXCLUDE: 11
};

const CardPosition = {
    REMAINING_CARDS: 1,
    HANDS: 2,
    TABLE: 3,
    USE_CARDS: 4
};

const AttackType = {
    ATTACK: 1,
    BE_ATTACKED: 2
};

const AttackAnimationType = {
    NORMAL: 1
};

const OutCardAnimationType = {
    NORMAL: 1
};

const GameMode = {
    PVP1: 1,
    PVE1: 2,
    PVE2: 3
};

const BuffType = {
    ADD_HIDE: 1,
    ADD_ATTACK: 2,
    ADD_LIFE: 3,
    ADD_ATTACK_LIFE: 4,
    ADD_STRONG: 5,
    ADD_FULL_OF_ENERGY: 6,
    ADD_DEDICATION: 7,
    RAND_ATTACK: 8,
    RAND_LIFE: 9,
    RAND_COST: 10
};

const characterList = [
    {
        id: 1,
        name: "Web前端"
    },
    {
        id: 2,
        name: "服务端"
    }
];

const characterIdMap = {
    "BASE": 0,
    "WEB_DEVELOPER": 1,
    "SERVER_DEVELOPER": 2
};

const MAX_HAND_CARD_NUMBER = 11;
const MAX_BASE_TABLE_CARD_NUMBER = 6;
const MAX_THINK_TIME_NUMBER = 120;

const CardList = [
    {
        id: 1,
        name: "励志的演说家",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: ``,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: [""]
    },
    {
        id: 2,
        name: "被开除的员工",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `每回合开始生命减少1`,
        attack: 4,
        life: 4,
        attackBase: 4,
        lifeBase: 4,
        type: [""],
        onMyTurnStart: function ({myGameData, thisCard, position}) {
            if (position === CardPosition.TABLE) {
                thisCard.life -= 1;
                if (thisCard.life <= 0) {
                    let hasWife = myGameData.tableCards.some(c => c.name === '被开除员工的妻子');
                    if (hasWife) {
                        thisCard.life = 1;
                    } else {
                        let index = myGameData.tableCards.indexOf(thisCard);
                        myGameData.tableCards.splice(index, 1);
                    }
                }
            }
        }
    },
    {
        id: 3,
        name: "被开除员工的妻子",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: `存在时，则被开除的员工不会自动死亡`,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""]
    },
    {
        id: 4,
        name: "加班完的高级程序员",
        cardType: CardType.CHARACTER,
        cost: 4,
        content: `出场：扣除6点生命`,
        attack: 5,
        life: 8,
        attackBase: 5,
        lifeBase: 8,
        type: [""],
        onStart: function ({thisCard, specialMethod}) {
            thisCard.life -= 6;
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
        }
    },
    {
        id: 5,
        name: "高级程序员",
        cardType: CardType.CHARACTER,
        cost: 7,
        content: ``,
        attack: 7,
        life: 7,
        attackBase: 7,
        lifeBase: 7,
        type: [""]
    },
    {
        id: 6,
        name: "开发助理",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: ``,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""]
    },
    {
        id: 7,
        name: "开发鼓励师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: ``,
        attack: 2,
        life: 2,
        attackBase: 2,
        lifeBase: 2,
        type: [""]
    },
    {
        id: 8,
        name: "丑陋的开发鼓励师",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: `精力充沛`,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""],
        isFullOfEnergy: true
    },
    {
        id: 9,
        name: "男开发鼓励师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `场上存在的女程序员获得+2/+2`,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: [""],
        onStart: function ({myGameData, thisCard}) {
            let hasWomen = false;
            myGameData.tableCards.forEach(c => {
                if (c.type.indexOf("女程序员") !== -1) {
                    hasWomen = true;
                }
            });
            if (hasWomen) {
                thisCard.attack = 3;
                thisCard.life = 4;
            } else {
                thisCard.attack = 1;
                thisCard.life = 2;
            }
        },
        onOtherCardStart: function ({myGameData, thisCard, position}) {
            if (position === CardPosition.TABLE) {
                let hasWomen = false;
                myGameData.tableCards.forEach(c => {
                    if (c.type.indexOf("女程序员") !== -1) {
                        hasWomen = true;
                    }
                });
                if (hasWomen) {
                    thisCard.attack = 3;
                    thisCard.life = 4;
                } else {
                    thisCard.attack = 1;
                    thisCard.life = 2;
                }
            }
        }
    },
    {
        id: 10,
        name: "崇尚敏捷开发的小组长",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `精力充沛`,
        attack: 4,
        life: 4,
        attackBase: 4,
        lifeBase: 4,
        type: [""],
        isFullOfEnergy: true
    },
    {
        id: 11,
        name: "热爱分享的小哥",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: `奉献`,
        attack: 1,
        life: 3,
        attackBase: 1,
        lifeBase: 3,
        type: [""],
        isDedication: true
    },
    {
        id: 12,
        name: "热爱阅读的小哥",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: `坚强`,
        attack: 3,
        life: 1,
        attackBase: 3,
        lifeBase: 1,
        type: [""],
        isStrong: true
    },
    {
        id: 13,
        name: "没毕业的天才程序员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `每回合结束时，获得+1/+1`,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""],
        onMyTurnEnd: function ({thisCard, specialMethod, position}) {
            if (position === CardPosition.TABLE) {
                thisCard.attack += 1;
                thisCard.life += 1;
                specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
            }
        }
    },
    {
        id: 14,
        name: "IDE大师",
        cardType: CardType.CHARACTER,
        cost: 7,
        content: `出场：场上所有人员获得+1/+1`,
        attack: 6,
        life: 4,
        attackBase: 6,
        lifeBase: 4,
        type: [""],
        onStart: function ({myGameData, specialMethod, thisCard}) {
            myGameData.tableCards.forEach((c, i) => {
                c.attack += 1;
                c.life += 1;
                specialMethod.buffCardAnimation(true, -1, i, thisCard, c)
            })
        }
    },
    {
        id: 15,
        name: "女程序员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: ``,
        attack: 2,
        life: 2,
        attackBase: 2,
        lifeBase: 2,
        type: ["女程序员"],
    },
    {
        id: 16,
        name: "断点调试",
        cardType: CardType.EFFECT,
        cost: 3,
        content: `指定一个己方召唤物本回合（当前操作回合）不受伤害`,
        type: ["效果卡"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function ({chooseCard, toIndex, thisCard, specialMethod}) {
            chooseCard.isShortInvincible = true;
            chooseCard.shortInvincibleRound = 1;
            specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard)
        }
    },
    {
        id: 17,
        name: "热重启",
        cardType: CardType.EFFECT,
        cost: 3,
        content: `指定一个己方召唤物本回合再次变为未行动状态`,
        type: ["效果卡"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function ({chooseCard, thisCard, toIndex, specialMethod}) {
            chooseCard.isActionable = true;
            specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard)
        }
    },
    {
        id: 18,
        name: "态度傲慢的程序员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: ``,
        attack: 3,
        life: 1,
        attackBase: 3,
        lifeBase: 1,
        type: [""]
    },
    {
        id: 19,
        name: "态度傲慢的技术组长",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: ``,
        attack: 5,
        life: 1,
        attackBase: 5,
        lifeBase: 1,
        type: [""]
    },
    {
        id: 20,
        name: "比尔盖茨",
        cardType: CardType.CHARACTER,
        cost: 6,
        content: `召唤一个会自动升级的windows`,
        attack: 3,
        life: 5,
        attackBase: 3,
        lifeBase: 5,
        type: [""],
        onStart: function ({myGameData, specialMethod}) {
            let card = {
                k: specialMethod.getGameCardKForMe(),
                id: '20-1',
                name: "windows 1",
                cardType: CardType.CHARACTER,
                cost: 1,
                content: `每回合结束的时候，如果没有死亡，则自动升级到下个版本`,
                attack: 2,
                life: 2,
                attackBase: 2,
                lifeBase: 2,
                type: [""],
                onMyTurnEnd: function ({thisCard, position}) {
                    if (position === CardPosition.TABLE && thisCard.life > 0) {
                        switch (thisCard.name) {
                            case "windows 1":
                                thisCard.attack = 3;
                                thisCard.life = 3;
                                thisCard.name = "windows 95";
                                break;
                            case "windows 95":
                                thisCard.attack = 4;
                                thisCard.life = 4;
                                thisCard.name = "windows 98";
                                break;
                            case "windows 98":
                                thisCard.attack = 5;
                                thisCard.life = 5;
                                thisCard.name = "windows xp";
                                break;
                            case "windows xp":
                                thisCard.attack = 6;
                                thisCard.life = 6;
                                thisCard.name = "windows 7";
                                break;
                            case "windows 7":
                                thisCard.attack = 7;
                                thisCard.life = 7;
                                thisCard.name = "windows 8";
                                break;
                            case "windows 8":
                                thisCard.attack = 8;
                                thisCard.life = 8;
                                thisCard.name = "windows 10";
                                break;
                        }
                        specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
                    }

                }
            };
            myGameData.tableCards.push(card);
            specialMethod.outCardAnimation(true, card);
        }
    },
    {
        id: 21,
        name: "马克·扎克伯格",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `出场：随机夺取对方一个场上单位的使用权`,
        attack: 3,
        life: 3,
        attackBase: 3,
        lifeBase: 3,
        type: [""],
        onStart: function ({myGameData, otherGameData, specialMethod}) {
            if (otherGameData.tableCards.length !== 0) {
                let randomIndex = Math.floor(specialMethod.rand() * otherGameData.tableCards.length);
                let card = otherGameData.tableCards.splice(randomIndex, 1)[0];
                myGameData.tableCards.push(card);
                specialMethod.outCardAnimation(true, card);
                specialMethod.refreshGameData();
            }
        }
    },
    {
        id: 22,
        name: "电脑小白",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: ``,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: [""]
    },
    {
        id: 23,
        name: "计算机导论老师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：抽一张牌`,
        attack: 2,
        life: 1,
        attackBase: 2,
        lifeBase: 1,
        type: [""],
        onStart: function ({myGameData, specialMethod}) {
            let card = specialMethod.getNextCardForMe(1)[0];
            myGameData.cards.push(card);
            specialMethod.getCardAnimation(true, card);
        }
    },
    {
        id: 24,
        name: "数据结构老师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `退场：抽一张牌`,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: [""],
        onEnd: function ({myGameData, specialMethod}) {
            let card = specialMethod.getNextCardForMe(1)[0];
            myGameData.cards.push(card);
            specialMethod.getCardAnimation(true, card);
        }
    },
    {
        id: 25,
        name: "算法老师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：双方抽一张牌`,
        attack: 2,
        life: 2,
        attackBase: 2,
        lifeBase: 2,
        type: [""],
        onStart: function ({myGameData, otherGameData, specialMethod}) {
            let myCard = specialMethod.getNextCardForMe(1)[0];
            let otherCard = specialMethod.getNextCardForOther(1)[0];
            myGameData.cards.push(myCard);
            otherGameData.cards.push(otherCard);
            specialMethod.getCardAnimation(true, myCard);
            specialMethod.getCardAnimation(false, otherCard);
        }
    },
    {
        id: 26,
        name: "《算法导论》",
        cardType: CardType.EFFECT,
        cost: 5,
        content: `选择我方一张卡牌，攻击力+4`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: [""],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function ({chooseCard, toIndex, thisCard, specialMethod}) {
            chooseCard.attack += 4;
            specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard)
        }
    },
    {
        id: 27,
        name: "鹅厂小马哥",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `出场：复制对面所有手牌到自己的卡组中`,
        attack: 3,
        life: 4,
        attackBase: 3,
        lifeBase: 4,
        type: [""],
        onStart: function ({myGameData, otherGameData, specialMethod}) {
            let copyCards = otherGameData.cards.map(c => Object.assign({
                k: specialMethod.getGameCardKForMe()
            }, c));

            copyCards.forEach(c => {
                myGameData['remainingCards'].push(c)
            });
        }
    },
    {
        id: 28,
        name: "马爸爸",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `出场：双方费用直接升到10点`,
        attack: 5,
        life: 6,
        attackBase: 5,
        lifeBase: 6,
        type: [""],
        onStart: function ({myGameData, otherGameData}) {
            myGameData.maxFee = 10;
            myGameData.fee = 10;
            otherGameData.maxFee = 10;
            otherGameData.fee = 10;
        }
    },
    {
        id: 29,
        name: "度厂李帅",
        cardType: CardType.CHARACTER,
        cost: 7,
        content: `出场：随机搜索出卡组中的3张卡牌并召唤`,
        attack: 4,
        life: 5,
        attackBase: 4,
        lifeBase: 5,
        type: [""],
        onStart: function ({myGameData, specialMethod}) {
            let cards = specialMethod.getFilterCardTypeRandomCardForMe(3, CardType.CHARACTER);
            cards.forEach(card => {
                myGameData.tableCards.push(card);
                specialMethod.outCardAnimation(true, card);
            })
        }
    },
    {
        id: 30,
        name: "颈椎病",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `对场上所有对方卡牌造成1点伤害`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: [""],
        onStart: cardEffectFactory.allOtherCardDamage(1)
    }
];

const WebCards = [
    {
        id: "w1",
        name: "前端应届毕业生",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: `精力充沛`,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: ["前端", "程序员"],
        isFullOfEnergy: true
    },
    {
        id: "w2",
        name: "时尚的前端小哥",
        cardType: CardType.CHARACTER,
        cost: 4,
        content: `出场：为一个伙伴增加3点攻击`,
        attack: 3,
        life: 3,
        attackBase: 3,
        lifeBase: 3,
        type: ["前端", "程序员"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: cardEffectFactory.oneChooseCardAddAttack(3)
    },
    {
        id: "w3",
        name: "前端组组长",
        cardType: CardType.CHARACTER,
        cost: 6,
        content: `出场：己方场上每存在一个${getTypeText("前端")}人员，攻击力+1`,
        attack: 3,
        life: 4,
        attackBase: 3,
        lifeBase: 4,
        type: ["前端", "程序员"],
        onStart: cardEffectFactory.haveTypeAddAttack("前端", 1)
    },
    {
        id: "w4",
        name: "精通算法的前端人员",
        cardType: CardType.CHARACTER,
        cost: 4,
        content: ``,
        attack: 6,
        life: 2,
        attackBase: 6,
        lifeBase: 2,
        type: ["前端", "程序员"]
    },
    {
        id: "w5",
        name: "精通设计的前端人员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：为一个伙伴增加1点攻击`,
        attack: 3,
        life: 3,
        attackBase: 3,
        lifeBase: 3,
        type: ["前端", "程序员"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: cardEffectFactory.oneChooseCardAddAttack(1)
    },
    {
        id: "w6",
        name: "做菜好吃的前端人员",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `所有伙伴每开始回合回复1点血量`,
        attack: 3,
        life: 3,
        attackBase: 3,
        lifeBase: 3,
        type: ["前端", "程序员"],
        onMyTurnStart: function ({myGameData, position, specialMethod}) {
            if (position === CardPosition.TABLE) {
                myGameData.tableCards.forEach(c => {
                    c.life += 1;
                });
                // TODO 增加动画
                specialMethod.refreshGameData();
            }
        }
    },
    {
        id: "w7",
        name: "阮大神",
        cardType: CardType.CHARACTER,
        cost: 8,
        content: `出场：带来两个前端应届毕业生`,
        attack: 8,
        life: 8,
        attackBase: 8,
        lifeBase: 8,
        type: ["前端", "程序员"],
        onStart: function ({myGameData, otherGameData, specialMethod}) {
            let c1 = {
                k: specialMethod.getGameCardKForMe(),
                id: 'w7-1',
                name: "前端应届毕业生",
                cardType: CardType.CHARACTER,
                cost: 1,
                content: `精力充沛`,
                attack: 1,
                life: 2,
                attackBase: 1,
                lifeBase: 2,
                type: ["前端", "程序员"],
                isFullOfEnergy: true,
                isActionable: true
            };
            let c2 = {
                k: specialMethod.getGameCardKForMe(),
                id: 'w7-2',
                name: "前端应届毕业生",
                cardType: CardType.CHARACTER,
                cost: 1,
                content: `精力充沛`,
                attack: 1,
                life: 2,
                attackBase: 1,
                lifeBase: 2,
                type: ["前端", "程序员"],
                isFullOfEnergy: true,
                isActionable: true
            };
            myGameData.tableCards.push(c1);
            myGameData.tableCards.push(c2);
            myGameData.tableCards.forEach(c => {
                if (c.onTableCardChange) {
                    c.onTableCardChange(myGameData, otherGameData, c);
                }
            });
            specialMethod.outCardAnimation(true, c1);
            specialMethod.outCardAnimation(true, c2);
        }
    },
    {
        id: "w8",
        name: "Chrome",
        cardType: CardType.CHARACTER,
        cost: 10,
        content: `己方场上每存在一个${getTypeText("前端")}，花费减少1`,
        attack: 6,
        life: 8,
        attackBase: 6,
        lifeBase: 8,
        type: ["前端", "工具"],
        onOtherCardStart: function ({myGameData, thisCard, position}) {
            if (position === CardPosition.HANDS) {
                let subCost = 0;
                myGameData.tableCards.forEach(c => subCost += ((c.type.indexOf("前端") !== -1) ? 1 : 0));
                thisCard.cost = (10 - subCost) < 0 ? 0 : (10 - subCost);
            }
        }
    },
    {
        id: "w9",
        name: "IE6",
        cardType: CardType.CHARACTER,
        cost: 8,
        content: `退出：召唤一个IE7在场上`,
        attack: 3,
        life: 3,
        attackBase: 3,
        lifeBase: 3,
        type: ["前端", "工具"],
        onEnd: function ({myGameData, specialMethod}) {
            let card = {
                k: specialMethod.getGameCardKForMe(),
                id: 'w9-1',
                name: "IE7",
                cardType: CardType.CHARACTER,
                cost: 8,
                content: `退出：召唤一个IE8在场上`,
                attack: 5,
                life: 5,
                attackBase: 5,
                lifeBase: 5,
                type: ["前端", "工具"],
                onEnd: function ({myGameData}) {
                    let card2 = {
                        k: specialMethod.getGameCardKForMe(),
                        id: 'w9-2',
                        name: "IE8",
                        cardType: CardType.CHARACTER,
                        cost: 10,
                        content: `退出：召唤一个IE9在场上`,
                        attack: 5,
                        life: 8,
                        attackBase: 5,
                        lifeBase: 8,
                        type: ["前端", "工具"],
                        onEnd: function ({myGameData}) {
                            let card3 = {
                                k: specialMethod.getGameCardKForMe(),
                                id: 'w9-3',
                                name: "IE9",
                                cardType: CardType.CHARACTER,
                                cost: 10,
                                content: `退出：召唤一个IE10在场上`,
                                attack: 8,
                                life: 8,
                                attackBase: 8,
                                lifeBase: 8,
                                type: ["前端", "工具"],
                                onEnd: function ({myGameData}) {
                                    let card4 = {
                                        k: specialMethod.getGameCardKForMe(),
                                        id: 'w9-4',
                                        name: "IE10",
                                        cardType: CardType.CHARACTER,
                                        cost: 10,
                                        content: `奉献，坚强`,
                                        attack: 8,
                                        life: 8,
                                        attackBase: 8,
                                        lifeBase: 8,
                                        type: ["前端", "工具"],
                                        isStrong: true,
                                        isDedication: true
                                    };
                                    myGameData.tableCards.push(card4);
                                    specialMethod.outCardAnimation(true, card4);
                                }
                            };
                            myGameData.tableCards.push(card3);
                            specialMethod.outCardAnimation(true, card3);
                        }
                    };
                    myGameData.tableCards.push(card2);
                    specialMethod.outCardAnimation(true, card2);
                }
            };
            myGameData.tableCards.push(card);
            specialMethod.outCardAnimation(true, card);
        }
    },
    {
        id: "w10",
        name: "浏览器显示差异",
        cardType: CardType.EFFECT,
        cost: 5,
        content: `对场上所有的对方卡片造成3点伤害`,
        attack: '',
        life: '',
        attackBase: '',
        lifeBase: '',
        type: ["效果卡"],
        onStart: cardEffectFactory.allOtherCardDamage(2)
    },
    {
        id: "w11",
        name: "《ECMAScript 6入门》",
        cardType: CardType.EFFECT,
        cost: 4,
        content: `使场上的所有伙伴获得+1/+1，如果是${getTypeText("前端")}则获得+2/+2`,
        attack: '',
        life: '',
        attackBase: '',
        lifeBase: '',
        type: ["效果卡"],
        onStart: function ({myGameData, specialMethod, thisCard}) {
            myGameData.tableCards.forEach(chooseCard => {
                if (!chooseCard.buffList) {
                    chooseCard.buffList = [];
                }

                if (chooseCard.type.indexOf("前端") === -1) {
                    chooseCard.attack += 1;
                    chooseCard.life += 1;

                    chooseCard.buffList.append({
                        type: BuffType.ADD_ATTACK_LIFE,
                        value: [1, 1],
                        from: thisCard
                    });
                } else {
                    chooseCard.attack += 2;
                    chooseCard.life += 2;

                    chooseCard.buffList.append({
                        type: BuffType.ADD_ATTACK_LIFE,
                        value: [1, 1],
                        from: thisCard
                    });
                }
            });

            specialMethod.refreshGameData();
        }
    },
    {
        id: "w12",
        name: "span标签",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: ``,
        attack: 3,
        life: 2,
        attackBase: 3,
        lifeBase: 2,
        type: ["前端", "标签"]
    },
    {
        id: "w13",
        name: "p标签",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: ``,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: ["前端", "标签"]
    },
    {
        id: "w14",
        name: "div标签",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `奉献`,
        attack: 2,
        life: 4,
        attackBase: 2,
        lifeBase: 4,
        type: ["前端", "标签"],
        isDedication: true
    },
    {
        id: "w15",
        name: "宽高样式",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `使一个伙伴获得+1/+1，如果是${getTypeText("标签")}则获得+2/+2`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function({chooseCard, specialMethod, thisCard}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            if (chooseCard.type.indexOf("标签") === -1) {
                chooseCard.attack += 1;
                chooseCard.life += 1;

                chooseCard.buffList.append({
                    type: BuffType.ADD_ATTACK_LIFE,
                    value: [1, 1],
                    from: thisCard
                });
            } else {
                chooseCard.attack += 2;
                chooseCard.life += 2;

                chooseCard.buffList.append({
                    type: BuffType.ADD_ATTACK_LIFE,
                    value: [2, 2],
                    from: thisCard
                });
            }
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard);
        }
    },
    {
        id: "w16",
        name: "阴影样式",
        cardType: CardType.EFFECT,
        cost: 6,
        content: `为一个伙伴增加生命值4点，并且附加奉献，如果是${getTypeText("标签")}，获得8点生命`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function({chooseCard, specialMethod, thisCard}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            if (chooseCard.type.indexOf("标签") === -1) {
                chooseCard.life += 4;
                chooseCard.buffList.append({
                    type: BuffType.ADD_LIFE,
                    value: 4,
                    from: thisCard
                });
            } else {
                chooseCard.life += 8;
                chooseCard.buffList.append({
                    type: BuffType.ADD_LIFE,
                    value: 8,
                    from: thisCard
                });
            }
            chooseCard.isDedication = true;
            chooseCard.buffList.append({
                type: BuffType.ADD_DEDICATION,
                from: thisCard
            });
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard);
        }
    },
    {
        id: "w17",
        name: "圆角样式",
        cardType: CardType.EFFECT,
        cost: 3,
        content: `为一个伙伴增加生命值3点，如果是${getTypeText("标签")}则增加6点`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function({chooseCard, specialMethod, thisCard}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            if (chooseCard.type.indexOf("标签") === -1) {
                chooseCard.life += 3;
                chooseCard.buffList.append({
                    type: BuffType.ADD_LIFE,
                    value: 3,
                    from: thisCard
                });
            } else {
                chooseCard.life += 6;
                chooseCard.buffList.append({
                    type: BuffType.ADD_LIFE,
                    value: 6,
                    from: thisCard
                });
            }
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard);
        }
    },
    {
        id: "w18",
        name: "a标签",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: `奉献，可通过css美化`,
        attack: 0,
        life: 3,
        attackBase: 0,
        lifeBase: 3,
        type: ["前端", "标签"],
        isDedication: true
    },
    {
        id: "w19",
        name: "background样式",
        cardType: CardType.EFFECT,
        cost: 1,
        content: `为${getTypeText("标签")}加上背景，三个背景中选择一个（坚强，奉献，精力充沛）`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD_FILTER_INCLUDE,
        filter: ["标签"],
        isNeedToChoose: true,
        chooseList: [
            [
                {
                    name: "坚强",
                    content: `为${getTypeText("标签")}加上坚强背景`
                },
                {
                    name: "奉献",
                    content: `为${getTypeText("标签")}加上奉献背景`
                },
                {
                    name: "精力充沛",
                    content: `为${getTypeText("标签")}加上精力充沛背景`
                },
            ]
        ],
        onChooseTarget: function ({chooseCard, effectIndex, thisCard, toIndex, specialMethod}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            let chooseEffectIndex = effectIndex[0];
            switch (chooseEffectIndex) {
                case 0:
                    chooseCard.isStrong = true;
                    chooseCard.buffList.append({
                        type: BuffType.ADD_STRONG,
                        from: thisCard
                    });
                    break;
                case 1:
                    chooseCard.isDedication = true;
                    chooseCard.buffList.append({
                        type: BuffType.ADD_DEDICATION,
                        from: thisCard
                    });
                    break;
                case 2:
                    chooseCard.isFullOfEnergy = true;
                    chooseCard.buffList.append({
                        type: BuffType.ADD_FULL_OF_ENERGY,
                        from: thisCard
                    });
                    break;
            }
            specialMethod.buffCardAnimation(true, -1, toIndex, thisCard, chooseCard)
        }
    },
    {
        id: "w20",
        name: "边框样式",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `为伙伴增加生命值2点，如果是${getTypeText("标签")}则增加4点生命值`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function({chooseCard, specialMethod, thisCard}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            if (chooseCard.type.indexOf("标签") === -1) {
                chooseCard.life += 2;
                chooseCard.buffList.push({
                    type: BuffType.ADD_LIFE,
                    value: 2,
                    from: thisCard
                })
            } else {
                chooseCard.life += 4;
                chooseCard.buffList.push({
                    type: BuffType.ADD_LIFE,
                    value: 4,
                    from: thisCard
                })
            }
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard);
        }
    },
    {
        id: "w21",
        name: "字体样式",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `为伙伴增加攻击2点，如果是${getTypeText("标签")}则增加4点攻击`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function({chooseCard, specialMethod, thisCard}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            if (chooseCard.type.indexOf("标签") === -1) {
                chooseCard.attack += 2;
                chooseCard.buffList.push({
                    type: BuffType.ADD_ATTACK,
                    value: 2,
                    from: thisCard
                })
            } else {
                chooseCard.attack += 4;
                chooseCard.buffList.push({
                    type: BuffType.ADD_ATTACK,
                    value: 4,
                    from: thisCard
                })
            }
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard);
        }
    },
    {
        id: "w22",
        name: "不可见样式",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `为伙伴增加潜行效果，如果是${getTypeText("标签")}则附加 +1/+1`,
        type: ["样式"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function ({chooseCard, specialMethod, thisCard}) {
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }

            chooseCard.buffList.push({
                type: BuffType.ADD_HIDE,
                from: thisCard
            });

            chooseCard.isHide = true;

            if (chooseCard.type.indexOf("标签") !== -1) {
                chooseCard.attack += 1;
                chooseCard.life += 1;

                chooseCard.buffList.push({
                    type: BuffType.ADD_ATTACK_LIFE,
                    value: [1, 1],
                    from: thisCard
                })
            }

            specialMethod.buffCardAnimation(true, -1, -1, thisCard, chooseCard);
        }
    },
    {
        id: "w23",
        name: "复制dom",
        cardType: CardType.EFFECT,
        cost: 3,
        content: `复制一个伙伴，如果是${getTypeText("标签")}则保留所有的强化`,
        type: ["脚本"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        onChooseTarget: function ({myGameData, chooseCard, specialMethod}) {
            if (chooseCard.type.indexOf("标签") !== -1) {
                let c = Object.assign({ k: specialMethod.getGameCardKForMe() }, CardMap[chooseCard.id]);
                if (c.buffList) {
                    c.buffList.forEach(buff => {
                        switch(buff.type) {
                            case BuffType.ADD_ATTACK:
                                c.attack += buff.value;
                                break;
                            case BuffType.ADD_LIFE:
                                c.life += buff.value;
                                break;
                            case BuffType.ADD_ATTACK_LIFE:
                                c.attack += buff.value[0];
                                c.life += buff.value[1];
                                break;
                            case BuffType.ADD_HIDE:
                                c.isHide = true;
                                break;
                            case BuffType.ADD_DEDICATION:
                                c.isDedication = true;
                                break;
                            case BuffType.ADD_STRONG:
                                c.isStrong = true;
                                break;
                            case BuffType.ADD_FULL_OF_ENERGY:
                                c.isFullOfEnergy = true;
                                c.isActionable = true;
                                break;
                        }
                    });
                }
                myGameData.tableCards.push(c);
                specialMethod.outCardAnimation(true, c);
            } else {
                let c = Object.assign({ k: specialMethod.getGameCardKForMe() }, CardMap[chooseCard.id]);
                myGameData.tableCards.push(c);
                specialMethod.outCardAnimation(true, c);
            }
        }
    },
    {
        id: "w24",
        name: "清空dom",
        cardType: CardType.EFFECT,
        cost: 6,
        content: `消灭己方的一个${getTypeText("标签")}，对双方桌面上所有卡牌造成等同于卡牌攻击的伤害`,
        type: ["脚本"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD_FILTER_INCLUDE,
        filter: ["标签"],
        onChooseTarget: function ({myGameData, otherGameData, chooseCard}) {
            let attack = chooseCard.attack;

            myGameData.tableCards.forEach(c => {
                c.life -= attack;
            });

            otherGameData.tableCards.forEach(c => {
                c.life -= attack;
            });
            chooseCard.life = 0;

            specialMethod.refreshGameData();
        }
    },
    {
        id: "w25",
        name: "批量复制dom",
        cardType: CardType.EFFECT,
        cost: 5,
        content: `复制两个伙伴，如果是${getTypeText("标签")}则保留所有的强化`,
        type: ["脚本"],
        isTarget: true,
        targetType: TargetType.MY_TABLE_CARD,
        filter: ["标签"],
        onChooseTarget: function ({myGameData, chooseCard, specialMethod}) {
            if (chooseCard.type.indexOf("标签") !== -1) {
                let c = Object.assign({ k: specialMethod.getGameCardKForMe() }, CardMap[chooseCard.id]);
                if (c.buffList) {
                    c.buffList.forEach(buff => {
                        switch(buff.type) {
                            case BuffType.ADD_ATTACK:
                                c.attack += buff.value;
                                break;
                            case BuffType.ADD_LIFE:
                                c.life += buff.value;
                                break;
                            case BuffType.ADD_ATTACK_LIFE:
                                c.attack += buff.value[0];
                                c.life += buff.value[1];
                                break;
                            case BuffType.ADD_HIDE:
                                c.isHide = true;
                                break;
                            case BuffType.ADD_DEDICATION:
                                c.isDedication = true;
                                break;
                            case BuffType.ADD_STRONG:
                                c.isStrong = true;
                                break;
                            case BuffType.ADD_FULL_OF_ENERGY:
                                c.isFullOfEnergy = true;
                                c.isActionable = true;
                                break;
                        }
                    });
                }
                myGameData.tableCards.push(c);
                specialMethod.outCardAnimation(true, c);

                let d = Object.assign({k: specialMethod.getGameCardKForMe()}, c);
                myGameData.tableCards.push(d);
                specialMethod.outCardAnimation(true, d);
            } else {
                let c = Object.assign({ k: specialMethod.getGameCardKForMe() }, CardMap[chooseCard.id]);
                let d = Object.assign({ k: specialMethod.getGameCardKForMe() }, CardMap[chooseCard.id]);
                myGameData.tableCards.push(c);
                specialMethod.outCardAnimation(true, c);
                myGameData.tableCards.push(d);
                specialMethod.outCardAnimation(true, d);
            }
        }
    },
];

const ServerCards = [
    {
        id: "s1",
        name: "SQL Lite",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: `奉献`,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: ["数据库"],
        isDedication: true
    },
    {
        id: "s2",
        name: "高并发",
        cardType: CardType.EFFECT,
        cost: 3,
        content: `本回合再增加一个可用费用`,
        attack: '',
        life: '',
        attackBase: '',
        lifeBase: '',
        type: ["效果卡"],
        onStart: function({myGameData}) {
            if (myGameData.maxFee < 10) {
                myGameData.maxFee += 1;
            }
            myGameData.fee += 1;
        }
    },
    {
        id: "s3",
        name: "启用微服务",
        cardType: CardType.EFFECT,
        cost: 3,
        content: `召唤3个1/1且带有精力充沛的基础服务`,
        attack: '',
        life: '',
        attackBase: '',
        lifeBase: '',
        type: ["效果卡"],
        onStart: function({myGameData, specialMethod}) {
            for(let i = 1; i < 4; i++) {
                let card = {
                    k: specialMethod.getGameCardKForMe(),
                    id: "s3-" + i,
                    name: "基础微服务",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: `精力充沛`,
                    attack: 1,
                    life: 1,
                    attackBase: 1,
                    lifeBase: 1,
                    type: [""],
                    isFullOfEnergy: true,
                    isActionable: true
                };
                myGameData.tableCards.push(card);
                specialMethod.outCardAnimation(true, card);
            }
        }
    },
    {
        id: "s4",
        name: "MySQL",
        cardType: CardType.CHARACTER,
        cost: 7,
        content: `奉献`,
        attack: 1,
        life: 6,
        attackBase: 1,
        lifeBase: 6,
        type: ["数据库"],
        isDedication: true
    },
    {
        id: "s5",
        name: "SQL入门程序员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：如果场上有数据库，从卡组中抽一张卡`,
        attack: 1,
        life: 2,
        attackBase: 1,
        lifeBase: 2,
        type: ["服务端"],
        onStart: function({myGameData, specialMethod}) {
            if (myGameData.tableCards.some(c => c.type.indexOf("数据库") !== -1)) {
                specialMethod.getRandomCardForMe(1).forEach(c => {
                    myGameData.cards.push(c);
                    specialMethod.getCardAnimation(true, c);
                })
            }
        }
    },
    {
        id: "s6",
        name: "精通数据库的程序员",
        cardType: CardType.CHARACTER,
        cost: 4,
        content: `出场：场上每有一个数据库，从卡组中抽一张牌`,
        attack: 2,
        life: 3,
        attackBase: 2,
        lifeBase: 3,
        type: ["服务端"],
        onStart: function({myGameData, specialMethod}) {
            let databaseCount =  myGameData.tableCards.filter(c => c.type.indexOf("数据库") !== -1).length;

            specialMethod.getRandomCardForMe(databaseCount).forEach(c => {
                myGameData.cards.push(c);
                specialMethod.getCardAnimation(true, c);
            })
        }
    },
    {
        id: "s7",
        name: "热爱开源的服务端程序员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: ``,
        attack: 1,
        life: 3,
        attackBase: 1,
        lifeBase: 3,
        type: ["服务端"]
    },
    {
        id: "s8",
        name: "服务端应届毕业生",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: ``,
        attack: 1,
        life: 1,
        attackBase: 1,
        lifeBase: 1,
        type: ["服务端"]
    },
    {
        id: "s9",
        name: "Oracle",
        cardType: CardType.CHARACTER,
        cost: 16,
        content: `奉献`,
        attack: 8,
        life: 12,
        attackBase: 8,
        lifeBase: 12,
        type: ["数据库"],
        isDedication: true
    },
    {
        id: "s10",
        name: "邪恶的后端程序员",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `出场：场上每有一个数据库，从对方的卡组中抽一张牌`,
        attack: 2,
        life: 3,
        attackBase: 2,
        lifeBase: 3,
        type: ["服务端"],
        onStart: function({myGameData, specialMethod}) {
            let databaseCount =  myGameData.tableCards.filter(c => c.type.indexOf("数据库") !== -1).length;

            specialMethod.getRandomCardForOther(databaseCount).forEach(c => {
                c.k = specialMethod.getGameCardKForMe();
                myGameData.cards.push(c);
                specialMethod.getCardAnimation(true, c);
            })
        }
    },
    {
        id: "s11",
        name: "无私奉献的后端程序员",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `奉献，出场：场上每有一个数据库，获得1点生命`,
        attack: 1,
        life: 3,
        attackBase: 1,
        lifeBase: 3,
        isDedication: true,
        type: ["服务端"],
        onStart: function({myGameData, thisCard, specialMethod}) {
            thisCard.life += myGameData.tableCards.filter(c => c.type.indexOf("数据库") !== -1).length;
            specialMethod.buffCardAnimation(true, -1, -1, thisCard, thisCard)
        }
    },
    {
        id: "s12",
        name: "Hibernate",
        cardType: CardType.EFFECT,
        cost: 6,
        content: `手中数据库牌费用减少3点`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData}) {
            myGameData.cards.forEach(c => {
                if (c.type.indexOf("数据库") !== -1) {
                    c.cost -= 3
                }
            })
        }
    },
    {
        id: "s13",
        name: "SQL Server",
        cardType: CardType.CHARACTER,
        cost: 9,
        content: `奉献`,
        attack: 1,
        life: 10,
        attackBase: 1,
        lifeBase: 10,
        type: ["数据库"],
        isDedication: true
    },
    {
        id: "s14",
        name: "经验丰富的架构师",
        cardType: CardType.CHARACTER,
        cost: 6,
        content: `出场：场上每有一个数据库，和对方交换一张手牌（不会重复）`,
        attack: 4,
        life: 4,
        attackBase: 4,
        lifeBase: 4,
        type: ["服务端"],
        onStart: function({myGameData, otherGameData, specialMethod}) {
            let databaseCount =  myGameData.tableCards.filter(c => c.type.indexOf("数据库") !== -1).length;

            let maxChangeCount = Math.max(databaseCount, myGameData.cards.length, otherGameData.cards.length);
            let myCardsIndexRange = range(myGameData.cards.length);
            let otherCardsIndexRange = range(otherGameData.cards.length);

            let myChangeIndexList = [];
            let otherChangeIndexList = [];

            for (let i = 0; i < maxChangeCount; i++) {
                let myCutIndex = myCardsIndexRange.splice(Math.floor(specialMethod.rand() * myCardsIndexRange.length), 1)[0];
                let otherCutIndex = otherCardsIndexRange.splice(Math.floor(specialMethod.rand() * otherCardsIndexRange.length), 1)[0];

                myChangeIndexList.push(myCutIndex);
                otherChangeIndexList.push(otherCutIndex);
            }

            for (let i = 0; i < maxChangeCount; i++) {
                let myCutIndex = myChangeIndexList[i];
                let otherCutIndex = otherChangeIndexList[i];

                let myCutItem = myGameData.cards.splice(myCutIndex, 1)[0];
                let otherCutItem = otherGameData.cards.splice(otherCutIndex, 1)[0];

                otherGameData.cards.splice(otherCutIndex, 0, myCutItem);
                myGameData.cards.splice(myCutIndex, 0, otherCutItem);
            }
        }
    },
    {
        id: "s15",
        name: "天才架构师",
        cardType: CardType.CHARACTER,
        cost: 4,
        content: `出场：场上每有一个数据库，和对方交换一张手牌（可能重复）`,
        attack: 2,
        life: 4,
        attackBase: 2,
        lifeBase: 4,
        type: ["服务端"],
        onStart: function({myGameData, otherGameData, specialMethod}) {
            let databaseCount =  myGameData.tableCards.filter(c => c.type.indexOf("数据库") !== -1).length;

            let maxChangeCount = Math.max(databaseCount, myGameData.cards.length, otherGameData.cards.length);

            for (let i = 0; i < maxChangeCount; i++) {
                let myCutIndex = Math.floor(specialMethod.rand() * myGameData.cards.length);
                let otherCutIndex = Math.floor(specialMethod.rand() * otherGameData.cards.length);

                let myCutItem = myGameData.cards.splice(myCutIndex, 1)[0];
                myCutItem.k = specialMethod.getGameCardKForOther();
                let otherCutItem = otherGameData.cards.splice(otherCutIndex, 1)[0];
                otherCutItem.k = specialMethod.getGameCardKForMe();

                otherGameData.cards.splice(otherCutIndex, 0, myCutItem);
                myGameData.cards.splice(myCutIndex, 0, otherCutItem);
            }
        }
    },
    {
        id: "s16",
        name: "老迈的架构师",
        cardType: CardType.CHARACTER,
        cost: 4,
        content: `出场：和对方交换一张手牌（可能重复）`,
        attack: 2,
        life: 4,
        attackBase: 2,
        lifeBase: 4,
        type: ["服务端"],
        onStart: function({myGameData, otherGameData, specialMethod}) {
            if (myGameData.cards.length >= 1 && otherGameData.cards.length >= 1) {
                let myCutIndex = Math.floor(specialMethod.rand() * myGameData.cards.length);
                let otherCutIndex = Math.floor(specialMethod.rand() * otherGameData.cards.length);

                let myCutItem = myGameData.cards.splice(myCutIndex, 1)[0];
                myCutItem.k = specialMethod.getGameCardKForOther();
                let otherCutItem = otherGameData.cards.splice(otherCutIndex, 1)[0];
                otherCutItem.k = specialMethod.getGameCardKForMe();

                otherGameData.cards.splice(otherCutIndex, 0, myCutItem);
                myGameData.cards.splice(myCutIndex, 0, otherCutItem);
            }
        }
    },
    {
        id: "s17",
        name: "推送技术研究员",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: ``,
        attack: 2,
        life: 1,
        attackBase: 2,
        lifeBase: 1,
        type: ["服务端"]
    },
    {
        id: "s18",
        name: "JDBC",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `出场：手中数据库牌费用减少1点`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData}) {
            myGameData.cards.forEach(c => {
                if (c.type.indexOf("数据库") !== -1) {
                    c.cost -= 1
                }
            })
        }
    },
    {
        id: "s19",
        name: "MyBatis",
        cardType: CardType.EFFECT,
        cost: 4,
        content: `出场：手中数据库牌费用减少2点`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData}) {
            myGameData.cards.forEach(c => {
                if (c.type.indexOf("数据库") !== -1) {
                    c.cost -= 2
                }
            })
        }
    },
    {
        id: "s20",
        name: "安装数据库",
        cardType: CardType.EFFECT,
        cost: 1,
        content: `从剩余牌中抽出一张数据库卡牌到手牌中`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData, specialMethod}) {
            let indexList = [];
            myGameData.remainingCards.forEach((c, index) => {
                if (c.type.indexOf("数据库") !== -1) {
                    indexList.push(index)
                }
            });
            if (indexList.length !== 0) {
                let chooseIndex = indexList[Math.floor(specialMethod.rand() * indexList.length)];
                let card = myGameData.remainingCards.splice(chooseIndex, 1)[0];
                myGameData.cards.push(card);
                specialMethod.getCardAnimation(true, card);
            }
        }
    },
    {
        id: "s21",
        name: "Spring",
        cardType: CardType.CHARACTER,
        cost: 6,
        content: `每回合开始产生一个Spring产品，随机作用在场上`,
        attack: 3,
        life: 4,
        attackBase: 3,
        lifeBase: 4,
        type: [""],
        onMyTurnStart: function({myGameData, specialMethod, thisCard, position}) {
            // TODO 有待改进
            if (myGameData.tableCards.length !== 0 && position === CardPosition.TABLE) {
                let randomIndex = Math.floor(specialMethod.rand() * 3);
                let randomCard = myGameData.tableCards[Math.floor(specialMethod.rand() * myGameData.tableCards.length)];

                switch (randomIndex) {
                    case 0:
                        randomCard.attack += 2;
                        randomCard.life += 2;
                        break;
                    case 1:
                        randomCard.isStrong = true;
                        break;
                    case 2:
                        randomCard.isDedication = true;
                        break;
                }
                specialMethod.buffCardAnimation(true, -1, -1, thisCard, randomCard)
            }
        }
    },
    {
        id: "s22",
        name: "大并发架构师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：获得一个用过的费用`,
        attack: 2,
        life: 3,
        attackBase: 2,
        lifeBase: 3,
        type: ["服务端"],
        onStart: function({myGameData}) {
            if (myGameData.maxFee < 10) {
                myGameData.maxFee += 1
            }
        }
    },
    {
        id: "s23",
        name: "小型系统后台人员",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: ``,
        attack: 2,
        life: 4,
        attackBase: 2,
        lifeBase: 4,
        type: ["服务端"]
    },
    {
        id: "s24",
        name: "Flask",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `精力充沛`,
        attack: 4,
        life: 1,
        attackBase: 4,
        lifeBase: 1,
        type: [""],
        isFullOfEnergy: true
    },
    {
        id: "s25",
        name: "主从备份",
        cardType: CardType.EFFECT,
        cost: 4,
        content: `场上所有数据库攻击和生命数值调换`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData, specialMethod, thisCard}) {
            myGameData.cards.forEach(c => {
                if (c.type.indexOf("数据库") !== -1) {
                    let attack = c.attack;
                    c.attack = c.life;
                    c.life = attack;
                }
                specialMethod.buffCardAnimation(true, -1, -1, thisCard, c)
            })
        }
    },
];

const TestCards = [
    {
        id: "t1",
        name: "Monkey",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: `在你的回合结束时，随机攻击对方`,
        attack: 4,
        life: 3,
        attackBase: 4,
        lifeBase: 3,
        type: [""],
        onMyTurnEnd({otherGameData, thisCard, thisCardIndex, specialMethod, position}) {
            if (otherGameData.tableCards.length !== 0 && position === CardPosition.TABLE) {
                let rand = Math.floor(specialMethod.rand() * otherGameData.tableCards.length);

                let attackCard = otherGameData.tableCards[rand];

                specialMethod.attackCardAnimation(thisCardIndex, rand, thisCard, attackCard);
            }
        }
    },
    {
        id: "t2",
        name: "Load Runner",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：随机对对方两个随从造成1点伤害`,
        attack: 3,
        life: 4,
        attackBase: 3,
        lifeBase: 4,
        type: ["测试", "工具"],
        onStart: function({otherGameData, specialMethod}) {
            if (otherGameData.tableCards.length <= 2) {
                otherGameData.tableCards.forEach(c => c.life -= 1);
            } else {
                let cardLength = otherGameData.tableCards.length;
                let first = Math.floor(specialMethod.rand() * cardLength);
                let second = Math.floor(specialMethod.rand() * cardLength);
                while (first === second) {
                    second = Math.floor(specialMethod.rand() * cardLength);
                }

                otherGameData.tableCards[first].life -= 1;
                otherGameData.tableCards[second].life -= 1;
            }
        }
    },
    {
        id: "t3",
        name: "Jmeter",
        cardType: CardType.CHARACTER,
        cost: 6,
        content: `随机对对方两个随从2点伤害`,
        attack: 4,
        life: 6,
        attackBase: 4,
        lifeBase: 6,
        type: ["测试", "工具"],
        onStart: function({otherGameData, specialMethod}) {
            if (otherGameData.tableCards.length <= 2) {
                otherGameData.tableCards.forEach(c => c.life -= 2);
            } else {
                let cardLength = otherGameData.tableCards.length;
                let first = Math.floor(specialMethod.rand() * cardLength);
                let second = Math.floor(specialMethod.rand() * cardLength);
                while (first === second) {
                    second = Math.floor(specialMethod.rand() * cardLength);
                }

                otherGameData.tableCards[first].life -= 2;
                otherGameData.tableCards[second].life -= 2;
            }
        }
    },
    {
        id: "t4",
        name: "Selenium",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `出场：随机对对方一个随从造成2点伤害`,
        attack: 2,
        life: 4,
        attackBase: 2,
        lifeBase: 4,
        type: ["测试", "工具"],
        onStart: function({otherGameData, specialMethod}) {
            if (otherGameData.tableCards.length >= 1) {
                let cardLength = otherGameData.tableCards.length;
                let first = Math.floor(specialMethod.rand() * cardLength);
                otherGameData.tableCards[first].life -= 2;
            }
        }
    },
    {
        id: "t5",
        name: "压力测试",
        cardType: CardType.EFFECT,
        cost: 10,
        content: `随机召唤所有职业的3个伙伴`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData, specialMethod}) {
            for (let i = 0; i < 3; i++) {
                let careerIndex = Math.floor(specialMethod.rand() * 4);
                let cardList;
                switch (careerIndex) {
                    case 0:
                        cardList = CardList.filter(c => c.cardType === CardType.CHARACTER);
                        break;
                    case 1:
                        cardList = WebCards.filter(c => c.cardType === CardType.CHARACTER);
                        break;
                    case 2:
                        cardList = ServerCards.filter(c => c.cardType === CardType.CHARACTER);
                        break;
                    case 3:
                        cardList = TestCards.filter(c => c.cardType === CardType.CHARACTER);
                        break;

                }
                let randIndex = Math.floor(specialMethod.rand() * cardList.length);
                let card = Object.assign({k: specialMethod.getGameCardKForMe()}, cardList[randIndex]);
                myGameData.myTableCard.push(card);
                specialMethod.outCardAnimation(true, card);
            }
        }
    },
    {
        id: "t6", // 如果要调整，记得修改测试培训机构里的
        name: "实习测试工程师",
        cardType: CardType.CHARACTER,
        cost: 1,
        content: ``,
        attack: 2,
        life: 2,
        attackBase: 2,
        lifeBase: 2,
        type: ["测试", "程序员"],
        isFullOfEnergy: true
    },
    {
        id: "t7",
        name: "修复bug",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `取消卡牌上所有的效果`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD,
        onChooseTarget: function ({chooseCard}) {
            // TODO 处理buff
            chooseCard.attack = chooseCard.attackBase;
            chooseCard.life = chooseCard.lifeBase;
            chooseCard.isFullOfEnergy = false;
            chooseCard.isDedication = false;
            chooseCard.isHide = false;
            chooseCard.isStrong = false;
            chooseCard.onStart = null;
            chooseCard.onEnd = null;
            chooseCard.onChooseTarget = null;
            chooseCard.onMyTurnStart = null;
            chooseCard.onMyTurnEnd = null;
            chooseCard.onAttack = null;
        }
    },
    {
        id: "t8",
        name: "测试培训机构",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: `每个回合结束，召唤一位实习测试工程师`,
        attack: 0,
        life: 2,
        attackBase: 0,
        lifeBase: 2,
        type: ["测试"],
        onMyTurnEnd({myGameData, specialMethod, position}) {
            if (position === CardPosition.TABLE) {
                let newCard = {
                    k: specialMethod.getGameCardKForMe(),
                    id: "t6",
                    name: "实习测试工程师",
                    cardType: CardType.CHARACTER,
                    cost: 1,
                    content: ``,
                    attack: 2,
                    life: 2,
                    attackBase: 2,
                    lifeBase: 2,
                    type: ["测试", "程序员"],
                };
                myGameData.tableCards.push(newCard);
                specialMethod.outCardAnimation(true, newCard)
            }
        }
    },
    {
        id: "t9",
        name: "攻击力bug",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `更改一个随从的随机攻击力（0-8）`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡", "bug"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD,
        onChooseTarget: function ({thisCard, chooseCard, specialMethod}) {
            chooseCard.attack = Math.floor(specialMethod.rand() * 8);
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }
            chooseCard.buffList.append({
                type: BuffType.RAND_ATTACK,
                from: thisCard
            })
        }
    },
    {
        id: "t10",
        name: "生命值bug",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `更改一个随从的随机生命值（1-10）`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡", "bug"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD,
        onChooseTarget: function ({thisCard, chooseCard, specialMethod}) {
            chooseCard.life = Math.floor(specialMethod.rand() * 9) + 1;
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }
            chooseCard.buffList.append({
                type: BuffType.RAND_LIFE,
                from: thisCard
            })
        }
    },
    {
        id: "t11",
        name: "费用bug",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `更改手牌中随机一张卡的随机费用（0-10）`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡", "bug"],
        onStart: function ({thisCard, myGameData, specialMethod}) {
            let index = Math.floor(specialMethod.rand() * myGameData.cards.length);
            let chooseCard = myGameData.cards[index];
            chooseCard.cost = Math.floor(specialMethod.rand() * 11);
            if (!chooseCard.buffList) {
                chooseCard.buffList = [];
            }
            chooseCard.buffList.append({
                type: BuffType.RAND_COST,
                from: thisCard
            });
            specialMethod.refreshGameData(); // TODO 可以处理下，不用刷新整个游戏
        }
    },
    {
        id: "t12",
        name: "自动化测试",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `重新执行本回合使用的效果卡，对象随机`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function() {
            // TODO 没做
        }
    },
    {
        id: "t13",
        name: "蹩脚的测试脚本",
        cardType: CardType.CHARACTER,
        cost: 2,
        content: ``,
        attack: 3,
        life: 2,
        attackBase: 3,
        lifeBase: 2,
        type: ["测试", "脚本"],
    },
    {
        id: "t14",
        name: "GUI测试工程师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `取消某个卡牌的所有效果`,
        attack: 2,
        life: 3,
        attackBase: 2,
        lifeBase: 3,
        type: ["测试", "程序员"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD,
        onChooseTarget: function ({chooseCard}) {
            chooseCard.attack = chooseCard.attackBase;
            chooseCard.life = chooseCard.lifeBase;
            chooseCard.isFullOfEnergy = false;
            chooseCard.isDedication = false;
            chooseCard.isHide = false;
            chooseCard.isStrong = false;
            chooseCard.onStart = null;
            chooseCard.onEnd = null;
            chooseCard.onChooseTarget = null;
            chooseCard.onMyTurnStart = null;
            chooseCard.onMyTurnEnd = null;
            chooseCard.onAttack = null;
        }
    },
    {
        id: "t15",
        name: "测试报告",
        cardType: CardType.EFFECT,
        cost: 5,
        content: `获取对一个随从身上的所有bug卡牌`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD,
        onChooseTarget: function({chooseCard, myGameData, specialMethod}) {
            chooseCard.buffList.forEach((i) => {
                if (i.from.type.indexOf("bug") !== -1) {
                    let newCard = Object.assign({k: specialMethod.getGameCardKForMe()}, i.from);
                    myGameData.cards.push(newCard);
                    specialMethod.getCardAnimation(true, newCard)
                }
            })
        }
    },
    {
        id: "t16",
        name: "职业bug",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `随机一个职业的随机牌`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡", "bug"],
        onStart: function({myGameData, specialMethod}) {
            let careerIndex = Math.floor(specialMethod.rand() * 4);
            let cardList;
            switch (careerIndex) {
                case 0:
                    cardList = CardList;
                    break;
                case 1:
                    cardList = WebCards;
                    break;
                case 2:
                    cardList = ServerCards;
                    break;
                case 3:
                    cardList = TestCards;
                    break;

            }
            let randIndex = Math.floor(specialMethod.rand() * cardList.length);
            let card = Object.assign({k: specialMethod.getGameCardKForMe()}, cardList[randIndex]);
            myGameData.myTableCard.push(card);
        }
    },
    {
        id: "t17",
        name: "抽卡bug",
        cardType: CardType.EFFECT,
        cost: 7,
        content: `抽取随机张牌（可超过手牌上限）`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡", "bug"],
        onStart: function({myGameData, specialMethod}) {
            let randNumber = Math.floor(9 * specialMethod.rand()) + 1;
            let cards = specialMethod.getNextCardForMe(randNumber);
            cards.forEach(c => {
                let newCard = Object.assign({k: specialMethod.getGameCardKForMe()}, c);
                myGameData.cards.push(newCard);
                specialMethod.getCardAnimation(true, newCard);
            })
        }
    },
    {
        id: "t18",
        name: "线上bug",
        cardType: CardType.EFFECT,
        cost: 5,
        content: `损失自己5点生命，随机替换己方场上所有随从牌`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡", "bug"],
        onStart: function({myGameData, specialMethod}) {
            myGameData.life -= 5;
            specialMethod.checkWin();
            for (let i = 0; i < myGameData.tableCards.length; i++) {
                let careerIndex = Math.floor(specialMethod.rand() * 4);
                let cardList;
                switch (careerIndex) {
                    case 0:
                        cardList = CardList.filter(c => c.cardType === CardType.CHARACTER);
                        break;
                    case 1:
                        cardList = WebCards.filter(c => c.cardType === CardType.CHARACTER);
                        break;
                    case 2:
                        cardList = ServerCards.filter(c => c.cardType === CardType.CHARACTER);
                        break;
                    case 3:
                        cardList = TestCards.filter(c => c.cardType === CardType.CHARACTER);
                        break;

                }
                let randIndex = Math.floor(specialMethod.rand() * cardList.length);
                myGameData.myTableCard[i] = Object.assign({k: specialMethod.getGameCardKForMe()}, cardList[randIndex]);
                specialMethod.refreshGameData();
            }
        }
    },
    {
        id: "t19",
        name: "精英测试工程师",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `随机消灭对方一个伙伴`,
        attack: 3,
        life: 2,
        attackBase: 3,
        lifeBase: 2,
        type: ["测试", "程序员"],
        onStart: function({otherGameData, specialMethod}) {
            if (otherGameData.tableCards.length > 0) {
                let index = Math.floor(specialMethod.rand() * otherGameData.tableCards.length);
                let card = otherGameData.tableCards.splice(index, 1)[0];
                specialMethod.dieCardAnimation(false, [], [card.k]);
            }
        }
    },
    {
        id: "t20",
        name: "重新测试",
        cardType: CardType.EFFECT,
        cost: 5,
        content: `某个随从身上的所有bug重新运行一次`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        isTarget: true,
        targetType: TargetType.ALL_TABLE_CARD,
        onChooseTarget: function({chooseCard, specialMethod}) {
            chooseCard.buffList.forEach(c => {
                if (c.from.type.indexOf("bug") !== -1) {
                    switch (c.type) {
                        case BuffType.RAND_ATTACK:
                            chooseCard.attack = Math.floor(specialMethod.rand() * 8);
                            break;
                        case BuffType.RAND_LIFE:
                            chooseCard.life = Math.floor(specialMethod.rand() * 9) + 1;
                            break;
                    }
                }
            })
        }
    },
    {
        id: "t21",
        name: "数据库校验",
        cardType: CardType.EFFECT,
        cost: 4,
        content: `对所有随从造成1-4点伤害`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData, otherGameData, specialMethod}) {
            myGameData.tableCards.forEach(c => {
                c.life -= Math.floor(specialMethod.rand() * 4) + 1;
            });
            otherGameData.tableCards.forEach(c => {
                c.life -= Math.floor(specialMethod.rand() * 4) + 1;
            });
            specialMethod.refreshGameData();
        }
    },
    {
        id: "t22",
        name: "经验丰富的测试工程师",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `精力充沛。攻击一次，随机获得一张bug卡`,
        attack: 3,
        life: 3,
        attackBase: 3,
        lifeBase: 3,
        type: ["测试", "程序员"],
        isFullOfEnergy: true,
        onAttack: function({myGameData, specialMethod}) {
            let index = Math.floor(specialMethod.rand() * BugCardList.length);
            let newCard = Object.assign({k: specialMethod.getGameCardKForMe()}, BugCardList[index]);
            myGameData.push(newCard);
            specialMethod.getCardAnimation(true, newCard);
        }
    },
    {
        id: "t23",
        name: "性能测试工程师",
        cardType: CardType.CHARACTER,
        cost: 3,
        content: `精力充沛`,
        attack: 3,
        life: 1,
        attackBase: 3,
        lifeBase: 1,
        type: ["测试", "程序员"],
        isFullOfEnergy: true
    },
    {
        id: "t24",
        name: "bug管理",
        cardType: CardType.EFFECT,
        cost: 2,
        content: `获得一张bug卡`,
        attack: "",
        life: "",
        attackBase: "",
        lifeBase: "",
        type: ["效果卡"],
        onStart: function({myGameData, specialMethod}) {
            let index = Math.floor(specialMethod.rand() * BugCardList.length);
            let getCard = Object.assign({k: specialMethod.getGameCardKForMe()}, BugCardList[index]);
            myGameData.cards.push(getCard);
            specialMethod.getCardAnimation(true, getCard);
        }
    },
    {
        id: "t25",
        name: "测试团队",
        cardType: CardType.CHARACTER,
        cost: 5,
        content: `精力充沛，每回合结束随机获得一张bug卡`,
        attack: 1,
        life: 5,
        attackBase: 1,
        lifeBase: 5,
        type: ["测试", "程序员", "团队"],
        isFullOfEnergy: true,
        onMyTurnEnd({myGameData, specialMethod, position}) {
            if (position === CardPosition.TABLE) {
                let index = Math.floor(specialMethod.rand() * BugCardList.length);
                let getCard = Object.assign({k: specialMethod.getGameCardKForMe()}, BugCardList[index]);
                myGameData.cards.push(getCard);
                specialMethod.getCardAnimation(true, getCard);
            }
        }
    },
];
const BugCardList = TestCards.filter(c => c.type.indexOf('bug') !== -1);

const CardMap = {};
CardList.forEach((c) => {
    CardMap[c.id] = c
});
WebCards.forEach((c) => {
    CardMap[c.id] = c
});
ServerCards.forEach((c) => {
    CardMap[c.id] = c
});

function sortCards(a, b) {
    return a.cost - b.cost
}

const ComboCardsMap = {};
comboCards.forEach(combo => {
    combo.idList.forEach(id => {
        if (ComboCardsMap[id]) {
            ComboCardsMap[id].comboList.push(combo.idList);
            ComboCardsMap[id].comboDetailList.push(combo);
        } else {
            ComboCardsMap[id] = {
                comboList: [combo.idList],
                comboDetailList: [combo]
            }
        }
    })
});

const UserOperatorType = {
    regist: 0,
    login: 1,
    changeNickname: 2,
    playPve: 3,
    playPvp: 4,
    cardsAdd: 5,
    cardsDelete: 6
}

module.exports = {
    CardType: CardType,
    TargetType: TargetType,
    CardPosition: CardPosition,
    Character: characterList,
    CharacterIdMap: characterIdMap,
    Cards: CardList.sort(sortCards),
    WebCards: WebCards.sort(sortCards),
    ServerCards: ServerCards.sort(sortCards),
    CardMap: CardMap,
    MAX_HAND_CARD_NUMBER,
    MAX_BASE_TABLE_CARD_NUMBER,
    MAX_THINK_TIME_NUMBER,
    AttackType,
    AttackAnimationType,
    OutCardAnimationType,
    BuffType,
    GameMode,
    ComboCards: comboCards,
    ComboCardsMap,
    UserOperatorType
};

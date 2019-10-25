// {
//     id: 0,
//     name: "xxxxxx",
//     cardType: CardType.CHARACTER,
//     cost: 3,
//     content: `xxxxxxxxxx`,
//     attack: 2,
//     life: 1,
//     attackBase: 2,
//     lifeBase: 1,
//     type: [""],
//     isStrong: true,
//     isFullOfEnergy: true,
//     isDedication: true,
//     onStart: function() {},
//     onOtherCardStart: function() {},
//     onMyTurnStart: function() {},
//     onMyTurnEnd: function() {},
//     onChooseTarget: function() {},
//     onEnd: function() {},
//     onTableCardChange: function() {},
// }

const CardType = {
    EFFECT: 1, // 效果牌
    CHARACTER: 2, // 人物牌
};

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
        id: 5,
        name: "高级程序员",
        cardType: CardType.CHARACTER,
        cost: 7,
        content: ``,
        attack: 7,
        life: 7,
        attackBase: 7,
        lifeBase: 7,
        type: [""],
        isStrong: true
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
    }
];

const AttackType = {
    ATTACK: 1,
    BE_ATTACKED: 2
};

const AttackAnimationType = {
    NORMAL: 1
};

module.exports = {
    CardType,
    Cards: CardList,
    AttackType,
    AttackAnimationType
}
const path = require('path');
const comboCards = require('./config/comboCards.json');

// Effect/Tag 系统
const effectSystem = require("./effect-system");
const { effectEngine, cardLoader } = effectSystem;

// 加载 JSON 配置的卡牌
const configPath = path.join(__dirname, 'config/cards');
cardLoader.loadFromDirectory(configPath);
console.log(`[EffectSystem] 已加载 ${cardLoader.getAllCards().length} 张 JSON 配置的卡牌`);

const allCards = cardLoader.getAllCards();

const CardMap = {};
allCards.forEach((c) => {
    CardMap[c.id] = c;
});

function sortCards(a, b) {
    return (a.cost || 0) - (b.cost || 0);
}

// 按照职业/前缀拆分
const Cards = allCards.filter(c => /^\d+$/.test(`${c.id}`)).sort(sortCards);
const WebCards = allCards.filter(c => `${c.id}`.startsWith('w')).sort(sortCards);
const ServerCards = allCards.filter(c => `${c.id}`.startsWith('s')).sort(sortCards);

// 组合牌映射
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
            };
        }
    });
});

module.exports = {
    Cards,
    WebCards,
    ServerCards,
    CardMap,
    ComboCards: comboCards,
    ComboCardsMap,
    // Effect/Tag 系统导出
    effectSystem,
    effectEngine,
    cardLoader,
}

/**
 * legacy-cards.js
 * 
 * 此文件曾包含原始的卡牌定义（带有函数式效果）。
 * 所有卡牌已迁移到 config/cards/ 目录下的 JSON 配置文件中，
 * 使用新的 effect-system 来处理卡牌效果。
 * 
 * 保留此文件是为了兼容性，但卡牌数组已清空。
 * 如果需要添加新卡牌，请在 config/cards/ 目录下的 JSON 文件中添加。
 * 
 * @deprecated 请使用 cards.js 和 effect-system
 */

const comboCards = require("./config/comboCards.json");

// 卡牌列表已迁移到 JSON 配置，这里保留空数组以保持接口兼容
const CardList = [];
const WebCards = [];
const ServerCards = [];
const TestCards = [];

// 保留 CardMap 空对象以保持接口兼容
const CardMap = {};

function sortCards(a, b) {
    return (a.cost || 0) - (b.cost || 0);
}

// ComboCardsMap 仍然从 comboCards.json 构建
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
    Cards: CardList.sort(sortCards),
    WebCards: WebCards.sort(sortCards),
    ServerCards: ServerCards.sort(sortCards),
    TestCards: TestCards.sort(sortCards),
    CardMap: CardMap,
    ComboCards: comboCards,
    ComboCardsMap,
};

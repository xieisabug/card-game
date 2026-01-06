function getNextCard(remainingCards) {
    if (remainingCards.length > 0) {
        return remainingCards.splice(0, 1)[0]
    } else {
        return null
    }
}

function getRandomCard(rand, remainingCards) {
    let index = Math.floor(rand() * remainingCards.length);
    return remainingCards.splice(index, 1)[0];
}

/**
 * 按卡牌种族类型随机抽取卡牌
 * @deprecated 不再使用旧的 cardType 属性，请使用 Tag 系统
 * @param {Function} rand - 随机函数
 * @param {Array} remainingCards - 剩余卡牌
 * @param {string} cardType - 卡牌种族类型（如 "前端"、"服务端"）
 * @returns {object|null}
 */
function getFilterCardTypeRandomCard(rand, remainingCards, cardType) {
    let cardIndex = [];
    remainingCards.forEach((c, index) => {
        const types = c.types || c.type || [];
        if (types.includes(cardType)) {
            cardIndex.push(index)
        }
    });
    if (cardIndex.length !== 0) {
        let index = Math.floor(rand() * cardIndex.length);
        return remainingCards.splice(cardIndex[index], 1)[0]
    } else {
        return null
    }
}

module.exports = {
    getNextCard,
    getRandomCard,
    getFilterCardTypeRandomCard
}
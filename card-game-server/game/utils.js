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

function getFilterCardTypeRandomCard(rand, remainingCards, cardType) {
    let cardIndex = [];
    remainingCards.forEach((c, index) => {
        if (c.cardType.indexOf(cardType) !== -1) {
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
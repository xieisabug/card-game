/**
 * Sanitize card data before sending through socket.io to avoid circular refs.
 * Currently normalizes buffList.from so it only keeps a small identifier.
 */
function sanitizeBuffList(card) {
    if (!card || typeof card !== "object" || !Array.isArray(card.buffList)) {
        return card;
    }

    card.buffList = card.buffList.map(buff => {
        if (!buff || typeof buff !== "object") {
            return buff;
        }
        const next = { ...buff };
        if (next.from && typeof next.from === "object") {
            next.from = {
                id: next.from.id,
                k: next.from.k,
                name: next.from.name
            };
        }
        return next;
    });

    return card;
}

function sanitizeCard(card) {
    if (!card || typeof card !== "object") {
        return card;
    }
    return sanitizeBuffList(card);
}

function sanitizeCards(cards) {
    if (!Array.isArray(cards)) {
        return cards;
    }
    return cards.map(sanitizeCard);
}

module.exports = {
    sanitizeCard,
    sanitizeCards
};

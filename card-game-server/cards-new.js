const SimpleCardsDB = require('./sqlite-db');
const cardEffectFactory = require("./card-effect-factory");
const {getTypeText, range} = require("./utils");
const comboCards = require("./config/comboCards.json");
const {CardType, CardPosition, BuffType, TargetType} = require("./constants");

// Create a singleton database instance
let dbInstance = null;
let cardsCache = null;

async function getDatabase() {
    if (!dbInstance) {
        dbInstance = new SimpleCardsDB();
        await dbInstance.init();
    }
    return dbInstance;
}

async function loadCardsFromDatabase() {
    try {
        const db = await getDatabase();
        
        // Load cards by category
        const baseCards = await db.getCardsByCategory('base');
        const webCards = await db.getCardsByCategory('web');
        const serverCards = await db.getCardsByCategory('server');
        
        return {
            Cards: baseCards,
            WebCards: webCards,
            ServerCards: serverCards
        };
    } catch (error) {
        console.error('Error loading cards from database:', error);
        // Fallback to original cards if database loading fails
        console.log('Falling back to original cards.js file...');
        return require('./cards-original.js');
    }
}

// For backwards compatibility and to avoid breaking existing code,
// we'll export the cards synchronously but warn about the async nature
let Cards = [];
let WebCards = [];
let ServerCards = [];

// Load cards immediately when the module is imported
const cardsPromise = loadCardsFromDatabase().then(result => {
    Cards = result.Cards;
    WebCards = result.WebCards;
    ServerCards = result.ServerCards;
    cardsCache = result;
    console.log(`Loaded ${Cards.length} base cards, ${WebCards.length} web cards, ${ServerCards.length} server cards from database`);
    return result;
}).catch(error => {
    console.error('Failed to load cards from database:', error);
    // Keep empty arrays as fallback
});

// Create CardMap from loaded cards
const CardMap = {};

// Function to update CardMap when cards are loaded
function updateCardMap() {
    Cards.forEach((c) => {
        CardMap[c.id] = c
    });
    WebCards.forEach((c) => {
        CardMap[c.id] = c
    });
    ServerCards.forEach((c) => {
        CardMap[c.id] = c
    });
}

// Update CardMap when cards are loaded
cardsPromise.then(() => {
    updateCardMap();
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

// Export async function to get cards (for new code)
async function getCards() {
    if (cardsCache) {
        return cardsCache;
    }
    return await cardsPromise;
}

// Export async function to refresh cards from database
async function refreshCards() {
    cardsCache = null;
    const result = await loadCardsFromDatabase();
    Cards.length = 0;
    Cards.push(...result.Cards);
    WebCards.length = 0;
    WebCards.push(...result.WebCards);
    ServerCards.length = 0;
    ServerCards.push(...result.ServerCards);
    updateCardMap();
    cardsCache = result;
    return result;
}

module.exports = {
    Cards: Cards,
    WebCards: WebCards,
    ServerCards: ServerCards,
    CardMap: CardMap,
    ComboCards: comboCards,
    ComboCardsMap,
    getCards,
    refreshCards,
    // Promise that resolves when cards are loaded
    cardsLoaded: cardsPromise
};
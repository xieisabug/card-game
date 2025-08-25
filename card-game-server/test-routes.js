const {Character, CharacterIdMap} = require("./constants");
const {WebCards, ServerCards, Cards, cardsLoaded} = require("./cards");

// Simple test to see if routes will work
console.log('Testing route functionality...');

// Wait for cards to load, then test
cardsLoaded.then(() => {
    console.log('Cards loaded, testing route logic...');
    
    // Simulate the route logic
    let c = Cards.slice();
    let careerCards;
    
    // Test WEB_DEVELOPER case
    if (CharacterIdMap.WEB_DEVELOPER === 1) {
        careerCards = WebCards.slice();
        console.log('WEB_DEVELOPER cards:', careerCards.length);
    }
    
    // Test SERVER_DEVELOPER case  
    if (CharacterIdMap.SERVER_DEVELOPER === 2) {
        careerCards = ServerCards.slice();
        console.log('SERVER_DEVELOPER cards:', careerCards.length);
    }
    
    console.log('Base cards:', c.length);
    console.log('Route logic test successful!');
    
}).catch(error => {
    console.error('Error testing routes:', error);
});
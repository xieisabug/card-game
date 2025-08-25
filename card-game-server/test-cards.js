const { Cards, WebCards, ServerCards, getCards, cardsLoaded } = require('./cards');

console.log('Testing cards loading...');

// Test synchronous access (should be empty initially)
console.log('Synchronous Cards length:', Cards.length);
console.log('Synchronous WebCards length:', WebCards.length);
console.log('Synchronous ServerCards length:', ServerCards.length);

// Test async access
cardsLoaded.then(() => {
    console.log('After loading...');
    console.log('Cards length:', Cards.length);
    console.log('WebCards length:', WebCards.length);
    console.log('ServerCards length:', ServerCards.length);
    
    if (Cards.length > 0) {
        console.log('First card:', Cards[0].name);
    }
    
    // Test async getCards function
    return getCards();
}).then(result => {
    console.log('getCards() result:');
    console.log('- Cards:', result.Cards.length);
    console.log('- WebCards:', result.WebCards.length);
    console.log('- ServerCards:', result.ServerCards.length);
}).catch(error => {
    console.error('Error:', error);
});
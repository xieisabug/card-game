const SimpleCardsDB = require('./sqlite-db');
const { CardType } = require('./constants');

/**
 * Simple script to add new cards to the database
 * Usage: node add-card.js
 */

async function addNewCard() {
    const db = new SimpleCardsDB();
    
    try {
        await db.init();
        
        // Example new card - can be modified as needed
        const newCard = {
            id: 'custom1', // Use unique ID
            name: "示例新卡牌",
            cardType: CardType.CHARACTER,
            cost: 3,
            content: "这是一个示例卡牌",
            attack: 2,
            life: 3,
            attackBase: 2,
            lifeBase: 3,
            type: ["示例"]
        };
        
        console.log('Adding new card:', newCard.name);
        await db.insertCard(newCard, 'base'); // or 'web', 'server', 'test'
        
        console.log('Card added successfully!');
        
        // Verify it was added
        const baseCards = await db.getCardsByCategory('base');
        const addedCard = baseCards.find(c => c.id === newCard.id);
        
        if (addedCard) {
            console.log('Verification successful - card found in database');
            console.log('Card details:', addedCard);
        } else {
            console.log('Warning: Card not found after adding');
        }
        
    } catch (error) {
        console.error('Error adding card:', error);
    } finally {
        db.close();
    }
}

// Helper function to add multiple cards
async function addMultipleCards(cards, category = 'base') {
    const db = new SimpleCardsDB();
    
    try {
        await db.init();
        
        for (const card of cards) {
            console.log(`Adding card: ${card.name}`);
            await db.insertCard(card, category);
        }
        
        console.log(`Successfully added ${cards.length} cards`);
        
    } catch (error) {
        console.error('Error adding cards:', error);
    } finally {
        db.close();
    }
}

// Run if executed directly
if (require.main === module) {
    addNewCard()
        .then(() => {
            console.log('Add card script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Script failed:', error);
            process.exit(1);
        });
}

module.exports = { addNewCard, addMultipleCards };
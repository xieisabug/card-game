const SimpleCardsDB = require('./sqlite-db');
const { Cards, WebCards, ServerCards } = require('./cards');

// TestCards is not exported by default, so let's import it from the cards file
const cardsModule = require('./cards');

// Migration script to import existing card data into SQLite database
async function migrateCardsToDatabase() {
    console.log('Starting card migration to SQLite database...');
    
    const db = new SimpleCardsDB();
    
    try {
        // Initialize the database
        await db.init();
        
        // Import base cards
        console.log('Importing base cards...');
        for (const card of Cards) {
            await db.insertCard(card, 'base');
        }
        console.log(`Imported ${Cards.length} base cards`);
        
        // Import web cards
        console.log('Importing web cards...');
        for (const card of WebCards) {
            await db.insertCard(card, 'web');
        }
        console.log(`Imported ${WebCards.length} web cards`);
        
        // Import server cards
        console.log('Importing server cards...');
        for (const card of ServerCards) {
            await db.insertCard(card, 'server');
        }
        console.log(`Imported ${ServerCards.length} server cards`);
        
        // Try to import test cards if they're available
        try {
            // Since TestCards might not be exported, we'll try to access it from the cards file
            const fs = require('fs');
            const cardsContent = fs.readFileSync('./cards.js', 'utf8');
            
            // Check if TestCards is defined in the file
            if (cardsContent.includes('const TestCards = [')) {
                console.log('TestCards found in file but not exported, skipping for now...');
                // We could potentially extract TestCards here, but for minimal changes, we'll skip
            }
        } catch (error) {
            console.log('TestCards not found or not accessible, skipping...');
        }
        
        console.log('Card migration completed successfully!');
        
        // Verify the migration by counting cards
        const baseCards = await db.getCardsByCategory('base');
        const webCards = await db.getCardsByCategory('web');
        const serverCards = await db.getCardsByCategory('server');
        
        console.log(`Verification: 
        - Base cards in DB: ${baseCards.length}
        - Web cards in DB: ${webCards.length}
        - Server cards in DB: ${serverCards.length}`);
        
    } catch (error) {
        console.error('Error during migration:', error);
        throw error;
    } finally {
        db.close();
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateCardsToDatabase()
        .then(() => {
            console.log('Migration script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = migrateCardsToDatabase;
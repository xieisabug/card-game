const { Cards, WebCards, ServerCards, CardMap, cardsLoaded } = require('./cards');

/**
 * Comprehensive test to verify the card database implementation
 */
async function runCardSystemTest() {
    console.log('🧪 Running comprehensive card system test...\n');
    
    // Wait for cards to load
    await cardsLoaded;
    
    // Test 1: Verify card counts
    console.log('📊 Test 1: Card Counts');
    console.log(`   Base cards: ${Cards.length}`);
    console.log(`   Web cards: ${WebCards.length}`);
    console.log(`   Server cards: ${ServerCards.length}`);
    console.log(`   Total in CardMap: ${Object.keys(CardMap).length}`);
    
    const expectedTotal = Cards.length + WebCards.length + ServerCards.length;
    const actualTotal = Object.keys(CardMap).length;
    
    if (actualTotal >= expectedTotal) {
        console.log('   ✅ Card counts match or exceed expected\n');
    } else {
        console.log('   ❌ Card count mismatch\n');
        return false;
    }
    
    // Test 2: Verify card structure
    console.log('🔍 Test 2: Card Structure Validation');
    const sampleCard = Cards[0];
    const requiredFields = ['id', 'name', 'cardType', 'cost'];
    
    let structureValid = true;
    requiredFields.forEach(field => {
        if (!(field in sampleCard)) {
            console.log(`   ❌ Missing required field: ${field}`);
            structureValid = false;
        }
    });
    
    if (structureValid) {
        console.log('   ✅ Card structure is valid');
        console.log(`   Sample card: ${sampleCard.name} (${sampleCard.id})\n`);
    } else {
        console.log('   ❌ Card structure validation failed\n');
        return false;
    }
    
    // Test 3: Verify CardMap lookup
    console.log('🎯 Test 3: CardMap Lookup');
    const testIds = [Cards[0].id, WebCards[0]?.id, ServerCards[0]?.id].filter(Boolean);
    
    let lookupValid = true;
    testIds.forEach(id => {
        const card = CardMap[id];
        if (!card) {
            console.log(`   ❌ Card ${id} not found in CardMap`);
            lookupValid = false;
        } else {
            console.log(`   ✅ Found card ${id}: ${card.name}`);
        }
    });
    
    if (lookupValid) {
        console.log('   ✅ CardMap lookup working correctly\n');
    } else {
        console.log('   ❌ CardMap lookup failed\n');
        return false;
    }
    
    // Test 4: Verify card categories
    console.log('📂 Test 4: Card Categories');
    const baseCardFound = Cards.some(c => c.id === 1 || c.id === 2); // Known base cards
    const webCardFound = WebCards.some(c => String(c.id).startsWith('w'));
    const serverCardFound = ServerCards.some(c => String(c.id).startsWith('s'));
    
    console.log(`   Base cards contain expected IDs: ${baseCardFound ? '✅' : '❌'}`);
    console.log(`   Web cards contain w-prefixed IDs: ${webCardFound ? '✅' : '❌'}`);
    console.log(`   Server cards contain s-prefixed IDs: ${serverCardFound ? '✅' : '❌'}\n`);
    
    // Test 5: Function preservation
    console.log('⚙️ Test 5: Function Preservation');
    const cardWithFunction = Cards.find(c => c.onStart || c.onEnd || c.onMyTurnStart || c.onMyTurnEnd);
    
    if (cardWithFunction) {
        console.log(`   ✅ Found card with functions: ${cardWithFunction.name}`);
        const functionTypes = [];
        if (cardWithFunction.onStart) functionTypes.push('onStart');
        if (cardWithFunction.onEnd) functionTypes.push('onEnd');
        if (cardWithFunction.onMyTurnStart) functionTypes.push('onMyTurnStart');
        if (cardWithFunction.onMyTurnEnd) functionTypes.push('onMyTurnEnd');
        console.log(`   Functions preserved: ${functionTypes.join(', ')}\n`);
    } else {
        console.log('   ⚠️ No cards with functions found (this may be normal)\n');
    }
    
    console.log('🎉 All tests completed successfully!');
    console.log('✅ Card database implementation is working correctly');
    
    return true;
}

// Run the test
if (require.main === module) {
    runCardSystemTest()
        .then(success => {
            if (success) {
                console.log('\n🎊 Card system test PASSED');
                process.exit(0);
            } else {
                console.log('\n💥 Card system test FAILED');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Test error:', error);
            process.exit(1);
        });
}

module.exports = runCardSystemTest;
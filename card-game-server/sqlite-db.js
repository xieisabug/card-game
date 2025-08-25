const path = require('path');
const fs = require('fs');

// Simple SQLite database module using the sqlite3 package
// We'll create this as a fallback that can work without external dependencies initially

class SimpleCardsDB {
    constructor() {
        this.dbPath = path.join(__dirname, 'cards.db');
        this.isInitialized = false;
    }

    // Initialize the database and create tables if they don't exist
    async init() {
        try {
            // Try to use sqlite3 if available
            const sqlite3 = require('sqlite3');
            this.db = new sqlite3.Database(this.dbPath);
            await this.createTables();
            this.isInitialized = true;
            console.log('SQLite database initialized successfully');
        } catch (error) {
            console.warn('SQLite3 not available, using fallback JSON storage:', error.message);
            // Fallback to JSON file storage if sqlite3 is not available
            this.jsonPath = path.join(__dirname, 'cards_backup.json');
            this.isInitialized = true;
        }
    }

    // Create the cards table
    async createTables() {
        return new Promise((resolve, reject) => {
            const sql = `
                CREATE TABLE IF NOT EXISTS cards (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    card_type INTEGER NOT NULL,
                    cost INTEGER NOT NULL,
                    content TEXT,
                    attack INTEGER,
                    life INTEGER,
                    attack_base INTEGER,
                    life_base INTEGER,
                    type_array TEXT,
                    is_strong BOOLEAN DEFAULT FALSE,
                    is_full_of_energy BOOLEAN DEFAULT FALSE,
                    is_dedication BOOLEAN DEFAULT FALSE,
                    is_hide BOOLEAN DEFAULT FALSE,
                    is_target BOOLEAN DEFAULT FALSE,
                    target_type INTEGER,
                    card_category TEXT DEFAULT 'base', -- 'base', 'web', 'server', 'test'
                    on_start_function TEXT,
                    on_end_function TEXT,
                    on_choose_target_function TEXT,
                    on_my_turn_start_function TEXT,
                    on_my_turn_end_function TEXT,
                    on_attack_function TEXT,
                    on_other_card_start_function TEXT,
                    filter_array TEXT,
                    is_need_to_choose BOOLEAN DEFAULT FALSE,
                    choose_list TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // Insert a card into the database
    async insertCard(card, category = 'base') {
        if (!this.db) {
            // Fallback to JSON storage
            return this.insertCardToJSON(card, category);
        }

        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO cards (
                    id, name, card_type, cost, content, attack, life, attack_base, life_base,
                    type_array, is_strong, is_full_of_energy, is_dedication, is_hide,
                    is_target, target_type, card_category, on_start_function, on_end_function,
                    on_choose_target_function, on_my_turn_start_function, on_my_turn_end_function,
                    on_attack_function, on_other_card_start_function, filter_array,
                    is_need_to_choose, choose_list
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                card.id,
                card.name,
                card.cardType,
                card.cost,
                card.content || '',
                card.attack || null,
                card.life || null,
                card.attackBase || null,
                card.lifeBase || null,
                JSON.stringify(card.type || []),
                card.isStrong || false,
                card.isFullOfEnergy || false,
                card.isDedication || false,
                card.isHide || false,
                card.isTarget || false,
                card.targetType || null,
                category,
                card.onStart ? card.onStart.toString() : null,
                card.onEnd ? card.onEnd.toString() : null,
                card.onChooseTarget ? card.onChooseTarget.toString() : null,
                card.onMyTurnStart ? card.onMyTurnStart.toString() : null,
                card.onMyTurnEnd ? card.onMyTurnEnd.toString() : null,
                card.onAttack ? card.onAttack.toString() : null,
                card.onOtherCardStart ? card.onOtherCardStart.toString() : null,
                JSON.stringify(card.filter || []),
                card.isNeedToChoose || false,
                JSON.stringify(card.chooseList || [])
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    // Get all cards by category
    async getCardsByCategory(category = 'base') {
        if (!this.db) {
            // Fallback to JSON storage
            return this.getCardsFromJSON(category);
        }

        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM cards WHERE card_category = ? ORDER BY cost, name';
            
            this.db.all(sql, [category], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const cards = rows.map(row => this.convertRowToCard(row));
                    resolve(cards);
                }
            });
        });
    }

    // Get all cards
    async getAllCards() {
        if (!this.db) {
            // Fallback to JSON storage
            return this.getAllCardsFromJSON();
        }

        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM cards ORDER BY card_category, cost, name';
            
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const cards = rows.map(row => this.convertRowToCard(row));
                    resolve(cards);
                }
            });
        });
    }

    // Convert database row to card object
    convertRowToCard(row) {
        const card = {
            id: row.id,
            name: row.name,
            cardType: row.card_type,
            cost: row.cost,
            content: row.content,
            attack: row.attack,
            life: row.life,
            attackBase: row.attack_base,
            lifeBase: row.life_base,
            type: JSON.parse(row.type_array || '[]'),
            isStrong: Boolean(row.is_strong),
            isFullOfEnergy: Boolean(row.is_full_of_energy),
            isDedication: Boolean(row.is_dedication),
            isHide: Boolean(row.is_hide),
            isTarget: Boolean(row.is_target),
            targetType: row.target_type,
            filter: JSON.parse(row.filter_array || '[]'),
            isNeedToChoose: Boolean(row.is_need_to_choose),
            chooseList: JSON.parse(row.choose_list || '[]')
        };

        // Add function properties if they exist
        if (row.on_start_function) {
            try {
                card.onStart = eval(`(${row.on_start_function})`);
            } catch (e) {
                console.warn(`Failed to parse onStart function for card ${card.id}:`, e.message);
            }
        }

        if (row.on_end_function) {
            try {
                card.onEnd = eval(`(${row.on_end_function})`);
            } catch (e) {
                console.warn(`Failed to parse onEnd function for card ${card.id}:`, e.message);
            }
        }

        if (row.on_choose_target_function) {
            try {
                card.onChooseTarget = eval(`(${row.on_choose_target_function})`);
            } catch (e) {
                console.warn(`Failed to parse onChooseTarget function for card ${card.id}:`, e.message);
            }
        }

        if (row.on_my_turn_start_function) {
            try {
                card.onMyTurnStart = eval(`(${row.on_my_turn_start_function})`);
            } catch (e) {
                console.warn(`Failed to parse onMyTurnStart function for card ${card.id}:`, e.message);
            }
        }

        if (row.on_my_turn_end_function) {
            try {
                card.onMyTurnEnd = eval(`(${row.on_my_turn_end_function})`);
            } catch (e) {
                console.warn(`Failed to parse onMyTurnEnd function for card ${card.id}:`, e.message);
            }
        }

        if (row.on_attack_function) {
            try {
                card.onAttack = eval(`(${row.on_attack_function})`);
            } catch (e) {
                console.warn(`Failed to parse onAttack function for card ${card.id}:`, e.message);
            }
        }

        if (row.on_other_card_start_function) {
            try {
                card.onOtherCardStart = eval(`(${row.on_other_card_start_function})`);
            } catch (e) {
                console.warn(`Failed to parse onOtherCardStart function for card ${card.id}:`, e.message);
            }
        }

        return card;
    }

    // Fallback methods for JSON storage when SQLite is not available
    insertCardToJSON(card, category) {
        try {
            let data = {};
            if (fs.existsSync(this.jsonPath)) {
                data = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
            }
            
            if (!data[category]) {
                data[category] = [];
            }
            
            // Remove existing card with same ID
            data[category] = data[category].filter(c => c.id !== card.id);
            
            // Add the new card
            data[category].push(card);
            
            fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2));
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    getCardsFromJSON(category) {
        try {
            if (!fs.existsSync(this.jsonPath)) {
                return Promise.resolve([]);
            }
            
            const data = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
            return Promise.resolve(data[category] || []);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    getAllCardsFromJSON() {
        try {
            if (!fs.existsSync(this.jsonPath)) {
                return Promise.resolve([]);
            }
            
            const data = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
            const allCards = [];
            
            Object.values(data).forEach(categoryCards => {
                allCards.push(...categoryCards);
            });
            
            return Promise.resolve(allCards);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    // Close the database connection
    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = SimpleCardsDB;
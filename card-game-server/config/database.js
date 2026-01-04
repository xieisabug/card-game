const path = require('path');

const DatabaseType = {
    MONGODB: 'mongodb',
    SQLITE: 'sqlite'
};

const defaultConfig = {
    type: process.env.DB_TYPE || 'sqlite',

    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
        dbName: process.env.MONGODB_DB_NAME || 'card-game'
    },

    sqlite: {
        databasePath: process.env.SQLITE_DB_PATH || path.join(__dirname, '../data/card-game.db'),
        autoCreateTables: true,
        enableWalMode: true
    }
};

function getConfig() {
    return defaultConfig;
}

function getCurrentType() {
    return process.env.DB_TYPE || defaultConfig.type;
}

module.exports = {
    DatabaseType,
    defaultConfig,
    getConfig,
    getCurrentType
};

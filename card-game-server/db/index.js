const config = require('../config/database');

let currentDB = null;
let initPromise = null;

async function initDB() {
    if (currentDB) return currentDB;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const dbType = config.getCurrentType();

        if (dbType === config.DatabaseType.MONGODB) {
            console.log('Initializing MongoDB database...');
            const mongodb = require('./mongodb');
            await mongodb.initDB();
            currentDB = mongodb;
        } else {
            console.log('Initializing SQLite database...');
            const sqlite = require('./sqlite');
            await sqlite.initDB();
            currentDB = sqlite;
        }

        return currentDB;
    })();

    return initPromise;
}

async function closeDB() {
    if (currentDB) {
        await currentDB.closeDB();
        currentDB = null;
        initPromise = null;
    }
}

function getDB() {
    return currentDB;
}

function getDBType() {
    return config.getCurrentType();
}

// 使用 Proxy 自动代理所有数据库方法，无需手动维护方法列表
module.exports = new Proxy({}, {
    get(target, prop) {
        // 内置方法直接返回
        if (prop === 'initDB') return initDB;
        if (prop === 'closeDB') return closeDB;
        if (prop === 'getDB') return getDB;
        if (prop === 'getDBType') return getDBType;

        // 其他方法：返回一个包装函数，在调用时才检查初始化状态
        return async (...args) => {
            if (!currentDB) {
                throw new Error(`Database not initialized. Call initDB() first.`);
            }
            if (typeof currentDB[prop] !== 'function') {
                throw new Error(`Method ${prop} not found in database`);
            }
            return currentDB[prop](...args);
        };
    }
});

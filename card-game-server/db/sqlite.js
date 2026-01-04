const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('../config/database');

let db = null;

function getDB() {
    if (!db) {
        throw new Error('SQLite database not initialized. Call initDB() first.');
    }
    return db;
}

async function initDB() {
    if (db) {
        return;
    }

    const sqliteConfig = config.defaultConfig.sqlite;
    const dbDir = path.dirname(sqliteConfig.databasePath);

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(sqliteConfig.databasePath);
    console.log('Connected to SQLite database:', sqliteConfig.databasePath);

    if (sqliteConfig.enableWalMode) {
        db.pragma('journal_mode = WAL');
        db.pragma('synchronous = NORMAL');
    }

    createTables();
}

async function closeDB() {
    if (db) {
        db.close();
        db = null;
        console.log('SQLite database connection closed');
    }
}

function createTables() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            nickname TEXT NOT NULL,
            money INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            exp INTEGER DEFAULT 0,
            createDate TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            cardsName TEXT NOT NULL,
            cardIdList TEXT NOT NULL,
            careerId INTEGER NOT NULL,
            createDate TEXT DEFAULT (datetime('now', 'localtime'))
        )`,
        `CREATE TABLE IF NOT EXISTS suggest (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            content TEXT NOT NULL,
            contact TEXT,
            time TEXT NOT NULL,
            createDate TEXT DEFAULT (datetime('now', 'localtime'))
        )`,
        `CREATE TABLE IF NOT EXISTS user_pve_process (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT UNIQUE NOT NULL,
            winLevelIdList TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS user_career_card (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            careerId INTEGER NOT NULL,
            cards TEXT NOT NULL,
            UNIQUE(userId, careerId)
        )`,
        `CREATE TABLE IF NOT EXISTS user_game_process (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT UNIQUE NOT NULL,
            processData TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS user_operator (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            type INTEGER NOT NULL,
            detail TEXT,
            createDate TEXT NOT NULL
        )`
    ];

    for (const query of queries) {
        db.exec(query);
    }

    console.log('SQLite tables created successfully');
}

function toJSON(str) {
    if (!str) return null;
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}

function stringify(val) {
    return JSON.stringify(val);
}

// ==================== 用户相关 ====================

function login(username, password) {
    const row = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
    return row ? { ...row, _id: row.id.toString() } : null;
}

function register(username, password, nickname) {
    try {
        const result = db.prepare(
            'INSERT INTO users (username, password, nickname, createDate) VALUES (?, ?, ?, ?)'
        ).run(username, password, nickname, new Date().toISOString());
        return { insertedId: result.lastInsertRowid };
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            const error = new Error('Username already exists');
            error.code = 11000;
            throw error;
        }
        throw err;
    }
}

function _userList() {
    const rows = db.prepare('SELECT * FROM users').all();
    return rows.map(row => ({ ...row, _id: row.id.toString() }));
}

function userInfo(id) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? { ...row, _id: row.id.toString() } : null;
}

function saveInfo(username, info) {
    const setClause = Object.keys(info).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(info), username];

    db.prepare(`UPDATE users SET ${setClause} WHERE username = ?`).run(...values);

    return userInfoByUsername(username);
}

function userInfoByUsername(username) {
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    return row ? { ...row, _id: row.id.toString() } : null;
}

function findUserById(id) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ? { ...row, _id: row.id.toString() } : null;
}

function userLevelUp(userId, exp) {
    db.prepare('UPDATE users SET exp = exp - ?, level = level + 1 WHERE id = ?').run(exp, userId);
}

// ==================== 卡组相关 ====================

function saveCards(userId, cardsName, cardIdList, careerId) {
    const result = db.prepare(
        'INSERT INTO cards (userId, cardsName, cardIdList, careerId) VALUES (?, ?, ?, ?)'
    ).run(String(userId), cardsName, stringify(cardIdList), careerId);
    return { insertedId: result.lastInsertRowid };
}

function findUserAllCards(userId) {
    const rows = db.prepare('SELECT * FROM cards WHERE userId = ?').all(String(userId));
    return rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        cardIdList: toJSON(row.cardIdList)
    }));
}

function findCardsById(id) {
    const row = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
    return row ? { ...row, _id: row.id.toString(), cardIdList: toJSON(row.cardIdList) } : null;
}

// ==================== 职业卡牌相关 ====================

function findUserOwnCard(userId, careerId) {
    const row = db.prepare(
        'SELECT cards FROM user_career_card WHERE userId = ? AND careerId = ?'
    ).get(String(userId), careerId);
    return row ? toJSON(row.cards) : [];
}

function userOwnCard(userId, careerId, cardId) {
    if (!Array.isArray(cardId)) {
        cardId = [cardId];
    }

    const row = db.prepare(
        'SELECT cards FROM user_career_card WHERE userId = ? AND careerId = ?'
    ).get(String(userId), careerId);

    let cards = row ? toJSON(row.cards) : [];

    for (const id of cardId) {
        if (!cards.includes(id)) {
            cards.push(id);
        }
    }

    db.prepare(
        `INSERT INTO user_career_card (userId, careerId, cards) VALUES (?, ?, ?)
         ON CONFLICT(userId, careerId) DO UPDATE SET cards = ?`
    ).run(String(userId), careerId, stringify(cards), stringify(cards));
}

// ==================== PVE 进度相关 ====================

function userWinPve(userId, levelId) {
    const { getLevelReward } = require('../utils');
    const reward = getLevelReward(levelId);

    const row = db.prepare(
        'SELECT winLevelIdList FROM user_pve_process WHERE userId = ?'
    ).get(String(userId));

    if (!row) {
        db.prepare(
            'INSERT INTO user_pve_process (userId, winLevelIdList) VALUES (?, ?)'
        ).run(String(userId), stringify([levelId]));
        db.prepare(
            'UPDATE users SET money = money + ?, exp = exp + ? WHERE id = ?'
        ).run(reward.money, reward.exp, userId);
        return { reward, success: true };
    }

    const winLevelIdList = toJSON(row.winLevelIdList);

    if (!winLevelIdList.includes(levelId)) {
        winLevelIdList.push(levelId);
        db.prepare(
            'UPDATE user_pve_process SET winLevelIdList = ? WHERE userId = ?'
        ).run(stringify(winLevelIdList), String(userId));
        db.prepare(
            'UPDATE users SET money = money + ?, exp = exp + ? WHERE id = ?'
        ).run(reward.money, reward.exp, userId);
        return { reward, success: true };
    }

    return { success: true };
}

function findNextLevel(userId) {
    const row = db.prepare(
        'SELECT winLevelIdList FROM user_pve_process WHERE userId = ?'
    ).get(String(userId));

    if (!row) {
        return 0;
    }

    const winLevelIdList = toJSON(row.winLevelIdList);
    return Math.max(...winLevelIdList) + 1;
}

// ==================== 游戏进度相关 ====================

function userGameProcess(userId) {
    const row = db.prepare(
        'SELECT processData FROM user_game_process WHERE userId = ?'
    ).get(String(userId));

    return row ? (toJSON(row.processData) || {}) : {};
}

function updateUserGameProcess(userId, processName) {
    const row = db.prepare(
        'SELECT processData FROM user_game_process WHERE userId = ?'
    ).get(String(userId));

    let processData = row ? (toJSON(row.processData) || {}) : {};
    processData[processName] = true;

    db.prepare(
        `INSERT INTO user_game_process (userId, processData) VALUES (?, ?)
         ON CONFLICT(userId) DO UPDATE SET processData = ?`
    ).run(String(userId), stringify(processData), stringify(processData));
}

// ==================== 用户反馈相关 ====================

function saveSuggest(userId, content, contact, time) {
    const result = db.prepare(
        'INSERT INTO suggest (userId, content, contact, time) VALUES (?, ?, ?, ?)'
    ).run(String(userId), content, contact, time);
    return { insertedId: result.lastInsertRowid };
}

// ==================== 用户操作日志相关 ====================

function saveUserOperator(userId, record) {
    const result = db.prepare(
        'INSERT INTO user_operator (userId, type, detail, createDate) VALUES (?, ?, ?, ?)'
    ).run(String(userId), record.type, record.detail ? stringify(record.detail) : null, new Date().toISOString());
    return { insertedId: result.lastInsertRowid };
}

function findUserOperator(userId) {
    const { UserOperatorType } = require('../constants');
    const types = [
        UserOperatorType.regist,
        UserOperatorType.login,
        UserOperatorType.playPvp,
        UserOperatorType.playPve
    ];

    const placeholders = types.map(() => '?').join(', ');
    const rows = db.prepare(
        `SELECT * FROM user_operator WHERE userId = ? AND type IN (${placeholders}) ORDER BY createDate DESC LIMIT 10`
    ).all(String(userId), ...types);

    return rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        detail: toJSON(row.detail)
    }));
}

module.exports = {
    initDB,
    closeDB,
    login,
    register,
    userInfo,
    saveInfo,
    saveCards,
    findUserAllCards,
    findCardsById,
    saveSuggest,
    findUserById,
    userWinPve,
    findNextLevel,
    findUserOwnCard,
    userLevelUp,
    userOwnCard,
    userGameProcess,
    updateUserGameProcess,
    saveUserOperator,
    findUserOperator,
    _userList
};

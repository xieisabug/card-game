const { MongoClient, ObjectId } = require("mongodb");
const { getLevelReward } = require('../utils');
const { UserOperatorType } = require("../constants");
const config = require('../config/database');

let client = null;
const dbName = config.defaultConfig.mongodb.dbName;

function getDB() {
    if (!client) {
        throw new Error('MongoDB client not initialized. Call initDB() first.');
    }
    return client.db(dbName);
}

async function initDB() {
    if (client) {
        return;
    }
    const mongoConfig = config.defaultConfig.mongodb;
    client = new MongoClient(mongoConfig.url);
    await client.connect();
    console.log('MongoDB connected successfully');
}

async function closeDB() {
    if (client) {
        await client.close();
        client = null;
        console.log('MongoDB connection closed');
    }
}

// ==================== 用户相关 ====================

async function login(username, password) {
    return getDB().collection("users").findOne({ username, password });
}

async function register(username, password, nickname) {
    const result = await getDB().collection("users").insertOne({
        username,
        password,
        nickname,
        money: 0,
        level: 0,
        exp: 0,
        createDate: new Date()
    });
    return { insertedId: result.insertedId };
}

async function _userList() {
    return getDB().collection("users").find({}).toArray();
}

async function userInfo(id) {
    return getDB().collection("users").findOne({ _id: ObjectId(id) });
}

async function saveInfo(username, info) {
    return getDB().collection("users").findOneAndUpdate(
        { username },
        info,
        { returnDocument: 'after' }
    );
}

async function findUserById(id) {
    return getDB().collection("users").findOne({ _id: ObjectId(id) });
}

async function userLevelUp(userId, exp) {
    return getDB().collection("users").updateOne(
        { _id: ObjectId(userId) },
        { $inc: { exp: -1 * exp, level: 1 } }
    );
}

// ==================== 卡组相关 ====================

async function saveCards(userId, cardsName, cardIdList, careerId) {
    const result = await getDB().collection('cards').insertOne({
        userId, cardsName, cardIdList, careerId
    });
    return { insertedId: result.insertedId };
}

async function findUserAllCards(userId) {
    return getDB().collection('cards').find({ userId: String(userId) }).toArray();
}

async function findCardsById(id) {
    return getDB().collection('cards').findOne({ _id: ObjectId(id) });
}

// ==================== 职业卡牌相关 ====================

async function findUserOwnCard(userId, careerId) {
    const result = await getDB().collection('user_career_card').findOne({
        userId: ObjectId(userId), careerId
    });
    return result ? result.cards : [];
}

async function userOwnCard(userId, careerId, cardId) {
    if (!Array.isArray(cardId)) {
        cardId = [cardId];
    }
    return getDB().collection('user_career_card').updateOne(
        { userId, careerId },
        { $addToSet: { cards: { $each: cardId } } },
        { upsert: true }
    );
}

// ==================== PVE 进度相关 ====================

async function userWinPve(userId, levelId) {
    const result = await getDB().collection('user_pve_process').findOne({ userId });
    const reward = getLevelReward(levelId);

    if (result === null) {
        await Promise.all([
            getDB().collection('user_pve_process').insertOne({
                userId, winLevelIdList: [levelId]
            }),
            getDB().collection('users').updateOne(
                { _id: ObjectId(userId) },
                { $inc: { ...reward } }
            )
        ]);
        return { reward, success: true };
    } else {
        const winLevelIdList = result.winLevelIdList;
        if (winLevelIdList.indexOf(levelId) === -1) {
            winLevelIdList.push(levelId);
            await Promise.all([
                getDB().collection('user_pve_process').updateOne(
                    { userId },
                    { $set: { winLevelIdList } }
                ),
                getDB().collection('users').updateOne(
                    { _id: ObjectId(userId) },
                    { $inc: { ...reward } }
                )
            ]);
            return { reward, success: true };
        }
        return { success: true };
    }
}

async function findNextLevel(userId) {
    const result = await getDB().collection('user_pve_process').findOne({ userId });
    if (result === null) {
        return 0;
    }
    return Math.max(...result.winLevelIdList) + 1;
}

// ==================== 游戏进度相关 ====================

async function userGameProcess(userId) {
    const result = await getDB().collection('user_game_process').findOne({
        userId: String(userId)
    });
    return result || {};
}

async function updateUserGameProcess(userId, processName) {
    return getDB().collection('user_game_process').updateOne(
        { userId },
        { $set: { [processName]: true } },
        { upsert: true }
    );
}

// ==================== 用户反馈相关 ====================

async function saveSuggest(userId, content, contact, time) {
    const result = await getDB().collection('suggest').insertOne({
        userId, content, contact, time
    });
    return { insertedId: result.insertedId };
}

// ==================== 用户操作日志相关 ====================

async function saveUserOperator(userId, record) {
    const result = await getDB().collection("user_operator").insertOne({
        userId, ...record, createDate: new Date()
    });
    return { insertedId: result.insertedId };
}

async function findUserOperator(userId) {
    return getDB().collection("user_operator")
        .find({
            userId: ObjectId(userId),
            type: {
                $in: [
                    UserOperatorType.regist,
                    UserOperatorType.login,
                    UserOperatorType.playPvp,
                    UserOperatorType.playPve
                ]
            }
        })
        .limit(10)
        .toArray();
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

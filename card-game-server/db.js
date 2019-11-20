let { MongoClient, ObjectID } = require("mongodb");
const { getLevelReward } = require('./utils');
const {UserOperatorType} = require("./constants");
let connectedDB;

// 连接数据库
MongoClient.connect("mongodb://127.0.0.1:27017/card-game", function (err, db) {
    if (!err) {
        console.info("mongodb connect successed.");
        connectedDB = db;
    } else {
        console.info("mongodb connect failed.");
        console.info("" + err);
        process.exit();
    }
});

function login(username, password) {
    return connectedDB.collection("users").findOne({
        username,
        password
    });
}

function register(username, password, nickname) {
    return connectedDB.collection("users").insertOne({
        username,
        password,
        nickname,
        money: 0,
        level: 0,
        exp: 0,
        createDate: new Date()
    })
}

function _userList() {
    return connectedDB.collection("users").find({}).toArray();
}

function userInfo(id) {
    return connectedDB.collection("users").findOne({
        _id: ObjectID(id)
    });
}

function saveInfo(username, info) {
    return connectedDB.collection("users").findOneAndUpdate({
        username
    }, info)
}

function saveCards(userId, cardsName, cardIdList, careerId) {
    return connectedDB.collection('cards').insertOne({
        userId, cardsName, cardIdList, careerId
    })
}

function findUserAllCards(userId) {
    return connectedDB.collection('cards').find({ userId: String(userId) }).toArray()
}

function findCardsById(id) {
    return connectedDB.collection('cards').findOne({
        _id: ObjectID(id)
    })
}

function saveSuggest(userId, content, contact, time) {
    return connectedDB.collection('suggest').insertOne({
        userId, content, contact, time
    })
}

function findUserById(id) {
    return connectedDB.collection('users').findOne({
        _id: ObjectID(id)
    })
}

function userWinPve(userId, levelId) {
    return connectedDB.collection('user_pve_process').findOne({
        userId: userId
    }).then(result => {
        let reward = getLevelReward(levelId);
        console.log(userId, reward);

        if (result === null) {

            return Promise.all([
                connectedDB.collection('user_pve_process').insertOne({
                    userId, winLevelIdList: [levelId]
                }),
                connectedDB.collection('users').updateOne({ _id: ObjectID(userId) }, {
                    $inc: {
                        ...reward
                    }
                })
            ]).then(() => {
                return Promise.resolve({ reward, success: true })
            });
        } else {
            let winLevelIdList = result.winLevelIdList;
            if (winLevelIdList.indexOf(levelId) === -1) {
                winLevelIdList.push(levelId);
                return Promise.all([
                    connectedDB.collection('user_pve_process').updateOne({ userId }, {
                        userId, winLevelIdList
                    }),
                    connectedDB.collection('users').updateOne({ _id: ObjectID(userId) }, {
                        $inc: {
                            ...reward
                        }
                    })
                ]).then(() => {
                    return Promise.resolve({ reward, success: true })
                });
            } else {
                return Promise.resolve({ success: true })
            }
        }
    })
}

function findNextLevel(userId) {
    return connectedDB.collection('user_pve_process').findOne({
        userId: userId
    }).then(result => {
        if (result === null) {
            return Promise.resolve(0)
        } else {
            return Promise.resolve(Math.max(...result.winLevelIdList) + 1)
        }
    })
}

/**
 * 获取用户拥有的某个职业的卡组id
 * @param userId 用户id
 * @param careerId 职业id
 */
function findUserOwnCard(userId, careerId) {
    console.log("find user own card", userId, careerId);
    return connectedDB.collection('user_career_card').findOne({
        userId: ObjectID(userId), careerId
    }).then(result => {
        if (result === null) {
            return Promise.resolve([])
        } else {
            return Promise.resolve(result.cards)
        }
    })
}

/**
 * 让某个用户拥有某些卡
 * @param userId 用户id
 * @param careerId 职业id
 * @param cardId 新拥有的卡牌id
 */
function userOwnCard(userId, careerId, cardId) {
    if (!Array.isArray(cardId)) {
        cardId = [cardId];
    }

    return connectedDB.collection('user_career_card').updateOne({
        userId,
        careerId
    }, {
        $addToSet: {
            cards: {
                $each: cardId
            }
        }
    }, {
        upsert: true
    })
}

function userLevelUp(userId, exp) {
    return connectedDB.collection('users').updateOne({
        _id: ObjectID(userId)
    }, {
        $inc: {
            exp: -1 * exp,
            level: 1
        }
    })
}

function userGameProcess(userId) {
    return connectedDB.collection('user_game_process').findOne({
        userId: String(userId)
    }).then(result => {
        if (result) {
            return Promise.resolve(result)
        } else {
            return Promise.resolve({})
        }
    })
}

function updateUserGameProcess(userId, processName) {
    return connectedDB.collection('user_game_process').updateOne({
        userId
    }, {
        $set: {[processName]: true}
    }, {
        upsert: true
    })
}

function saveUserOperator(userId, record) {
    return connectedDB.collection("user_operator").insertOne({
        userId, ...record, createDate: new Date()
    })
}

function findUserOperator(userId) {
    return connectedDB.collection("user_operator").find({
        userId: ObjectID(userId),
        type: {
            $in: [UserOperatorType.regist, UserOperatorType.login, UserOperatorType.playPvp, UserOperatorType.playPve]
        }
    }).limit(10).toArray()
}

module.exports = {
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
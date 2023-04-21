const express = require('express');
const router = express.Router();
const {
    login, register, findUserAllCards, userInfo, userOwnCard, userGameProcess, 
    updateUserGameProcess, saveInfo, saveUserOperator, findUserOperator
} = require('../db');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const {CharacterIdMap, UserOperatorType, JWTSecret} = require('../constants');
const moment = require("moment");

/* GET users listing. */
router.post('/login', function (req, res, next) {
    const alg = crypto.createHash('sha1');
    alg.update(req.body.password);

    login(req.body.username, alg.digest('hex'))
        .then(result => {
            if (result !== null) {
                Promise.all([userGameProcess(result._id), findUserAllCards(result._id)])
                    .then(r => {
                        let result1 = r[0], result2 = r[1];

                        const token = jwt.sign({id : result._id}, JWTSecret, {expiresIn: 60 * 60 * 24 * 7});
                        res.json({
                            success: true,
                            data: {
                                token,
                                userInfo: {
                                    id: result._id,
                                    nickname: result.nickname,
                                    money: result.money,
                                    exp: result.exp,
                                    level: result.level,
                                    createDate: moment(result.createDate).format("YYYY-MM-DD HH:mm")
                                },
                                cardsList: result2,
                                userGameProcess: result1
                            }
                        });

                        saveUserOperator(result._id, { type: UserOperatorType.login })
                    })
            } else {
                res.json({
                    success: false,
                    data: null
                })
            }
        });
});

router.post('/register', function(req, res) {
    const alg = crypto.createHash('sha1');
    alg.update(req.body.password);

    register(req.body.username, alg.digest('hex'), req.body.nickname)
        .then(result => {

            Promise.all([ // 赠送卡牌，要考虑后续增加新职业，怎么初始化赠送卡牌
                userOwnCard(result.insertedId, CharacterIdMap.BASE, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
                userOwnCard(result.insertedId, CharacterIdMap.WEB_DEVELOPER, ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9", "w10", "w11", "w12", "w13", "w14", "w15", "w16", "w17", "w18", "w19", "w20", "w21", "w22", "w23", "w24", "w25"]),
                userOwnCard(result.insertedId, CharacterIdMap.SERVER_DEVELOPER, ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24", "s25"]),
            ])
            .then(() => {
                saveUserOperator(result.insertedId, { type: UserOperatorType.regist })
                res.json({
                    success: true
                })
            })
        })
        .catch(e => {
            if (e.code === 11000) {
                res.json({
                    success: false,
                    error: "用户名已经被占用"
                })
            } else {
                res.json({
                    success: false,
                    error: "未知错误，可联系管理员并喷他"
                })
            }
            
        })
});

router.get('/info', function(req, res) {
    userInfo(req.auth.id)
        .then(result => {
            res.json({
                success: true,
                data: {
                    id: result._id,
                    nickname: result.nickname,
                    money: result.money,
                    exp: result.exp,
                    level: result.level,
                    createDate: moment(result.createDate).format("YYYY-MM-DD HH:mm")
                }
            });
        })
});

router.put('/gameProcess', function(req, res) {
    updateUserGameProcess(req.auth.id, req.body.name)
        .then(_ => {
            res.json({
                success: true
            })
        })
});

router.post("/nickname", function(req, res) {
    let oldNickname;
    userInfo(req.auth.id)
        .then(result => {
            oldNickname = result.nickname;
            result.nickname = req.body.nickname;

            return saveInfo(result.username, result);
        })
        .then(result => {
            saveUserOperator(req.auth.id, { type: UserOperatorType.changeNickname, oldNickname: oldNickname, newNickname: req.body.nickname })
            res.json({
                success: result.ok == 1
            })
        })
});

router.get("/userOperator", function(req, res) {
    findUserOperator(req.auth.id)
        .then(result => {
            res.json(result.map(i => {
                i.createDate = moment(i.createDate).format("YYYY-MM-DD HH:mm");
                return i
            }))
        })
})

module.exports = router;

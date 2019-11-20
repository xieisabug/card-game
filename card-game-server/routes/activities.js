const express = require('express');
const router = express.Router();
const {userOwnCard, _userList} = require('../db');
const {CharacterIdMap} = require('../constants');

router.get('/updateByActivity', function(req, res) {
    switch(req.query.activityId) {
        case "a195dz8fgvd4f85gv1w124w4fdgmy1234":
            //  /activities/updateByActivity?activityId=a195dz8fgvd4f85gv1w124w4fdgmy1234
            let userList = _userList();
            userList.then(result => {
                let listPromise = result.map(u => {
                    return Promise.all([ // 赠送卡牌，要考虑后续增加新职业，怎么初始化赠送卡牌
                        userOwnCard(u._id, CharacterIdMap.BASE, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
                        userOwnCard(u._id, CharacterIdMap.WEB_DEVELOPER, ["w1", "w2", "w3", "w4", "w5", "w6", "w7", "w8", "w9", "w10", "w11", "w12", "w13", "w14", "w15", "w16", "w17", "w18", "w19", "w20", "w21", "w22", "w23", "w24", "w25"]),
                        userOwnCard(u._id, CharacterIdMap.SERVER_DEVELOPER, ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24", "s25"]),
                    ])
                });
                Promise.all(listPromise)
                    .then(_ => {
                        res.json({
                            success: true
                        })
                    });
            });
            break;
        default:
            res.json({
                message: "???"
            })
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const {saveCards, findUserAllCards} = require('../db');

router.post('/', function (req, res) {
    const {cardsName, chooseIdList, careerId} = req.body;

    saveCards(req.auth.id, cardsName, chooseIdList, careerId)
        .then(() => {
            res.json({
                success: true
            })
        })
        .catch(() => {
            res.json({
                success: false,
                error: "添加错误了"
            })
        })
});

router.post('/getUserCards', function (req, res) {

    findUserAllCards(req.auth.id)
        .then((result) => {
            res.json({
                success: true,
                data: result
            })
        })
        .catch(() => {
            res.json({
                success: false,
                error: "获取错误"
            })
        })
});

module.exports = router;

const express = require('express');
const router = express.Router();
const {saveSuggest} = require('../db');

router.post('/', function (req, res) {
    const {userId, content, contact} = req.body;

    saveSuggest(userId, content, contact, new Date().getTime())
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

module.exports = router;

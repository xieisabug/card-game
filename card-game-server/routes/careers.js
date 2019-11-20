const express = require('express');
const router = express.Router();
const {Character, Cards, CharacterIdMap, WebCards, ServerCards} = require("../constants");
const {findUserOwnCard} = require('../db');
const {extractUserCard} = require('../utils');


router.get('/:id/cards/:userId', function (req, res, next) {
    let c = Cards.slice();
    let careerCards;
    switch (parseInt(req.params.id)) {
        case CharacterIdMap.WEB_DEVELOPER:
            careerCards = WebCards.slice();
            break;
        case CharacterIdMap.SERVER_DEVELOPER:
            careerCards = ServerCards.slice();
            break;
    }

    Promise
        .all([
            findUserOwnCard(req.params.userId, CharacterIdMap.BASE),
            findUserOwnCard(req.params.userId, parseInt(req.params.id))
        ])
        .then(result => {
            console.log(result);
            res.json({
                success: true,
                data: {
                    base: extractUserCard(c, result[0]),
                    career: extractUserCard(careerCards, result[1])
                }
            })
        })
        .catch(r => {
            console.error(r);
        })
});

router.get('/', function (req, res) {
    res.json({
        success: true,
        data: Character
    })
});

module.exports = router;

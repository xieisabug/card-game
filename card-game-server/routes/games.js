const express = require('express');
const router = express.Router();
const {existStartingUserGameRoom, getRoomData} = require("../cache");

// 查询是否有正在进行的游戏
router.get('/isStartingGame', function(req, res) {
    const userId = req.auth.id;
    const roomNumber = existStartingUserGameRoom(userId)
    if (roomNumber) {
        // 获取对应的cardsId
        let memoryData = getRoomData(roomNumber);
        let identity = memoryData["one"].userId === userId ? "one" : "two";
        res.json({
            success: true,
            isStartingGame: {
                _id: memoryData[identity].cardsId
            }
        })
    } else {
        res.json({
            success: false,
            isStartingGame: false
        })
    }

})

module.exports = router;
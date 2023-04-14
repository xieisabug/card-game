const waitPairQueue = []; // 等待排序的队列
const memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
const existUserGameRoomMap = {}; // 缓存用户的房间号， key => 用户标识，value => 房间号

function existStartingUserGameRoom(userId) {
    const roomId = existUserGameRoomMap[userId]
    if (roomId && getRoomData(roomId).startTime) {
        return roomId
    }
    return false;
}
function saveUserGameRoom(userId, roomNumber) {
    existUserGameRoomMap[userId] = roomNumber;
}
function removeUserGameRoom(userId) {
    delete existUserGameRoomMap[userId];
}

function getRoomData(roomNumber) {
    return memoryData[roomNumber];
}

function removeRoomData(roomNumber) {
    delete memoryData[roomNumber];
}

function createRoomData(roomNumber, data) {
    memoryData[roomNumber] = data;
}

function changeRoomData(roomNumber, key, value) {
    memoryData[roomNumber][key] = value;
}

function saveSocket(roomNumber, identity, socket) {
    memoryData[roomNumber][identity].socket = socket;
}

function getSocket(roomNumber, identity) {
    return memoryData[roomNumber][identity].socket;
}

module.exports = {
    existStartingUserGameRoom,
    saveUserGameRoom,
    removeUserGameRoom,
    getRoomData,
    createRoomData,
    changeRoomData,
    removeRoomData,
    saveSocket,
    getSocket,
    waitPairQueue
}

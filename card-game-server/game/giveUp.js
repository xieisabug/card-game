const {getRoomData, getSocket} = require("../cache");
const {error} = require("./log");

function giveUp(args, socket) {
    const roomNumber = args.r;

    const memoryData = getRoomData(roomNumber);
    if (!memoryData) {
        error(socket, "房间号不存在");
        return;
    }

    let identity;
    if (memoryData["one"].socket.id === socket.id) {
        identity = "one"
    } else if (memoryData["two"].socket.id === socket.id) {
        identity = "two"
    }

    if (!identity) {
        error(socket, "你不在这个房间");
        return;
    }

    const otherIdentity = identity === "one" ? "two": "one";
    getSocket(roomNumber, otherIdentity).emit("END_GAME", {win: true});
    getSocket(roomNumber, identity).emit("END_GAME", {win: false});
}

module.exports = {
    giveUp
}
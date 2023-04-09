const {getSocket} = require("../cache");

function log(socket, text) {
    socket.emit("LOG", {text});
}

function logAll(roomNumber, text) {
    getSocket(roomNumber, "one").emit("LOG", text);
    getSocket(roomNumber, "two").emit("LOG", text);
}

function error(socket, text) {
    socket.emit("ERROR", text);
}

function errorAll(roomNumber, text) {
    getSocket(roomNumber, "one").emit("ERROR", text);
    getSocket(roomNumber, "two").emit("ERROR", text);
}

module.exports = {
    log,
    logAll,
    error,
    errorAll
}
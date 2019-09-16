let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");

let app = express();

let handleSynchronousClient = require('./handler');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let server = http.createServer(app);
let socketServer = socket(server);

server.listen(4001, function () {
    console.log("listen");
});
socketServer.on('connection', function (socket) {
    console.log("connect one on ：" + new Date().toLocaleString());
    
    socket.on('COMMAND', function () {
        let args = Array.prototype.slice.call(arguments);
        args.push(socket, socketServer);
        handleSynchronousClient.apply(this, args);
    });

    

    socket.on('disconnect', function () {
        console.log("disconnect one on ：" + new Date().toLocaleString());
    });

    socket.on("ADD", function() {
        console.log(arguments);
        let args = Array.prototype.slice.call(arguments);
        let roomNumber = existUserGameRoomMap[args.userId];
        memoryData[roomNumber].count += 1;
        memoryData[roomNumber]["one"].socket.emit("UPDATE", {
            count: memoryData[roomNumber].count
        });
        memoryData[roomNumber]["two"].socket.emit("UPDATE", {
            count: memoryData[roomNumber].count
        });
    })

});


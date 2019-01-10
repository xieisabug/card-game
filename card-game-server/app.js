let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");
const uuidv4 = require('uuid/v4');
let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let server = http.createServer(app);
let socketServer = socket(server);

const waitPairQueue = []; // 等待排序的队列
const memoryData = {}; // 缓存的房间游戏数据，key => 房间号，value => 游戏数据
const existUserGameRoomMap = {}; // 缓存用户的房间号， key => 用户标识，value => 房间号

server.listen(4001, function () {
    console.log("listen");
});
socketServer.on('connection', function (socket) {
    console.log("connect one on ：" + new Date().toLocaleString());
    socket.on('hello', function () {
        socket.emit('world', {
            message: 'hello world'
        })
    });

    socket.on('CONNECT', function () {
        let args = Array.prototype.slice.call(arguments); // 将arguments转为真数组
        const {userId} = args;

        socket.emit("WAITE"); // 不管三七二十一，先给老子等起

        if (waitPairQueue.length === 0) {
            waitPairQueue.push({
                userId, socket
            });

            socket.emit("WAITE");
        } else {
            let waitPlayer = waitPairQueue.splice(0, 1)[0]; // 随便拉个小伙干一架
            let roomNumber = uuidv4(); // 生成房间号码

            // 初始化游戏数据
            waitPlayer.roomNumber = roomNumber; 
            memoryData[roomNumber] = {
                "one": waitPlayer,
                "two": {
                    userId, socket, roomNumber
                },
                count: 0
            };
            existUserGameRoomMap[userId] = roomNumber;
            existUserGameRoomMap[waitPlayer.userId] = roomNumber;

            // 进入房间
            socket.join(roomNumber);
            waitPlayer.socket.join(roomNumber);

            // 游戏初始化完成，发送游戏初始化数据
            waitPlayer.socket.emit("START", {
                start: 0,
                memberId: "one"
            });
            socket.emit("START", {
                start: 0,
                memberId: "two"
            });
        }
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


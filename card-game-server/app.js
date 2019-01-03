let http = require('http');
let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let socket = require("socket.io");
let app = express();

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
    socket.on('hello', function () {
        socket.emit('world', {
            message: 'hello world'
        })
    });

    socket.on('disconnect', function () {
        console.log("disconnect one on ：" + new Date().toLocaleString());
    });

});


let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let http = require('http');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let socket = require("socket.io");
let cors = require('cors');

let users = require('./routes/users');
let careers = require('./routes/careers');
let cards = require('./routes/cards');
let suggest = require('./routes/suggest');
let activities = require('./routes/activities');

let handleSynchronousClient = require('./handler');

let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use("/users", users);
app.use("/careers", careers);
app.use("/cards", cards);
app.use("/suggest", suggest);
app.use("/activities", activities);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
let server = http.createServer(app);
let socketServer = socket(server);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    console.log(err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
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

        // handleSynchronousClient.call(this, {
        //     type : Constant.SOCKET_DISCONNECT
        // }, socket);
    });

});

module.exports = app;

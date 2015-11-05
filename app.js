
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , http = require('http')
  , path = require('path')
  , chatdb = require("./db/dbConn")
  , googauth = require("./routes/googauth")
  , logger = require("./utils/logger");


var app = express();

module.exports = app;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.logger('dev'));

logger.info("Overriding 'Express' logger");
logger.info("logging in file");


//express middleware should handle all requests
app.use(express.bodyParser());
app.use(express.methodOverride());

//for session support
app.use(express.cookieParser('shhhh, very secret')); 
app.use(express.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/chat', routes.index);
app.get('/users', user.list);
app.get('/', login.login);
app.get('/login', login.login);
//app.post('/login', login.loginPost); // this would login using local DB
app.post('/login', login.loginWS); // this would login by making web-service call.
app.get('/googleauth', googauth.getAccessToken);
app.get('/oauth2callback', googauth.verifyToken);
app.get('/logout', login.logout);

app.get('/test', function (req, res) {
	  res.send('hello world');
	});


var io = require('socket.io').listen(app.listen(app.get('port')));
console.log('Express server listening on port ' + app.get('port'));


io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
    	console.log("user received from frontend ="+data.username);
    		io.sockets.emit('message', data);
    });
});


/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , login = require('./routes/login')
  , http = require('http')
  , path = require('path')
  , googauth = require("./routes/googauth")
  , logger = require("./utils/logger")
  , util = require('util');


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

//all routing happens in the order in which they are mentioned here 
app.all("*", function(req, res, next) {
	//all common validations/authorization etc can be done in this method
	//It is like a filter
    // do logging
//    logger.info('Request='+util.inspect((req)));
    logger.info('Request='+req.originalUrl);
 // make sure we go to the next routes and don't stop here. similar to request chaining in filters
    next();
});

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
	  res.send('hello user');
	});


var io = require('socket.io')
	.listen(app.listen(app.get('port')));

console.log('Express server listening on port ' + app.get('port'));


io.on('connection', function (socket) {
	logger.info("connection received->Sending back welcome note");
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
    	console.log("message received from client ="+data.username);
    	logger.info("message received from client ="+data.username);
    		io.sockets.emit('message', data);
    });
});

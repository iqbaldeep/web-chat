
/*
 * GET home page.
 */
//var chatDB = require("../db/dbConn"); //uncomment
var logger = require("../utils/logger");

exports.login = function(req, res){
	if(req.session.user){
		res.redirect('/chat');
	}else{
		res.render('login', { title: 'WebChat - Login' });
	}

};

exports.logout = function(req, res){

	req.session.destroy(function(err){
		if(err){
			logger.error(err);
		}
		else{
			res.redirect('/login');
		}
	});

};

/**
 * login by calling the database
 */
exports.loginPost = function(req, res){
	authenticate(req.body.username, req.body.password, function(err, user){                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
		if (user) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
			// Regenerate session when signing in                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
			// to prevent fixation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
			req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
				// Store the user's primary key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
				// in the session store to be retrieved,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
				// or in this case the entire user object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
				req.session.user = user;
				req.session.user.displayName = user.firstName;
				req.session.success = 'Authenticated as ' + user.firstName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
				+ ' click to <a href="/logout">logout</a>. '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
				+ ' You may now access <a href="/restricted">/restricted</a>.';                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
				res.redirect('/chat');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
			});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
		} else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
			req.session.error = 'Authentication failed, please check your '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
				+ ' username and password.'                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
				+ ' (use "tj" and "foobar")';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
			res.render('login', { title: "Login - Username/password didn't match" });                                                                                                                                                                                                                                                                                                                                                                                                                                                 
		}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
	});
};

/**
 * login by calling web-service
 */
exports.loginWS = function(req, mainResponse){	
	var request = JSON.stringify({
		username:req.body.username,
		password:req.body.password
		});
	
	// prepare the header
	var postheaders = {
	    'Content-Type' : 'application/json',
	    'Content-Length' : Buffer.byteLength(request, 'utf8')
	};
	
	var http = require('http');
	var wsClient = require('../wsclient/wsclient');
	// do the POST call
	var reqPost = http.request(wsClient.getOptions('users','POST', postheaders), function(res) {
		logger.info("statusCode: ", res.statusCode);
	    // uncomment it for header details
	//  console.log("headers: ", res.headers);
	 
	    res.on('data', function(response) {
	        logger.info('POST result: '+response);
	        var jsonResponse = JSON.parse(response);

	        if(jsonResponse.responseCode && jsonResponse.responseCode == 100 && jsonResponse.userInfo){
	        	req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
					// Store the user's primary key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
					// in the session store to be retrieved,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
					// or in this case the entire user object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
					req.session.user = jsonResponse.userInfo;
					req.session.user.displayName = jsonResponse.userInfo.firstName;
					req.session.success = 'Authenticated as ' + jsonResponse.userInfo.firstNam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
					+ ' click to <a href="/logout">logout</a>. '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
					+ ' You may now access <a href="/restricted">/restricted</a>.';
					logger.info("login complete with success");
					mainResponse.redirect('/chat');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
				});
	        }else{
	        	logger.info("login failed");
				req.session.error = 'Authentication failed, please check your '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
					+ ' username and password.'                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
					+ ' (use "tj" and "foobar")';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
				mainResponse.render('login', { title: "Login - Username/password didn't match" });                                                                                                                                                                                                                                                                                                                                                                                                                                                 
			
	        }
	    });
	});
	 
	// write the json data
	logger.info("request : "+ request);
	reqPost.write(request);
	reqPost.end();
	reqPost.on('error', function(e) {
	    logger.error("error occured while making service call"+e);
	});
	
};

/*
function authenticate(username, password, fn) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
	//TODO
	var user = chatDB.loginUser(username, password, function(err, result){

		if(err){
			logger.error(err);
			fn(err, result);
		}else if(result.length){
			var user = result[0];
			if(user.password == password){
				logger.info("password matches");
				fn(err, user);
			}else{
				fn(err, undefined);
			}
		}else{
			logger.error("No records found");
			fn(err, undefined);
		}
	});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              

}*/

/*
 * GET home page.
 */
//var chatDB = require("../db/dbConn");
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
exports.loginWS = function(req, res){
	logger.error("loginWS");
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
	    console.log("statusCode: ", res.statusCode);
	    // uncomment it for header details
	//  console.log("headers: ", res.headers);
	 
	    res.on('data', function(response) {
	        console.info('POST result:\n'+response);
	        console.info('\n\nPOST completed');
	        if(response.responseCod && response.responseCode == 100 && response.userInfo){
	        	req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
					// Store the user's primary key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
					// in the session store to be retrieved,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
					// or in this case the entire user object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
					req.session.user = response.userInfo;
					req.session.user.displayName = response.userInfo.firstName;
					req.session.success = 'Authenticated as ' + response.userInfo.firstNam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
					+ ' click to <a href="/logout">logout</a>. '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
					+ ' You may now access <a href="/restricted">/restricted</a>.';                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
					res.redirect('/chat');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
				});
	        }else{
                
				req.session.error = 'Authentication failed, please check your '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
					+ ' username and password.'                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
					+ ' (use "tj" and "foobar")';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
				res.render('login', { title: "Login - Username/password didn't match" });                                                                                                                                                                                                                                                                                                                                                                                                                                                 
			
	        }
	    });
	});
	 
	// write the json data
	reqPost.write(request);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
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
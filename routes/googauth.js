/**
 * handles google authentication
 */
var cred = {
		CLIENT_ID:"878060532164-ov0kmvvdrnpaa2vo288hl901lnlm92qi.apps.googleusercontent.com",
		CLIENT_SECRET:"f8GFRQIVsv7tgZQX_2YZECYQ",
		REDIRECT_URL:"http://my.web-chat.com/oauth2callback"
};
var logger = require("../utils/logger");

var google = require('googleapis');
var OAuth2Client = google.auth.OAuth2;
var plus = google.plus('v1');

var oauth2Client = new OAuth2Client(cred.CLIENT_ID, cred.CLIENT_SECRET, cred.REDIRECT_URL);

function getAccessToken(oauth2Client, callback) {
	// generate consent page url
	var url = oauth2Client.generateAuthUrl({
		access_type: 'offline', // will return a refresh token
		scope: 'https://www.googleapis.com/auth/plus.me' // can be a space-delimited string or an array of scopes
	});

	logger.info('Google oauth URL: ', url);
	callback(url);
}



exports.getAccessToken = function (req, res){
	// retrieve an access token
	getAccessToken(oauth2Client, function(url) {
		res.redirect(url);
	});
}

exports.verifyToken = function (req, res){
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var code = query.code;
	logger.info(" Auth Code=="+code);
	// request access token
	oauth2Client.getToken(code, function(err, tokens) {
		// set tokens to the client
		// TODO: tokens should be set by OAuth2 client.
		oauth2Client.setCredentials(tokens);

		// retrieve user profile
		plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
			if (err) {
				logger.error('An error occured', err);
				return;
			}
			logger.info(profile.displayName, ':', profile);
			req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
		        // Store the user's primary key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
		        // in the session store to be retrieved,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
		        // or in this case the entire user object
				req.session.user = {};
		        req.session.user.displayName = profile.displayName;
		        req.session.user.imgUrl = profile.image.url;
		        req.session.success = 'Authenticated as ' + profile.displayName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
		          + ' click to <a href="/logout">logout</a>. '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
		          + ' You may now access <a href="/restricted">/restricted</a>.';                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
		        res.redirect('/chat');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
		      });
		});
	});
}
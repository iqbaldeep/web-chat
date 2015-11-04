
/*
 * GET home page.
 */
var logger = require("../utils/logger");

exports.index = function(req, res){
	if(req.session.user){
		logger.info("session attribute=="+req.session.user.displayName);
		res.render('index', { title: 'WebChat - Chat with Friends',username: req.session.user.displayName,imgUrl:req.session.user.imgUrl });
	}else{
		res.redirect('/login');
	}
  
};
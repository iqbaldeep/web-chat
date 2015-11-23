/**
 * New node file
 */

var app = require('../app');
var logger = require("../utils/logger");
exports.findUser = function (data){
	var emailId = data.username;
	//lets require/import the mongodb native drivers.
	var mongodb = require('mongodb');

	//We need to work with "MongoClient" interface in order to connect to a mongodb server.
	var MongoClient = mongodb.MongoClient;

	// Connection URL. This is where your mongodb server is running.
	var url = 'mongodb://159.203.248.23:27017/chat';

	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
	  if (err) {
	    logger.error('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
		  logger.info('Connection established to', url);
	    
	    var collection = db.collection("Users");
	    
	    
	    collection.find({email: emailId}).toArray(function (err, result) {
	        if (err) {
	        	logger.error(err);
	        } else if (result.length) {
	        	logger.info('Found:', result);
	          app.sendData(result, data);
	        } else {
	        	logger.error('No document(s) found with defined "find" criteria!');
	          app.sendData(result, data,{message:"User could not be authorized!!!"});
	        }
	    

	    //Close connection
	    db.close();
	    });
	    }
	});
}

exports.loginUser = function (username, password, fn){
	var emailId = username;
	//lets require/import the mongodb native drivers.
	var mongodb = require('mongodb');

	//We need to work with "MongoClient" interface in order to connect to a mongodb server.
	var MongoClient = mongodb.MongoClient;

	// Connection URL. This is where your mongodb server is running.
	var url = 'mongodb://159.203.248.23:27017/chat';

	// Use connect method to connect to the Server
	MongoClient.connect(url, function (err, db) {
	  if (err) {
		  logger.error('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    //HURRAY!! We are connected. :)
		  logger.info('Connection established to', url);
	    
	    var collection = db.collection("Users");
	    
	    
	    collection.find({email: emailId}).toArray(function (err, result) {
	    	logger.info("result = "+result);
	          fn(err, result);
	    

	    //Close connection
	    db.close();
	    });
	    }
	});
}
/**
 * New node file
 */
var config = module.exports = {};

config.env = 'development';
config.hostname = 'dev.example.com';

//mongo database
config.mongo = {};
config.mongo.UserTable = 'Users';
/**
 * New node file
 */
var request = require('supertest');
var app = require('../app.js');
 
describe('GET /test', function() {
  it('respond with hello world', function(done) {
    request(app).get('/test').expect('hello world', done);
  });
});
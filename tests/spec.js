var request = require('supertest');
var assert = require('assert');
var monk = require('monk');

var Validator = require('jsonschema').Validator;
var validator = new Validator();


var postBirdsResponse = require('../schemas/post-birds-response.json');
var getBirdsResponse = require('../schemas/get-birds-response.json');
var getBirdsIdResponse = require('../schemas/get-birds-id-response.json');

describe('Testing birds', function () {
    var server, db, birds;
    beforeEach(function () {
	app = require('../app');
	server = app.listen(3000);
	db = monk('localhost:27017/saltside');
	birds = db.get("birds");
    });
    afterEach(function () {
	server.close();
    });
    it('responds to /', function testSlash(done) {
	request(server)
	    .get('/')
	    .expect(200, done);
    });
    it('404 everything else', function testPath(done) {
	request(server)
	    .get('/foo/bar')
	    .expect(404, done);
    });
    it("Creating new bird", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	    "visible" : true
	};

	request("http://localhost:3000")
	    .post("/birds")
	    .send(bird)
	    .expect(function(res) {
		var validationResult = validator.validate(res.body, postBirdsResponse);
		assert.equal(validationResult.valid, true);
	    })
	    .expect(201, done);

    });
    it("Creating new bird with missing data", function(done){
	var bird = {
	    "name" : "first",
	    "continents" : [ "africa", "europe"],
	    "visible" : true
	};

	request("http://localhost:3000")
	    .post("/birds")
	    .send(bird)
	    .expect(400, done);

    });
    it("Creating new bird without visibility", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	};

	request("http://localhost:3000")
	    .post("/birds")
	    .send(bird)
	    .expect(function(res) {
		var validationResult = validator.validate(res.body, postBirdsResponse);
		assert.equal(validationResult.valid, true);
		assert.equal(res.body.visible, false);
	    })
	    .expect(201, done);

    });
    it("Get all birds", function(done){
	request("http://localhost:3000")
	    .get("/birds")
	    .expect(function(res) {
		var validationResult = validator.validate(res.body, getBirdsResponse);
		assert.equal(validationResult.valid, true);
	    })
	    .expect(200, done);

    });

    it("Get bird with specified ID", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	    "visible" : true,
	    "added" : "1990-04-05"
	};

	birds.insert(bird, function (err, doc) {
	    if(err) return done(err);

	    request("http://localhost:3000")
		.get("/birds/" + doc._id)
		.expect(function(res) {
		    var validationResult = validator.validate(res.body, getBirdsIdResponse);
		    assert.equal(validationResult.valid, true);
		})
		.expect(200, done);
	});		
    });

    it("Get bird with specified ID but not visible", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	    "visible" : false,
	    "added" : "1990-04-05"
	};

	birds.insert(bird, function (err, doc) {
	    if(err) return done(err);

	    request("http://localhost:3000")
		.get("/birds/" + doc._id)
		.expect("OK")
		.expect(200, done);
	});		
    });

    it("Get bird with not valid ID", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	    "visible" : false,
	    "added" : "1990-04-05"
	};

	birds.insert(bird, function (err, doc) {
	    if(err) return done(err);
	    birds.remove({_id: doc._id}, function(err, result){
	    	if(err) return done(err);
	    
		request("http://localhost:3000")
		    .get("/birds/" + doc._id)
		    .expect("Not Found")
		    .expect(404, done);
	    });
	});		
    });

    it("Remove bird with specified ID", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	    "visible" : false,
	    "added" : "1990-04-05"
	};

	birds.insert(bird, function (err, doc) {
	    if(err) return done(err);

	    request("http://localhost:3000")
		.delete("/birds/" + doc._id)
		.expect("OK")
		.expect(200, done);
	});		
    });

    it("Remove bird with not valid ID", function(done){
	var bird = {
	    "name" : "first",
	    "family" : "firstly",
	    "continents" : [ "africa", "europe"],
	    "visible" : false,
	    "added" : "1990-04-05"
	};

	birds.insert(bird, function (err, doc) {
	    if(err) return done(err);
	    birds.remove({_id: doc._id}, function(err, result){
	    	if(err) return done(err);
	    
		request("http://localhost:3000")
		    .delete("/birds/" + doc._id)
		    .expect("Not Found")
		    .expect(404, done);
	    });
	});		
    });

});


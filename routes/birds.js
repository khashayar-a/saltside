var express = require('express');
var router = express.Router();
var Validator = require('jsonschema').Validator;
var validator = new Validator();

var postBirdsRequest = require('../schemas/post-birds-request.json');

router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('birds');

    collection.find({}, {}, function(err, docs){
	if (err)
	    res.send("There was a problem connecting to the database.");
	
	var data = [];
	docs.forEach(function(doc) {
	    data.push(String(doc._id));
	});
	res.status(200).send(data);
    });
});

router.post('/', function(req, res, next) {
    var data = req.body;
    var db = req.db;
    var collection = db.get('birds');

    var validationResult = validator.validate(data, postBirdsRequest);
        
    if (validationResult.valid){
	data.added = formatDate(new Date());
	if (!data.visible)
	    data.visible = false;

	collection.insert(data, {w:1}, function(err, doc) {
            if (err) {
		res.send("There was a problem connecting to the database.");
            } else {
		doc.id = String(doc._id);
		delete doc._id;

		res.status(201).send(doc);
            }
	});
	
    } else {
	res.sendStatus(400);
    } 
});


router.get('/:id', function(req, res, next) {
    var db = req.db;
    var collection = db.get('birds');

    collection.find({_id : req.params.id}, {}, function(err, docs){
	if (err)
	    res.send("There was a problem connecting to the database.");

	if (docs.length == 1){
	    var doc = docs[0];
	    if (doc.visible){
		doc.id = String(doc._id);
		delete doc._id;
	 	res.status(200).send(doc);
	    } else {
		res.sendStatus(200);
	    }
	} else {
	    res.sendStatus(404);
	}
    });
});

router.delete('/:id', function(req, res, next) {
    var db = req.db;
    var collection = db.get('birds');

    collection.remove({_id: req.params.id}, function(err, result){
	if (err)
	    res.send("There was a problem connecting to the database.");

	if (result)
	    res.sendStatus(200);
	else
	    res.sendStatus(404);
    });
});

function formatDate(d) {
    var month = '' + (d.getMonth() + 1);
    var day = '' + d.getDate();
    var year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = router;

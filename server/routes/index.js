const routes = require('express').Router();
const mongoose = require('mongoose');
const Feed = require('../models/feed.js');

routes.get('/', (req, res) => {

	// How many days old can stories be?
	let daysBack = 7;

	mongoose.connect('mongodb://127.0.0.1:27017/feed', {
  	useMongoClient: true
  });
	
	var db = mongoose.connection;
 	
  db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
	
		var cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - daysBack);

	  Feed.find({date: {$gte: cutoff}}, null, {sort: '-date'}, function(err, feed) {
	    res.send(feed);  
	  });

	});

});

module.exports = routes;
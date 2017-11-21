const routes = require('express').Router();
const mongoose = require('mongoose');
const Feed = require('../models/feed.js');

routes.get('/', (req, res) => {

	mongoose.connect('mongodb://127.0.0.1:27017/feed', {
  	useMongoClient: true
  });
	
	var db = mongoose.connection;
 	
  db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		
	  Feed.find({}, function(err, feed) {
	    res.send(feed);  
	  });

	});

});

module.exports = routes;
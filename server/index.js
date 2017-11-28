// Bring in our dependencies
const app = require('express')();
const routes = require('./routes');
const cron = require('node-cron');
const FeedParser = require('feedparser');
const request = require('request'); // for fetching the feed
const mongoose = require('mongoose');
const Feed = require('./models/feed.js');
const cors = require('cors');


// Allow requests from local Aurelia instance
app.use(cors());

//  Connect all our routes to our application
app.use('/', routes);

// Refresh news every 5 minutes
cron.schedule('*/5 * * * *', function() {

	var req = request('https://news.google.com/news/rss/search/section/q/%22federal%20aviation%20administration%22/%22federal%20aviation%20administration%22?hl=en&gl=US&ned=us');
	var feedparser = new FeedParser();
  let feed = [];

	mongoose.connect('mongodb://127.0.0.1:27017/feed', {
  	useMongoClient: true
  });
	
	var db = mongoose.connection;
 	
	req.on('error', function (error) {
	  // handle any request errors
	  console.log(error);
	});
	 
	req.on('response', function (res) {
	  var stream = this; // `this` is `req`, which is a stream
	 
	  if (res.statusCode !== 200) {
	    this.emit('error', new Error(`Bad status code: ${res.statusCode}`));
	  }
	  else {
	    stream.pipe(feedparser);
	  }
	});
	 
	feedparser.on('error', function (error) {
	  // always handle errors
	  console.log(error);
	});

  db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		 
		feedparser.on('readable', function () {
		  // This is where the action is!
		  var stream = this; // `this` is `feedparser`, which is a stream
		  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
		  var item;

		  // we're connected, save items
		  while (item = stream.read()) {
		    feed.push({
		    	title: item.title, 
		    	link: item.link,
		    	date: new Date(item.pubDate)
		    });

		  }

		});

	});

  feedparser.on('finish', function () { 

		feed.forEach(item => {

			Feed.update(
		    {link: item.link}, 
		    {$setOnInsert: item}, 
		    {upsert: true}, 
		    function(err, numAffected) {
				  if (err) return console.error(err);			    	
			});

		});

  	console.log(`News feed updated ${new Date().toString()}`);
  });
  
});


// Turn on that server!
app.listen(3000, () => {
  console.log('App listening on port 3000');
});

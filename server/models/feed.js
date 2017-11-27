var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedSchema = new Schema({
   title: String,
   link: String,
   date: Date
});

module.exports = mongoose.model('Feed', feedSchema);
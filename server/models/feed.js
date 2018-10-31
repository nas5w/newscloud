var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedSchema = new Schema({
   title: { type: String, unique: true },
   link: { type: String, unique: true },
   date: Date
});

module.exports = mongoose.model('Feed', feedSchema);
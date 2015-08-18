var mongoose = require('mongoose');  
var flowSchema = new mongoose.Schema({  
  title: String,
  url: String
});
mongoose.model('Flow', flowSchema);
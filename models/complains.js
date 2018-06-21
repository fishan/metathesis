//Complain Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var complainSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    complaintext: {
	type: String,
	minlength: 2,
	maxlength: 400,
	required: true
    }
}, {
    timestamps: true
});

var Complains = mongoose.model('Complain', complainSchema);
module.exports = Complains;

/*

{
	"title": "too hard",
	"complaintext": "too hard to create"
}

*/
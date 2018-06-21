//Proposal Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var proposalSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    proposaltext: {
	type: String,
	minlength: 2,
	maxlength: 400,
	required: true
    }
}, {
    timestamps: true
});

var Proposals = mongoose.model('Proposal', proposalSchema);
module.exports = Proposals;

/*
{
	"title": "get speed",
	"proposaltext": "do faster"
}
*/
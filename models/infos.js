//Info Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var infoSchema = new Schema({
    title: {
      type: String,
      required: true
    },
    image: {
		type: String,
		required: false
    },
    category: {
		type: String,
		required: true
    },
    text: {
		type: String,
		required: true
    },
    description: {
      type: String,
      required: false
    },
	language:{
		type: String,
		required: false,
		default: 'en'
    }
}, {
    timestamps: true
});

var Infos = mongoose.model('Info', infoSchema);
module.exports = Infos;

/*

{
	"title": "Server-side running up !",
	"image": "/images/start.jpg",
	"description": "Back-end with database first stage completed",
	"text": "Server and database works both and have testings",
	"category": "news"
}

*/
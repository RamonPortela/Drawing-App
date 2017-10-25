var mongoose = require('mongoose');
var Image = require('./Entities/imagem');

var MongoDb = (function(){
    mongoose.connect(process.env.MONGODB_URI);
    var mongo = {};

    mongo.connect = function (){
        var db = mongoose.connection;
        db.once('open', function(){
            Image.find({}).exec().then(function(images){
                console.log(images);
                return images;
            })
        })
    }

    return mongo;
})();

exports.MongoDb = MongoDb;
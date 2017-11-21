var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    nome: String,
    insercao: Date,
    base64: String
})

module.exports = mongoose.model('Imagem', ImageSchema, 'imagems');
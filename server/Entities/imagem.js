var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema({
    nome: String,
    base64: String
})

module.exports = mongoose.model('Imagem', ImageSchema);
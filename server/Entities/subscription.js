var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SubscriptionSchema = new Schema({
    endpoint: String,
    expirationTime: Date,
    keys:{type: {
        p256dh: String,
        auth: String
    }}
})

module.exports = mongoose.model('Subscription', SubscriptionSchema, "subscriptions");
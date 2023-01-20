const mongoose = require('mongoose')

const messageschema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    receiver: {
        type: String,
        required: true,

    },
    msgtext: {
        type: String,
        required: true,
    },
    status: {
        default: 'unseen',
        type: String, 
        required: true,
    },
    sendtime: {
        type: Date,
        default:() => new Date
    }
})

module.exports = mongoose.model('Messages',messageschema)  
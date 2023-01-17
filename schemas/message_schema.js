const mongoose = require('mongoose')

const messageschema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    reciever: {
        type: String,
        required: true,

    },
    msgtext: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Messages',messageschema)
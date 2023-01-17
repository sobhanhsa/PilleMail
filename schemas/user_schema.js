const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    pass: {
        type : String,
        required: true
    },
    email: {
        type : String,
        required: true,
        lowercase: true
    }
})
module.exports = mongoose.model("User", userschema)

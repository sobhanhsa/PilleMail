require('dotenv').config()
const jwt = require('jsonwebtoken')
const userschema = require('../schemas/user_schema.js')
const mongoose = require('mongoose')
//DB connect options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4// Use IPv4, skip trying IPv6
}
mongoose.connect('mongodb://localhost:27017/emailapp', options).catch(erorr => console.log(erorr.message))
mongoose.set('strictQuery', true)

const accessTokenMaker = (email) => { return jwt.sign(email, process.env.SECRET_TOKEN_ACCESS) }
function TokenAuthenticator(token) {
    let tokenstatus = null
    jwt.verify(token, process.env.SECRET_TOKEN_ACCESS, (err, email) => {
        if (err) {
            console.log(err)
            return tokenstatus = false
        }

        tokenstatus = email
    })
    return tokenstatus
}
//token athentication middleware
const tokencheckFuncMw = async (req, res, next) => {
    const jwt = require('jsonwebtoken')
    const dbusers = await userschema.find({})
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const tokenstatus = TokenAuthenticator(token)
    //if the tocken was valid
    if (tokenstatus) {
        //find that user from db
        const currentuser = await userschema.findOne({ email: tokenstatus })
        if (!currentuser) return res.send("probably your email was changed please login again")
        //set the values for next stages
        req.body.name = currentuser.name,
            req.body.email = currentuser.email
        next()
    } else {
        return res.send("invalid token ; please login")
    }

}
module.exports = {
    accessTokenMaker,
    TokenAuthenticator,
    tokencheckFuncMw,
}
//sobhan : eyJhbGciOiJIUzI1NiJ9.c29iaGFuQHBpbGxlbWFpbC5jb20.6I0-hopo6uVtFC-iJENlVI4KHhgUbi82XG040s9QqFM
//         eyJhbGciOiJIUzI1NiJ9.c29iaGFuQHBpbGxlbWFpbC5jb20.6I0-hopo6uVtFC-iJENlVI4KHhgUbi82XG040s9QqFM
//amin : eyJhbGciOiJIUzI1NiJ9.YW1pbkBwaWxsZW1haWwuY29t.4A-qWjl_buX0WnouPWnDgw7zQ7yXktEeDoaqX70UU_4
require('dotenv').config()
const jwt = require('jsonwebtoken')
const userschema = require('../schemas/user_schema.js')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/emailapp')

const accessTokenMaker = (email) => { return jwt.sign(email, process.env.SECRET_TOKEN_ACCESS) }
function TokenAuthenticator(token) {
    const jwt = require('jsonwebtoken')
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

console.log(TokenAuthenticator('eyJhbGciOiJIUzI1NiJ9.c29iaGFuQHBpbGxlbWFpbC5jb20.6I0-hopo6uVtFC-iJENlVI4KHhgUbi82XG040s9QqFM'))
module.exports = {
    accessTokenMaker, 
    TokenAuthenticator,
    tokencheckFuncMw,
}
//sobhan : eyJhbGciOiJIUzI1NiJ9.c29iaGFuQHBpbGxlbWFpbC5jb20.6I0-hopo6uVtFC-iJENlVI4KHhgUbi82XG040s9QqFM
//amin : eyJhbGciOiJIUzI1NiJ9.YW1pbkBwaWxsZW1haWwuY29t.4A-qWjl_buX0WnouPWnDgw7zQ7yXktEeDoaqX70UU_4
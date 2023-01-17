const userschema = require('../schemas/user_schema.js')
const messageschema = require('../schemas/message_schema')
const mongoose = require('mongoose')
const emailValidator = require('../validators/emailvalidator.js')
const { accessTokenMaker, TokenAuthenticator } = require('../validators/tokenvalidator')
let users = []
const jwt = require('jsonwebtoken')
mongoose.connect('mongodb://localhost/emailapp', () => console.log("db connected"))

mongoose.set('strictQuery', true)


userfinder()

async function userfinder(){
    users = await messageschema.find({})
    console.log(users)
}

const signUpFunc = async (req, res) => {
    const authHeader = req.headers['authorization']
    // getting user singup data by req.body
    const userdata = req.body
    //initial checkment
    if (!userdata.pass) {
        return res.send("please enter the pass")
    }
    if (!userdata.name) {
        return res.send("please enter the name")
    }
    if (!userdata.email) {
        return res.send("please enter the pass")
    }
    //check the validation of email with regex
    const isEmailValid = emailValidator(userdata.email)
    if (!isEmailValid) {
        return res.send("your email is not valid")
    }
    //checkment by according to db
    const dbusers = await userschema.find({})
    const repetitiveEmail = dbusers.find((item) => item.email === userdata.email)
    //console.log(isEmailValid)
    if (repetitiveEmail) {
        return res.send("repetitive email please change it")
    }
    else {
        await userschema.create({ name: userdata.name, pass: String(userdata.pass), email: userdata.email })
        return res.send(`your email acc created and your token is ${accessTokenMaker(userdata.email)}`)
    }
}
const loginFunc = async (req, res) => {
    const dbusers = await userschema.find({})
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const tokenstatus = TokenAuthenticator(token)
    if (tokenstatus) {
        const currentuser = await userschema.findOne({ email: tokenstatus })
        console.log(currentuser)
        return res.send("wellcome " + currentuser.name)
    }
    //manual checkment  
    if (!tokenstatus) {
        //itinial checkment
        const userdata = req.body
        if (!userdata.pass) {
            return res.send("please enter the pass")
        }
        if (!userdata.email) {
            return res.send("please enter the email")
        }
        const matchedUser = dbusers.find((item) => item.email === userdata.email)
        console.log(matchedUser)
        if (!matchedUser) {
            return res.send("there is no acc with this email")
        } else {
            return res.send("welcome back " + matchedUser.name)
        }

    }
}
module.exports = {
    signUpFunc,
    loginFunc
}

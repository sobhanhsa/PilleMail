const userschema = require('../schemas/user_schema.js')
const mongoose = require('mongoose')
const emailValidator = require('../validators/emailvalidator.js')
const { accessTokenMaker, TokenAuthenticator } = require('../validators/tokenvalidator')
let users = []
const jwt = require('jsonwebtoken')
//DB connect options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}
mongoose.connect('mongodb://localhost:27017/emailapp', () => console.log("db connected"), (err) => {
    console.log(err.message)
})
mongoose.set('strictQuery', true)


// userfinder()

async function userfinder() {
    users = await userschema.find({})
    console.log(users)
} 
//returns corrected email
function emailCorrection(initemail) {
    return initemail.split('@')[0] + "@pillemail.com"
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
    //add @pillemail
    const correctemail = emailCorrection(userdata.email)
    //checkment by according to db
    const dbusers = await userschema.find({})
    const repetitiveEmail = dbusers.find((item) => item.email === correctemail)
    if (repetitiveEmail) {
        return res.send("repetitive email please change it")
    }
    else {
        //emailcorrection
        await userschema.create({
            name: userdata.name, pass: String(userdata.pass),
            email: correctemail
        })
        return res.json({
            msg: 'thank you for joining us',
            accessToken: accessTokenMaker(correctemail)
        })
    }
}
const loginFunc = async (req, res) => {
    const dbusers = await userschema.find({})
    const authHeader = req.headers['authorization']
    const usertoken = authHeader && authHeader.split(' ')[1]
    const tokenstatus = TokenAuthenticator(usertoken)
    if (tokenstatus) {
        const currentuser = await userschema.findOne({ email: tokenstatus })
        if(!currentuser) return res.send('this acc doesent exist in the db probably deleted by user')
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
        // console.log(matchedUser)
        if (!matchedUser) {
            return res.send("there is no acc with this email")
        }else {
            return res.json({
                msg: `wellcome back ${matchedUser.name}`,
                accessToken: accessTokenMaker(matchedUser.email)
            })
        }

    }
}
module.exports = {
    signUpFunc,
    loginFunc
}

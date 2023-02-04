const message_schema = require('../schemas/message_schema')
const user_schema = require('../schemas/user_schema')
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
    family: 6// Use IPv4, skip trying IPv6
}
mongoose.connect('mongodb://localhost:27017/emailapp',options).catch(erorr => console.log(erorr.message))
mongoose.set('strictQuery', true)
 
// test() 
async function test() {
    await message_schema.create({
        sender: "sobhan@pillemail.com",
        receiver: "amin@pillemail.com", msgtext: "slm yarrrre"
    })
    console.log(await message_schema.find({}))
}
//filter function **for specifying sended msg and unreaded msg
const unreadMsgFilter = (arr) => {
    return arr.filter((msg) => {
        if (msg.status === 'unread') return msg
    })
}
//ip conrtoller
const inboxFunc = async (req, res) => {
    //witch group of msg user requested ** finding with according to ipaddress
    const msglist = req.query.list
    //get user information
    const currentuser = req.body
    //by according to db find our users messages
    const usermessages = await message_schema.find({
        $or: [{ receiver: currentuser.email },
        { sender: currentuser.email }]
    })
    if (!usermessages[0]) return res.send('you dont have any messages')
    if (msglist === 'unreadmsg') {
        res.json({
            unreadedmessages: unreadMsgFilter(usermessages)
        })
        //make unseened messages seen
        await message_schema.find({ receiver: currentuser.email })
            .updateMany({ status: 'seen' })
        return
    }
    //while user query is sended msg that user send
    if (msglist === 'sendedmsg') {
        return res.json({
            sendedmessages: usermessages.filter((msg) => {
                if (msg.sender === currentuser.email) {
                    return msg
                }
            }) 
        })
    }
    if (!msglist) return res.json({ allmessages: usermessages })
}
const sendFunc = async (req, res) => {
    const sender = req.body.email
    const msgtext = req.body.msg
    const receiver = req.body.receiver
    if (!msgtext || !receiver) return res.send(`please refill messages items again 
        such as receiver and message text`)
    //do we have this receiver in db
    if(await user_schema.exists({email: receiver})) {
        await message_schema.create({
            sender: sender,
            msgtext: msgtext,
            receiver: receiver
        })
        return res.send("your message successfully sended")
    } 
    else {
        return res.send("ther is no user with this email")
    }
}
module.exports = {
    inboxFunc,
    sendFunc
}
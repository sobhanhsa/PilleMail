const message_schema = require('../schemas/message_schema')
const user_schema = require('../schemas/user_schema')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/emailapp')
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
const inboxFunc = async (req, res) => {
    //witch group of msg user requested
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
            sender: req.body.email,
            text: msgtext,
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
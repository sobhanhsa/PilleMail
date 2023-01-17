require('dotenv').config()
const jwt = require('jsonwebtoken')
const accessTokenMaker = (email) => { return jwt.sign(email, process.env.SECRET_TOKEN_ACCESS) }
// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization']
//     console.log(authHeader)
//     const token = authHeader && authHeader.split(' ')[1]
//     if (token == null) return res.status(401).send("please login")
//     console.log(token)
//     jwt.verify(token, process.env.SECRET_TOKEN_ACCESS, (err, emailt) => {
//         if (err) return res.status(403).send("please login again")
//         req.user = emailt
//         next()
//     })
// }
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
// console.log(accessTokenMaker('hassan@zmail.com'))
module.exports = {
    accessTokenMaker,
    TokenAuthenticator
}

//hassan : eyJhbGciOiJIUzI1NiJ9.aGFzc2FuQHptYWlsLmNvbQ.OqEQ66Pe18huwNSs9EJM0N1YKhrYvzmsOqzV2B4Fm8E

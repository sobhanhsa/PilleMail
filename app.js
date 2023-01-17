const path = require('path')
const express = require('express')
const {signUpFunc, loginFunc} = require('./controllers/maincontroller.js')
const app = new express
app.use(express.json())
app.post('/signup',signUpFunc)  
app.post('/login',loginFunc)         
app.listen(8080, () => console.log("server is listennig on 8080 port"))     
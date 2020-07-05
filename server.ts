//Bringing In Express
//npm run devStart
import express, { Request, Response, NextFunction } from 'express'
import { PassThrough } from 'stream'
import { nextTick } from 'process'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

//Will need to replace this with database
const users = []

app.set('view-engine', 'ejs') //Will allow me to use ejs files
app.use(express.urlencoded({ extended: false })) 
//^Access the variable within our post method
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//Setting up my route
app.get('/', checkAuthenticated,(req:Request, res:Response) => {
    res.render('index.ejs', { name: req.user.name })
})

// LOGIN
app.get('/login', checkNotAuthenticated,(req:Request, res:Response) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

// REGISTER
app.get('/register', checkNotAuthenticated, (req:Request, res:Response) => {
    res.render('register.ejs')
})

// Note, Await only allowed inside async function
app.post('/register', checkNotAuthenticated, async(req:Request, res:Response) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
            res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

// LOGOUT
app.delete('/logout', (req:Request, res:Response) => {
    req.logOut()
    res.redirect('/login')
})


/// CHECK AUTHENTICATED USERS MIDDLWARE

function checkAuthenticated(req:Request, res:Response, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

// CHECK NOT AUTHENTICATED
function checkNotAuthenticated(req:Request, res:Response, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}



app.listen(3000)
console.log('Server Has Started');

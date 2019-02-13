const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();

// Connection URL
var url = 'mongodb://localhost/authusers';
mongoose.connect(url);
let db = mongoose.connection;

db.once('open', function(){
    console.log('Connected to MongoDB');
})

db.on('error', function(err){
    console.log(err);
})

let User = require('./userSchema');

app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the API'
   
    });
});

app.get('/api/users', (req, res) => {
    User.find({}, function(err, users){
        res.json({
            users 
        });
    })
});

var cert = fs.readFileSync('private.key');
app.post('/api/users', (req, res) => {
    let newUser = new User({
        first_name: req.first_name,
        last_name:  req.last_name,
        password: req.password,
        memberships: req.memberships
    });
    // save user
    newUser.save((err, user) => {
        if (err) throw err;
        res.json(user);
    });
});

app.post('/api/posts', verifyToken, (req, res) => {
    jwt.verify(req.token, cert,
    (err, authData) => {
        if(err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: "Post created",
                authData
            })
        }
    });
});

app.post('/api/login', (req, res) => {
    jwt.sign({
        "user": req.user
    },
    cert,
    { expiresIn: '60m' },
    (err, token) => {
        res.json({
            token
        });
    })
});

// Verify  Auth Token
function verifyToken(req, res, next) {
    // Get auth header
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        console.log('Auth verified')
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.sendStatus(403);
    }
}

app.listen(
    5000,
    () => console.log('Server started at 5000')
);
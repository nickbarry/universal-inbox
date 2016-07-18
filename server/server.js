'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');

require('./db/db');

/*
** Load local environment variables from .env file where secrets and keys are configured.
*/
let dotenv;
if (!process.env.SESSION_SECRET) { // If it's undefined, then we're running locally
  dotenv = require('dotenv');
  dotenv.load({ path: '.env' });
}

/*
** Route Controllers
*/
const homeController = require('./controllers/home');
const twitterController = require('./controllers/twitter');

/*
** Create Express server.
*/
const app = express();

/*
** Express configuration.
*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: false, // Do not initialize a session until a user is signed in.
  secret: process.env.SESSION_SECRET || dotenv.SESSION_SECRET,
}));
app.use(express.static(path.join(__dirname, '../public')));

/*
** App routes.
*/
app.get('/', homeController.index);
//TODO: fill empty object with username from the request
app.get('/api/twitter', function(req, res) {
  twitterController.findDbTweets({}).then(function(tweets) {
    res.json(tweets);
  });
});

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

// Fetch latest 10 emails and show the snippet

const Gmail = require('node-gmail-api'),
  gmail = new Gmail("ya29.Ci8gA0T1Y4SS_oq9SfBIVvj1F0YyVdnHmI_oVG-VPWO0GoUdRWhNcG-DTgcmU7v_zQ"),
  s = gmail.messages('label:coding', {max: 10});

s.on('data', function (d) {
  console.log('[server.js] Gmail snippet: ', d.snippet);
});

module.exports = app;

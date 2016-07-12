'use strict';

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');

//const db = require('./db/db');

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

const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);

module.exports = app;

'use strict';

exports.index = (req, res) => {
  res.render('home', {
    title: 'Home',
  });
};

'use strict'; //node requires this for the use of 'let'
const twitter = require('./twitter.js');

const getTweets = function () {
  let tweets = [];
  twitter.getTweets('makersquare').then(function (res) { //TODO: don't hardcode username
    tweets = res;
  }
  );
  return tweets;
};

exports.getAllPosts = (req, res) => {
  //res.send(dummyTweets);
  res.send(getTweets());
};


'use strict';

const Twitter = require('twitter');

let client;

// Create block scope for local jshint rules allowing camelcase
{
  /* jshint camelcase: false */
  client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRENT,
    bearer_token: process.env.TWITTER_BEARER_TOKEN,
  });
}

function getTweets(username /*, sinceId */) {
  //prepend all usernames with %40, replacing the @ symbol if provided
  username = username.replace(/^(@|%40)?/, '%40');

  return new Promise(function (resolve, reject) {
    //const query = { q: username, since_id: sinceId };
    client.get('search/tweets', { q: username }, function (error, tweets) {
      if (error) {
        reject(error);
      }

      resolve(tweets);
    });
  });
}

module.exports.getTweets = getTweets;

'use strict';

const mongoose = require('mongoose');

const DB_ADDRESS = process.env.MONGODB_URI || 'mongodb://localhost';
mongoose.connect(DB_ADDRESS + '/universal-inbox');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  console.log('db connected');
});

module.exports = db;

'use strict';

const mongoose = require('mongoose');

//const Mixed = mongoose.Schema.Types.Mixed;

let tweetSchema;
{
  /* jshint camelcase: false */
  tweetSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    created_at: String,
    text: String,
    user: {
      handle: String,
      fullname: String,
    },
  });
}

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;

const mongoose = require('mongoose');
const Mixed = mongoose.Schema.Types.Mixed;

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  auth: {
    twitter: Mixed,
    gmail: Mixed,
    facebook: Mixed,
    linkedin: Mixed,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

const express = require('express');
const postsController = require('../controllers/posts');

const postRoutes = express.Router();

postRoutes.get('/', postsController.getAllPosts);

module.exports = postRoutes;

angular
  .module('universal-inbox', [
    'angularMoment',
    'universal-inbox.router',
    'utility.logger',
    'universal-inbox.PostsFactory',
    'universal-inbox.MainController',
    'universal-inbox.TweetsFactory',
    'ui.router'
  ]);
/*
** This server is for FRONT-END developement only
** Run node (or nodemon) server.js in terminal or console
** This server will server the index.html file and load
** partials views correctly.
** 
** If you run into a CORS issue, run this server and open
** http://localhost:8080 in your browser.
*/
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'dev.index.html')));

const port = process.env.PORT || 8080;

app.listen(port);
console.log('Dev Server now listening on port ' + port);

'use strict';

function MainController(TweetsFactory) {
  const vm = this;

  vm.name = 'Jane';
  vm.username = 'janedone';
  vm.messageBody = 'Look what we have here!';
  vm.dateTime = new Date().toLocaleString();

  // Saving this method when getTweets is a real
  // promise.
  // TweetsFactory.getTweets().then((data) => {
  //   console.log('data: ', data);
  // });


  //const tweets = TweetsFactory.getTweets();

  vm.tweets = TweetsFactory.getTweets();

  /*tweets.forEach(function(tweet) {
    console.log('tweet.text: ', tweet.text);
    console.log('tweet.user.name: ', tweet.user.name);
    console.log('tweet.user.screen_name: @', tweet.user.screen_name);
    console.log('tweet.user.profile_image_url: ', tweet.user.profile_image_url);
    console.log('tweet.user.profile_image_url_https: ', tweet.user.profile_image_url_https);
    console.log('tweet.created_at: ', tweet.created_at);
    // console.log('tweet: ', tweet);
    // console.log('tweet: ', tweet);


  });*/

}

angular
  .module('universal-inbox.MainController', [])
  .controller('MainController', MainController);

MainController.$inject = ['TweetsFactory'];


'use strict';

angular
  .module('universal-inbox.router', ['ui.router'])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('/', {
        url: '/',
        templateUrl: 'app/partials/feed.html',
        controller: 'MainController as vm',
      });

  });

angular.module('universal-inbox.posts', [])
  .controller('PostsController', function (/* $scope, Posts */) {

  });

'use strict';

function PostsFactory(/* $http */) {
  function myCoolFnc() {
    // function body
  }

  return { myCoolFnc };
}

angular
  .module('universal-inbox.PostsFactory', [])
  .factory('PostsFactory', PostsFactory);

// A different method to add dependency injection.
PostsFactory.$inject = ['$http'];

'use strict';

function TweetsFactory($http, logger) {

  function getTweets() {

    /* jshint ignore:start */
    return [{"created_at":"Thu Jul 07 16:40:27 +0000 2016","id":751093533063254000,"id_str":"751093533063254016","text":"Ahhh a new round of greenfield projects at @MakerSquare ATX! https://t.co/nnSl0sPJ6g","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[43,55]}],"urls":[],"media":[{"id":751093520975274000,"id_str":"751093520975273984","indices":[61,84],"media_url":"http://pbs.twimg.com/media/Cmxrk-7UIAAK0ba.jpg","media_url_https":"https://pbs.twimg.com/media/Cmxrk-7UIAAK0ba.jpg","url":"https://t.co/nnSl0sPJ6g","display_url":"pic.twitter.com/nnSl0sPJ6g","expanded_url":"http://twitter.com/amberleyjohanna/status/751093533063254016/photo/1","type":"photo","sizes":{"medium":{"w":1200,"h":900,"resize":"fit"},"small":{"w":680,"h":510,"resize":"fit"},"thumb":{"w":150,"h":150,"resize":"crop"},"large":{"w":2048,"h":1536,"resize":"fit"}}}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://tapbots.com/tweetbot\" rel=\"nofollow\">Tweetbot for iΟS</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":37289216,"id_str":"37289216","name":"Amberley Romo","screen_name":"amberleyjohanna","location":"Austin, TX","description":"Software Developer. Open data enthusiast. Coffee addict. Knitting fiend. Bunny mama. Blog @ amberley.me","url":"http://t.co/BKZjjttKmU","entities":{"url":{"urls":[{"url":"http://t.co/BKZjjttKmU","expanded_url":"http://amberleyromo.com","display_url":"amberleyromo.com","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":533,"friends_count":549,"listed_count":40,"created_at":"Sat May 02 21:40:02 +0000 2009","favourites_count":828,"utc_offset":-14400,"time_zone":"Eastern Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":1495,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"352726","profile_background_image_url":"http://abs.twimg.com/images/themes/theme5/bg.gif","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme5/bg.gif","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/558120275888603137/csJb-IT8_normal.jpeg","profile_image_url_https":"https://pbs.twimg.com/profile_images/558120275888603137/csJb-IT8_normal.jpeg","profile_banner_url":"https://pbs.twimg.com/profile_banners/37289216/1398470194","profile_link_color":"EA7025","profile_sidebar_border_color":"829D5E","profile_sidebar_fill_color":"99CC33","profile_text_color":"3E4415","profile_use_background_image":true,"has_extended_profile":false,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":{"id":"1fa5d78e5cf5f072","url":"https://api.twitter.com/1.1/geo/id/1fa5d78e5cf5f072.json","place_type":"neighborhood","name":"Downtown","full_name":"Downtown, Austin","country_code":"US","country":"United States","contained_within":[],"bounding_box":{"type":"Polygon","coordinates":[[[-97.7567,30.2505491],[-97.7314833,30.2505491],[-97.7314833,30.283936],[-97.7567,30.283936]]]},"attributes":{}},"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Thu Jul 07 03:56:12 +0000 2016","id":750901203916107800,"id_str":"750901203916107776","text":"RT @MakerSquare: This infographic has been favorited by nearly 5000 people:\nHow to Become a Software Engineer\nhttps://t.co/VgW3aAgbkB","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[3,15]}],"urls":[{"url":"https://t.co/VgW3aAgbkB","expanded_url":"http://ow.ly/ZjV6301zhmx","display_url":"ow.ly/ZjV6301zhmx","indices":[110,133]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":705086592860291100,"id_str":"705086592860291072","name":"sayaka","screen_name":"sayacatt5","location":"","description":"","url":"https://t.co/eoDItFBI3K","entities":{"url":{"urls":[{"url":"https://t.co/eoDItFBI3K","expanded_url":"https://note.mu/bobcat","display_url":"note.mu/bobcat","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":61,"friends_count":139,"listed_count":13,"created_at":"Wed Mar 02 17:45:18 +0000 2016","favourites_count":194,"utc_offset":null,"time_zone":null,"geo_enabled":false,"verified":false,"statuses_count":707,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"F5F8FA","profile_background_image_url":null,"profile_background_image_url_https":null,"profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/707948083150106624/N2Me-lcT_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/707948083150106624/N2Me-lcT_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/705086592860291072/1456941112","profile_link_color":"2B7BB9","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":true,"default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweeted_status":{"created_at":"Sat Jun 25 02:35:08 +0000 2016","id":746532148073668600,"id_str":"746532148073668612","text":"This infographic has been favorited by nearly 5000 people:\nHow to Become a Software Engineer\nhttps://t.co/VgW3aAgbkB","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[{"url":"https://t.co/VgW3aAgbkB","expanded_url":"http://ow.ly/ZjV6301zhmx","display_url":"ow.ly/ZjV6301zhmx","indices":[93,116]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://www.hootsuite.com\" rel=\"nofollow\">Hootsuite</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":1195783496,"id_str":"1195783496","name":"MakerSquare","screen_name":"MakerSquare","location":"Austin, SF, LA, NYC","description":"A 3 month full-time school for software engineering. We craft modern software engineers.","url":"http://t.co/NrQ2J04x8s","entities":{"url":{"urls":[{"url":"http://t.co/NrQ2J04x8s","expanded_url":"http://www.makersquare.com","display_url":"makersquare.com","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":8167,"friends_count":2266,"listed_count":278,"created_at":"Tue Feb 19 03:46:19 +0000 2013","favourites_count":6477,"utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":5538,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_banner_url":"https://pbs.twimg.com/profile_banners/1195783496/1418276725","profile_link_color":"164B84","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":false,"has_extended_profile":true,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":3,"favorite_count":7,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},"is_quote_status":false,"retweet_count":3,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Thu Jul 07 00:18:06 +0000 2016","id":750846315634896900,"id_str":"750846315634896896","text":"Have you been to the @makersquare meetup? The next one is on Monday: https://t.co/mFjPsV4ojj","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[21,33]}],"urls":[{"url":"https://t.co/mFjPsV4ojj","expanded_url":"http://j.mp/29jey9w","display_url":"j.mp/29jey9w","indices":[69,92]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://techeventsnetwork.com/\" rel=\"nofollow\">Tech Events Network - Austin</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":182345692,"id_str":"182345692","name":"Austin Tech Events","screen_name":"ATXTechEvents","location":"Austin, TX","description":"Events for developers, technologists, and other geeks in Austin, TX  If I'm missing your event, tweet me!\n\n(We only tweet tech events, not jobs.)","url":"https://t.co/cgMsacwiUr","entities":{"url":{"urls":[{"url":"https://t.co/cgMsacwiUr","expanded_url":"https://techeventsnetwork.com/cities/austin","display_url":"techeventsnetwork.com/cities/austin","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":6124,"friends_count":4038,"listed_count":227,"created_at":"Tue Aug 24 11:35:38 +0000 2010","favourites_count":0,"utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":false,"verified":false,"statuses_count":4630,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"000000","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/639491869559255040/irRbxXJ7_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/639491869559255040/irRbxXJ7_normal.png","profile_banner_url":"https://pbs.twimg.com/profile_banners/182345692/1441302028","profile_link_color":"D02702","profile_sidebar_border_color":"000000","profile_sidebar_fill_color":"000000","profile_text_color":"000000","profile_use_background_image":false,"has_extended_profile":false,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Wed Jul 06 14:39:56 +0000 2016","id":750700816554528800,"id_str":"750700816554528768","text":"#infographic #Howto Become a #Software #Engineer in 5 Stages @MakerSquare https://t.co/Gtk3GunnvJ","truncated":false,"entities":{"hashtags":[{"text":"infographic","indices":[0,12]},{"text":"Howto","indices":[13,19]},{"text":"Software","indices":[29,38]},{"text":"Engineer","indices":[39,48]}],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[61,73]}],"urls":[{"url":"https://t.co/Gtk3GunnvJ","expanded_url":"https://goo.gl/mm0IPB","display_url":"goo.gl/mm0IPB","indices":[74,97]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":2714224490,"id_str":"2714224490","name":"Infographic Portal","screen_name":"infographicport","location":"","description":"An Infographic website that provides infographic listings with short summary on various user friendly topics.\n#infographics #free #portal #infographicportal","url":"https://t.co/CaAIiGPZWB","entities":{"url":{"urls":[{"url":"https://t.co/CaAIiGPZWB","expanded_url":"https://www.infographicportal.com","display_url":"infographicportal.com","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":475,"friends_count":484,"listed_count":72,"created_at":"Thu Aug 07 10:15:34 +0000 2014","favourites_count":9,"utc_offset":null,"time_zone":null,"geo_enabled":false,"verified":false,"statuses_count":771,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/675972605132828673/yV5QqoUu_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/675972605132828673/yV5QqoUu_normal.png","profile_link_color":"0084B4","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Wed Jul 06 13:58:14 +0000 2016","id":750690323769221100,"id_str":"750690323769221120","text":"@MakerSquare (Sorry, to be more specific, that question is for the NYC class, July 11 – August 4).","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[0,12]}],"urls":[]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>","in_reply_to_status_id":750672231425011700,"in_reply_to_status_id_str":"750672231425011712","in_reply_to_user_id":111207099,"in_reply_to_user_id_str":"111207099","in_reply_to_screen_name":"ThunderNixon","user":{"id":111207099,"id_str":"111207099","name":"Stephen Nixon","screen_name":"ThunderNixon","location":"New York City","description":"Ambitious detail junky and aspiring type nerd. Designing UX/UI at @ibmdesign. Lettering on Instagram: @ thundernixon & @ dailydecode","url":"https://t.co/ND2qJHkfVV","entities":{"url":{"urls":[{"url":"https://t.co/ND2qJHkfVV","expanded_url":"http://www.thundernixon.com","display_url":"thundernixon.com","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":684,"friends_count":963,"listed_count":24,"created_at":"Thu Feb 04 04:05:04 +0000 2010","favourites_count":1601,"utc_offset":0,"time_zone":"Casablanca","geo_enabled":true,"verified":false,"statuses_count":8638,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"FFFFFF","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/378800000086952197/00878cde978af03924bebb4e605abfdc.jpeg","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/378800000086952197/00878cde978af03924bebb4e605abfdc.jpeg","profile_background_tile":true,"profile_image_url":"http://pbs.twimg.com/profile_images/686728692064727044/OEQaqUSv_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/686728692064727044/OEQaqUSv_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/111207099/1397175389","profile_link_color":"FF5000","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":false,"has_extended_profile":false,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"lang":"en"},{"created_at":"Wed Jul 06 12:46:21 +0000 2016","id":750672231425011700,"id_str":"750672231425011712","text":"@MakerSquare \n\n1. Who is teaching the upcoming MakerPrep course? \n\n2. Are there still open spots?","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[0,12]}],"urls":[]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":1195783496,"in_reply_to_user_id_str":"1195783496","in_reply_to_screen_name":"MakerSquare","user":{"id":111207099,"id_str":"111207099","name":"Stephen Nixon","screen_name":"ThunderNixon","location":"New York City","description":"Ambitious detail junky and aspiring type nerd. Designing UX/UI at @ibmdesign. Lettering on Instagram: @ thundernixon & @ dailydecode","url":"https://t.co/ND2qJHkfVV","entities":{"url":{"urls":[{"url":"https://t.co/ND2qJHkfVV","expanded_url":"http://www.thundernixon.com","display_url":"thundernixon.com","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":684,"friends_count":963,"listed_count":24,"created_at":"Thu Feb 04 04:05:04 +0000 2010","favourites_count":1601,"utc_offset":0,"time_zone":"Casablanca","geo_enabled":true,"verified":false,"statuses_count":8638,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"FFFFFF","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/378800000086952197/00878cde978af03924bebb4e605abfdc.jpeg","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/378800000086952197/00878cde978af03924bebb4e605abfdc.jpeg","profile_background_tile":true,"profile_image_url":"http://pbs.twimg.com/profile_images/686728692064727044/OEQaqUSv_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/686728692064727044/OEQaqUSv_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/111207099/1397175389","profile_link_color":"FF5000","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":false,"has_extended_profile":false,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"lang":"en"},{"created_at":"Wed Jul 06 06:30:33 +0000 2016","id":750577658543607800,"id_str":"750577658543607808","text":"RT @MakerSquare: MakerSquare is expanding to a 4th campus - in NYC! Get hired as a software engineer in the Big Apple! Apply today:  https:…","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[3,15]}],"urls":[{"url":"https://t.co/n9q7XCWDne","expanded_url":"http://mks.io/apply","display_url":"mks.io/apply","indices":[139,140]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":130917267,"id_str":"130917267","name":"Albrey Preston Brown","screen_name":"AlbreyBrown","location":"Oakland, CA","description":"Co-Founder of @telegraph_edu. Software engineer by trade, entrepreneur by choice. DJ of weddings and other events. #makecodingcoolagain coming soon.","url":"https://t.co/ybVgKjD2ZZ","entities":{"url":{"urls":[{"url":"https://t.co/ybVgKjD2ZZ","expanded_url":"http://www.telegraphacademy.com","display_url":"telegraphacademy.com","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":919,"friends_count":351,"listed_count":105,"created_at":"Thu Apr 08 18:36:10 +0000 2010","favourites_count":8313,"utc_offset":-25200,"time_zone":"Pacific Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":14971,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/748198175618433025/Vcy9EUDs_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/748198175618433025/Vcy9EUDs_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/130917267/1396934968","profile_link_color":"3B94D9","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweeted_status":{"created_at":"Thu Mar 10 15:19:45 +0000 2016","id":707949067439964200,"id_str":"707949067439964161","text":"MakerSquare is expanding to a 4th campus - in NYC! Get hired as a software engineer in the Big Apple! Apply today:  https://t.co/n9q7XCWDne","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[{"url":"https://t.co/n9q7XCWDne","expanded_url":"http://mks.io/apply","display_url":"mks.io/apply","indices":[116,139]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":1195783496,"id_str":"1195783496","name":"MakerSquare","screen_name":"MakerSquare","location":"Austin, SF, LA, NYC","description":"A 3 month full-time school for software engineering. We craft modern software engineers.","url":"http://t.co/NrQ2J04x8s","entities":{"url":{"urls":[{"url":"http://t.co/NrQ2J04x8s","expanded_url":"http://www.makersquare.com","display_url":"makersquare.com","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":8167,"friends_count":2266,"listed_count":278,"created_at":"Tue Feb 19 03:46:19 +0000 2013","favourites_count":6477,"utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":5538,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_banner_url":"https://pbs.twimg.com/profile_banners/1195783496/1418276725","profile_link_color":"164B84","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":false,"has_extended_profile":true,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":11,"favorite_count":17,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},"is_quote_status":false,"retweet_count":11,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Thu Jun 30 18:45:30 +0000 2016","id":748588288089423900,"id_str":"748588288089423873","text":"Code School Career Fair in #Austin on 8/8 w/@devbootcamp @galvanize @TheIronYard @GA @AustinCoding &amp; @MakerSquare!! https://t.co/htpXzh1418","truncated":false,"entities":{"hashtags":[{"text":"Austin","indices":[27,34]}],"symbols":[],"user_mentions":[{"screen_name":"devbootcamp","name":"Dev Bootcamp","id":409369753,"id_str":"409369753","indices":[44,56]},{"screen_name":"galvanize","name":"Galvanize","id":299081229,"id_str":"299081229","indices":[57,67]},{"screen_name":"TheIronYard","name":"The Iron Yard","id":576311383,"id_str":"576311383","indices":[68,80]},{"screen_name":"GA","name":"General Assembly","id":170393291,"id_str":"170393291","indices":[81,84]},{"screen_name":"AustinCoding","name":"AustinCodingAcademy","id":2513341416,"id_str":"2513341416","indices":[85,98]},{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[105,117]}],"urls":[{"url":"https://t.co/htpXzh1418","expanded_url":"https://www.eventbrite.com/e/code-school-career-fair-by-bootcampxchange-tickets-25850256814","display_url":"eventbrite.com/e/code-school-…","indices":[120,143]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com/download/iphone\" rel=\"nofollow\">Twitter for iPhone</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":4776048216,"id_str":"4776048216","name":"BootcampXchange","screen_name":"bootcampxchange","location":"Global","description":"The world's first and only exclusive marketplace for employers & code school students. #CodingBootcamp #CodeSchool","url":"https://t.co/LG0qsH7peb","entities":{"url":{"urls":[{"url":"https://t.co/LG0qsH7peb","expanded_url":"http://www.BootcampXchange.com","display_url":"BootcampXchange.com","indices":[0,23]}]},"description":{"urls":[]}},"protected":false,"followers_count":225,"friends_count":945,"listed_count":60,"created_at":"Mon Jan 18 01:42:36 +0000 2016","favourites_count":239,"utc_offset":null,"time_zone":null,"geo_enabled":false,"verified":false,"statuses_count":487,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"000000","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/692510430246375424/sk_gZEqZ_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/692510430246375424/sk_gZEqZ_normal.png","profile_banner_url":"https://pbs.twimg.com/profile_banners/4776048216/1458048150","profile_link_color":"3B94D9","profile_sidebar_border_color":"000000","profile_sidebar_fill_color":"000000","profile_text_color":"000000","profile_use_background_image":false,"has_extended_profile":false,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Thu Jun 30 16:24:22 +0000 2016","id":748552769456513000,"id_str":"748552769456513024","text":"RT @MakerSquare: Watch MakerSquare CEO Harsh Patel interviewed on Inside Quest!\n\nhttps://t.co/65xrKjTHeW","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[3,15]}],"urls":[{"url":"https://t.co/65xrKjTHeW","expanded_url":"http://ow.ly/uEcr301zfhq","display_url":"ow.ly/uEcr301zfhq","indices":[81,104]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":459053670,"id_str":"459053670","name":"John Michelin","screen_name":"Journey4John","location":"California","description":"Goal: Eat more vegetarians. and do other good stuff, too?","url":null,"entities":{"description":{"urls":[]}},"protected":false,"followers_count":1085,"friends_count":2574,"listed_count":113,"created_at":"Mon Jan 09 07:14:15 +0000 2012","favourites_count":2393,"utc_offset":-25200,"time_zone":"Pacific Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":8163,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/681215430136999936/5KA4IJ-2_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/681215430136999936/5KA4IJ-2_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/459053670/1443852604","profile_link_color":"0084B4","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweeted_status":{"created_at":"Thu Jun 30 16:15:45 +0000 2016","id":748550599952728000,"id_str":"748550599952728064","text":"Watch MakerSquare CEO Harsh Patel interviewed on Inside Quest!\n\nhttps://t.co/65xrKjTHeW","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[{"url":"https://t.co/65xrKjTHeW","expanded_url":"http://ow.ly/uEcr301zfhq","display_url":"ow.ly/uEcr301zfhq","indices":[64,87]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://www.hootsuite.com\" rel=\"nofollow\">Hootsuite</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":1195783496,"id_str":"1195783496","name":"MakerSquare","screen_name":"MakerSquare","location":"Austin, SF, LA, NYC","description":"A 3 month full-time school for software engineering. We craft modern software engineers.","url":"http://t.co/NrQ2J04x8s","entities":{"url":{"urls":[{"url":"http://t.co/NrQ2J04x8s","expanded_url":"http://www.makersquare.com","display_url":"makersquare.com","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":8167,"friends_count":2266,"listed_count":278,"created_at":"Tue Feb 19 03:46:19 +0000 2013","favourites_count":6477,"utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":5538,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_banner_url":"https://pbs.twimg.com/profile_banners/1195783496/1418276725","profile_link_color":"164B84","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":false,"has_extended_profile":true,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":1,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},"is_quote_status":false,"retweet_count":1,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Wed Jun 29 16:43:17 +0000 2016","id":748195143195459600,"id_str":"748195143195459584","text":"RT @MakerSquare: \"Should I attend a code school or a university?\" Here's how to tell.\n\nhttps://t.co/klrCgkkg6R","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[3,15]}],"urls":[{"url":"https://t.co/klrCgkkg6R","expanded_url":"http://thenextweb.com/insider/2015/07/19/code-school-or-university/","display_url":"thenextweb.com/insider/2015/0…","indices":[87,110]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com/download/android\" rel=\"nofollow\">Twitter for Android</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":459053670,"id_str":"459053670","name":"John Michelin","screen_name":"Journey4John","location":"California","description":"Goal: Eat more vegetarians. and do other good stuff, too?","url":null,"entities":{"description":{"urls":[]}},"protected":false,"followers_count":1085,"friends_count":2574,"listed_count":113,"created_at":"Mon Jan 09 07:14:15 +0000 2012","favourites_count":2393,"utc_offset":-25200,"time_zone":"Pacific Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":8163,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/681215430136999936/5KA4IJ-2_normal.jpg","profile_image_url_https":"https://pbs.twimg.com/profile_images/681215430136999936/5KA4IJ-2_normal.jpg","profile_banner_url":"https://pbs.twimg.com/profile_banners/459053670/1443852604","profile_link_color":"0084B4","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"retweeted_status":{"created_at":"Wed Jun 29 16:40:29 +0000 2016","id":748194438296502300,"id_str":"748194438296502272","text":"\"Should I attend a code school or a university?\" Here's how to tell.\n\nhttps://t.co/klrCgkkg6R","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[],"urls":[{"url":"https://t.co/klrCgkkg6R","expanded_url":"http://thenextweb.com/insider/2015/07/19/code-school-or-university/","display_url":"thenextweb.com/insider/2015/0…","indices":[70,93]}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://www.hootsuite.com\" rel=\"nofollow\">Hootsuite</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":1195783496,"id_str":"1195783496","name":"MakerSquare","screen_name":"MakerSquare","location":"Austin, SF, LA, NYC","description":"A 3 month full-time school for software engineering. We craft modern software engineers.","url":"http://t.co/NrQ2J04x8s","entities":{"url":{"urls":[{"url":"http://t.co/NrQ2J04x8s","expanded_url":"http://www.makersquare.com","display_url":"makersquare.com","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":8167,"friends_count":2266,"listed_count":278,"created_at":"Tue Feb 19 03:46:19 +0000 2013","favourites_count":6477,"utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":5538,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_image_url_https":"https://pbs.twimg.com/profile_background_images/440624266422140928/_-ybIj0v.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_image_url_https":"https://pbs.twimg.com/profile_images/542918126111703041/wP1SX3kg_normal.png","profile_banner_url":"https://pbs.twimg.com/profile_banners/1195783496/1418276725","profile_link_color":"164B84","profile_sidebar_border_color":"FFFFFF","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":false,"has_extended_profile":true,"default_profile":false,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":1,"favorite_count":1,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},"is_quote_status":false,"retweet_count":1,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"},{"created_at":"Wed Jun 29 16:19:51 +0000 2016","id":748189245496401900,"id_str":"748189245496401920","text":"Where do @GoogleLocalATX @MakerSquare engineers spend free time? Helping this Austin startup https://t.co/MdXEY5oydU https://t.co/bxDWoT29uY","truncated":false,"entities":{"hashtags":[],"symbols":[],"user_mentions":[{"screen_name":"GoogleLocalATX","name":"Google Local Austin","id":249414790,"id_str":"249414790","indices":[9,24]},{"screen_name":"MakerSquare","name":"MakerSquare","id":1195783496,"id_str":"1195783496","indices":[25,37]}],"urls":[{"url":"https://t.co/MdXEY5oydU","expanded_url":"http://bizj.us/1n5lwk","display_url":"bizj.us/1n5lwk","indices":[93,116]}],"media":[{"id":748189127963619300,"id_str":"748189127963619329","indices":[117,140],"media_url":"http://pbs.twimg.com/media/CmIaDD0UsAEkiGc.jpg","media_url_https":"https://pbs.twimg.com/media/CmIaDD0UsAEkiGc.jpg","url":"https://t.co/bxDWoT29uY","display_url":"pic.twitter.com/bxDWoT29uY","expanded_url":"http://twitter.com/ABJBarr/status/748189245496401920/photo/1","type":"photo","sizes":{"small":{"w":455,"h":305,"resize":"fit"},"thumb":{"w":150,"h":150,"resize":"crop"},"medium":{"w":455,"h":305,"resize":"fit"},"large":{"w":455,"h":305,"resize":"fit"}}}]},"metadata":{"iso_language_code":"en","result_type":"recent"},"source":"<a href=\"http://twitter.com\" rel=\"nofollow\">Twitter Web Client</a>","in_reply_to_status_id":null,"in_reply_to_status_id_str":null,"in_reply_to_user_id":null,"in_reply_to_user_id_str":null,"in_reply_to_screen_name":null,"user":{"id":609315052,"id_str":"609315052","name":"Greg Barr","screen_name":"ABJBarr","location":"","description":"I'm the Managing Editor at Austin Business Journal @myABJ Follow my personal and musical musings @gbrocks","url":"http://t.co/5UkFSX9WmD","entities":{"url":{"urls":[{"url":"http://t.co/5UkFSX9WmD","expanded_url":"http://austinbusinessjournal.com","display_url":"austinbusinessjournal.com","indices":[0,22]}]},"description":{"urls":[]}},"protected":false,"followers_count":1414,"friends_count":409,"listed_count":130,"created_at":"Fri Jun 15 18:06:16 +0000 2012","favourites_count":1054,"utc_offset":-18000,"time_zone":"Central Time (US & Canada)","geo_enabled":true,"verified":false,"statuses_count":6706,"lang":"en","contributors_enabled":false,"is_translator":false,"is_translation_enabled":false,"profile_background_color":"C0DEED","profile_background_image_url":"http://abs.twimg.com/images/themes/theme1/bg.png","profile_background_image_url_https":"https://abs.twimg.com/images/themes/theme1/bg.png","profile_background_tile":false,"profile_image_url":"http://pbs.twimg.com/profile_images/378800000419773182/767c1472465ccaa8d0b1501a310061b7_normal.jpeg","profile_image_url_https":"https://pbs.twimg.com/profile_images/378800000419773182/767c1472465ccaa8d0b1501a310061b7_normal.jpeg","profile_banner_url":"https://pbs.twimg.com/profile_banners/609315052/1408651893","profile_link_color":"0084B4","profile_sidebar_border_color":"C0DEED","profile_sidebar_fill_color":"DDEEF6","profile_text_color":"333333","profile_use_background_image":true,"has_extended_profile":false,"default_profile":true,"default_profile_image":false,"following":null,"follow_request_sent":null,"notifications":null},"geo":null,"coordinates":null,"place":null,"contributors":null,"is_quote_status":false,"retweet_count":0,"favorite_count":0,"favorited":false,"retweeted":false,"possibly_sensitive":false,"lang":"en"}];
    /* jshint ignore:end */
    
    // Since I am still waiting on the data,
    // I am hard coding the response for now.
    return $http({
      method: 'GET',
      url: 'api/tweets'
    }).then(function successCallback(resp) {
      return resp.data;
    }, function errorCallback(resp) {
      logger.logError(resp);
    });
  }

  return {
    getTweets
  };
}

angular
  .module('universal-inbox.TweetsFactory', [])
  .factory('TweetsFactory', TweetsFactory);

  TweetsFactory.$inject = ['$http', 'logger'];

'use strict';

/**
 * @namespace Logger
 * @desc Application wide logger
 * @memberOf Factories
 */
function logger($log) {
  /**
   * @name logError
   * @desc Logs errors
   * @param {String} msg Message to log
   * @returns {String}
   * @memberOf Factories.Logger
   */
  function logError(msg) {
    var loggedMsg = 'Error: ' + msg;
    $log.error(loggedMsg);
    return loggedMsg;
  }

  var service = { logError };
  return service;
}

/**
 * Logger Factory
 * @namespace Factories
 */
angular
  .module('utility.logger', [])
  .factory('logger', logger);

logger.$inject = ['$log'];

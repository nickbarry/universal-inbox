'use strict';
const Twitter = require('twitter');
const DbTweet = require('../models/tweets.js');

let client;
{
  /*jshint camelcase:false*/
  client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRENT,
    bearer_token: process.env.TWITTER_BEARER_TOKEN,
  });
}

function errorCallback(err) {
  if (err) {
    console.log(err);
  }
}

function cacheTweets(username) {

  //get most recent since_id

  DbTweet.findOne({'text': {'$regex': username, '$options': 'i'}})
  .sort('-id_str')
  .exec(function(err, mostRecentTweet) {
    let sinceId;
    if (mostRecentTweet) {
      sinceId = mostRecentTweet.id_str;
    }
    //prepend all usernames with %40, replacing the @ symbol if provided

    username = username.replace(/^(@|%40)?/, '%40');
    const query = { q: username, since_id: sinceId };

      client.get('search/tweets', query, function (error, tweets) {
      if (error) {
        console.log('Error retrieving tweets: ', error);
      } else {
        // console.log('Tweets returned from Twitter module: ', tweets);
        tweets = tweets.statuses;
        for (let t of tweets) {
          const tweet = new DbTweet(t);
          tweet.save(errorCallback);
        }
      }
    });
  });

}

 //TODO: move this initial caching to a more appropriate place in the code.
const username = 'makersquare';
cacheTweets(username);

function findDbTweets(queryObj) {
  return DbTweet.find(queryObj).exec();
}

module.exports.cacheTweets = cacheTweets;
module.exports.findDbTweets = findDbTweets;
module.exports.client = client;

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

//function errorCallback(err) {
//  if (err) {
//    console.log(err);
//  }
//}

function cacheTweets(username, sinceId) {
  //prepend all usernames with %40, replacing the @ symbol if provided
  username = username.replace(/^(@|%40)?/, '%40');
  const query = { q: username, since_id: sinceId };

  client.get('search/tweets', query, function (error, tweets) {
    if (error) {
      console.log('Error retrieving tweets: ', error);
    } else {
      //console.log('Tweets returned from Twitter module: ', tweets);
      tweets = tweets.statuses;
      DbTweet.find().exec(function (err /* , cachedTweets */) {
        if (err) {
          console.error(err);
        }

        // console.log('tweets is', cachedTweets)
      });

      //for (let t of tweets) {
      //  //const tweet = new DbTweet(t);
      //  //tweet.save(errorCallback);
      //
      //  // DbTweet.findOneAndUpdate({ id_str: t.id_str }, t, { upsert: true })
      //  //   .exec(errorCallback);
      //
      //  //if (DbTweet.findOne({id_str: t.id_str})) {
      //  //  //console.log("skipping", t)
      //  //  continue;
      //  //}
      //
      //}
    }
  });
}

cacheTweets('makersquare');
function findDbTweets(queryObj) {
  return DbTweet.find(queryObj).exec();
}

module.exports.cacheTweets = cacheTweets;
module.exports.findDbTweets = findDbTweets;
module.exports.client = client;

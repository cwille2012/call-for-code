const request = require('request');
const Twitter = require('twitter');
const secret = require('./twitter-config.js');

const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:twitter');

var client = new Twitter(secret);
var twitterHandle = 'damage_portal';

client.stream('statuses/filter', { track: twitterHandle }, (stream) => {
    log('Listening for tweets');
    stream.on('data', function (event) {
        parseTweetData(event);
    });

    stream.on('error', function (error) {
        log(error);
    });
});

function parseTweetData(tweet) {
    if (tweet.coordinates || tweet.place) {
        var coords = [0, 0];
        
        if (tweet.coordinates === null) {
            if (tweet.place.bounding_box.type !== 'Polygon') {
                coords[0] = tweet.place.bounding_box.coordinates[0];
                coords[1] = tweet.place.bounding_box.coordinates[1];
            }
            else {
                tweet.place.bounding_box.coordinates[0].forEach(function (element) {
                    coords[0] += element[0] / 4;
                    coords[1] += element[1] / 4;     
                });
            }
        }
        else {
            coords = tweet.coordinates.coordinates;
        }

        var photoURL = 'https://i.amz.mshcdn.com/5SJmdx7OOe8cUG2hrCh5QNxOaLg=/950x534/filters:quality(90)/2012%2F12%2F04%2Fc1%2Fviralvideos.bD3.jpg';
        if (tweet.entities.hasOwnProperty('media')) {
            photoURL = tweet.entities.media[0].media_url;
            
        }

        log('New twitter image received: ' + photoURL);
        log(coords);

        
        var options = { 
            method: 'GET',
            url: 'https://gateway.watsonplatform.net/visual-recognition/api/v3/classify',
            qs: {
                url: photoURL,
                version: '2018-03-19' 
            },
            headers: {
                'Postman-Token': 'ebb43018-b62f-412f-9a5b-0f3de3dcdbf5',
                'Cache-Control': 'no-cache',
                Authorization: 'Basic YXBpa2V5OkFLOXZVMy1PNmhyZ05LUE05bExndDBLSEk2cjFVdjJlb1ZoNkl6OVowblpJ' 
            }
        };

        request(options, function (error, response, body) {
            if (error) {
                log(error);
            } else {
                var classifiers = [];
                body = JSON.parse(body);
                var classes = body.images[0].classifiers[0].classes;
                for (var i in classes) {
                    if (classes[i].score > 0.75) {
                        classifiers.push({
                            class: classes[i].class,
                            score: classes[i].score
                        });
                    }
                }

                var tweetData = {
                    type: 'tweet',
                    date: tweet.created_at,
                    user: tweet.user.screen_name,
                    message: tweet.text,
                    img: photoURL,
                    coordinates: [coords[1], coords[0]],
                    classifiers: classifiers
                };
        
                DM.saveTweetData(tweetData, function (err, tweetID) {
                    if (err) {
                        log(err);
                    } else {
                        log('Tweet data saved');
                        var tweetFinal = "@" + tweet.user.screen_name + ", thank you for the tip, we will analyse and investigate if nescessary. Incident ID: " + tweetID;
                        client.post('statuses/update', { status: tweetFinal }, function (error, tweet, response) {
                            if (error) {
                                log(error);
                            }
                            
                        });
                    }
                });
            }
        });
    }
    else {
        log('Tweet received but no location given');
        var tweetFinal = "@" + tweet.user.screen_name + " enable location services please and tweet again! Incident ID: " + makeid();
        client.post('statuses/update', { status: tweetFinal }, function (error, tweet, response) { //posts the response
            if (error) {
                log(error);
            }
            else {
                
            }
        });
    }
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 28; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }
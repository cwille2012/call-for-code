//TODO: Add token timeout to enviornmental variables
//TODO: Remove unused functions

//DATABASE_URL='mongodb://localhost/esp8266server'

const crypto = require('crypto');
const log = require('debug')('MAPENGINE:database');

const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const EM = require('./email-dispatcher');
const WM = require('./weather-manager');

let DB;

let tokenCollection;
let userCollection;
let pointCollection;
let jobCollection;
let droneCollection;
let tweetCollection;
let baseCollection;
let dabCollection;

var max_user_tokens = 0; //0=infinite
if (!process.env.MAX_USER_TOKENS) {
    log('Warning: No "MAX_USER_TOKENS" limit set!');
} else if (isNaN(process.env.MAX_USER_TOKENS)) {
    log('Invalid environmental variable: "MAX_USER_TOKENS"!');
    log('"MAX_USER_TOKENS" must be a number');
    process.exit(1);
  } else {
    max_user_tokens = process.env.MAX_USER_TOKENS++; //+1 because logged in token
}

var session_timeout = 60; //default to 1hr
if (!process.env.SESSION_TIMEOUT) {
    log('Warning: No "SESSION_TIMEOUT" time set!');
} else if (isNaN(process.env.SESSION_TIMEOUT)) {
    log('Invalid environmental variable: "SESSION_TIMEOUT"!');
    log('"SESSION_TIMEOUT" must be a number');
    process.exit(1);
  } else {
    session_timeout = process.env.SESSION_TIMEOUT;
}

if (!process.env.DATABASE_URL) {
    log('Missing environmental variable: "DATABASE_URL"!');
    process.exit(1);
}

MongoClient.connect(process.env.DATABASE_URL).then(db => {
    log('Connected to mongodb');
    DB = db;
    tokenCollection = db.collection('tokens');
    userCollection = db.collection('users');
    pointCollection = db.collection('points');
    jobCollection = db.collection('jobs');
    droneCollection = db.collection('drones');
    tweetCollection = db.collection('tweets');
    baseCollection = db.collection('bases');
    dabCollection = db.collection('dabs');
}).catch(err => {
    log('Error connecting to mongodb!');
    log(err);
    process.exit(1);
});

/**************************************************API STUFF**************************************************************/

exports.saveDabData = (data, callback) => {
    dabCollection.insert(data, function(err, docsInserted){
        if (err) {
            log(err);
            return callback('database-error');
        } else {
            log('DAB update received')
            callback(null, docsInserted.ops[0]._id);
        }
    });
}

exports.getDabData = (callback) => {
    dabCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            callback(null, res);
        }
    });
}

exports.savePhoneData = (data, callback) => {
    var phoneData = null;
    if (!!data.lat && !!data.long && !!data.object && !!data.source && !!data.type) {
        if (data.type == 'call') {
            phoneData = {
                type: data.type,
                date: formatEpoch(Number(Date.now())),
                number: data.source,
                message: data.rawtext,
                audio: data.raw,
                coordinates: [Number(data.lat), Number(data.long)],
                classifiers: data.object
            };
        } else if (data.type == 'text') {
            phoneData = {
                type: data.type,
                date: formatEpoch(Number(Date.now())),
                number: data.source,
                message: data.rawtext,
                coordinates: [Number(data.lat), Number(data.long)],
                classifiers: data.object
            };
        } else {
            callback('invalid-type');
        }
    } else {
        callback('invalid-parameters');
    }
    if(!!phoneData) {
        tweetCollection.insert(phoneData, function(err, docsInserted){
            if (err) {
                log(err);
                return callback('database-error');
            } else {
                log('Message received from: ' + phoneData.number)
                callback(null, docsInserted.ops[0]._id)
            }
        });
    } else {
        callback('invalid-data');
    }
}
function formatEpoch(epoch) {
    var date = String(new Date(parseInt(epoch)));
    date = date.substring(3, date.indexOf('GMT')-4);
    return(date)
}

/*************************************************BASE STUFF**************************************************************/

exports.saveBaseData = (data, callback) => {
    baseCollection.insert(data, function(err, docsInserted){
        if (err) {
            log(err);
            return callback('database-error');
        } else {
            callback(null, docsInserted.ops[0]._id)
        }
    });
}

exports.getBaseData = (callback) => {
    baseCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            callback(null, res);
        }
    });
}

exports.getBaseByID = (id, callback) => {
    baseCollection.findOne({ '_id': new ObjectId(id) }, (err, base) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            return callback(null, base);
        }
    });
}

exports.updateBaseData = (id, name, lat, long, capacity, callback) => {
    var newvalues = { $set: {name: name, lat: lat, long: long, capacity: capacity} };
    baseCollection.updateOne({ '_id': new ObjectId(id) }, newvalues, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }

        return callback(null, obj);
    });
}

exports.removeBaseData = (id, callback) => {
    baseCollection.remove({ '_id': new ObjectId(id) }, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }

        return callback(null);
    });
}


/*************************************************TWEET STUFF**************************************************************/

//calculate distance to nearest base station
exports.saveTweetData = (data, callback) => {
    tweetCollection.insert(data, function(err, docsInserted){
        if (err) {
            log(err);
            return callback('database-error');
        } else {
            callback(null, docsInserted.ops[0]._id)
        }
    });
}

exports.getTweetData = (callback) => {
    tweetCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            callback(null, res)
        }
    });
}

exports.getTweetDataById = (id, callback) => {
    tweetCollection.findOne({ '_id': new ObjectId(id) }, (err, tweet) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            return callback(null, tweet);
        }
    });
}

exports.removeTweetData = (id, callback) => {
    tweetCollection.remove({ '_id': new ObjectId(id) }, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }

        return callback(null);
    });
}

exports.queueTweetData = (id, callback) => {
    tweetCollection.findOne({ '_id': new ObjectId(id) }, (err, tweet) => {
        if (err) {
            log(err);
            return callback('database-error');
        } else {
            WM.getWeather(Number(tweet.coordinates[0]), Number(tweet.coordinates[1]), function (err, weather) {
                if (Number(weather.current.wspd) > 20) {
                    callback('Current wind above threshold! (Currently ' + weather.current.wspd + ' mph)');
                } else {
                    var pointData = {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [Number(tweet.coordinates[0]), Number(tweet.coordinates[1])]
                        },
                        "properties": {
                            "title": 'Tweet ' + tweet._id,
                            "height": 10,
                            "action": 'flyover',
                            "icon": 'triangle'
                        }
                    };
                    var pointLayer = {
                        "id": tweet._id,
                        "type": "symbol",
                        "source": {
                            "type": "geojson",
                            "data": {
                                "type": "FeatureCollection",
                                "features": [pointData]
                            }
                        },
                        "layout": {
                            "icon-image": "{icon}-15",
                            "icon-allow-overlap": true,
                            "text-field": "{title}",
                            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                            "text-offset": [0, 0.6],
                            "text-anchor": "top"
                        }
                    };
                    var jobData = {
                        pointLayer: [pointLayer],
                        lineLayer: null,
                        name: String('Tweet from ' + tweet.user),
                        description: String('Tweet: ' + tweet.message),
                        classifiers: tweet.classifiers,
                        distance: String('0 kilometers (point)'),
                        status: 'queueing',
                        weather: weather
                    };
                    jobCollection.insert(jobData, { safe: true }, (err, tweet) => {
                        if (err) {
                            log(err);
                            callback('database-error');
                        } else {
                            tweetCollection.remove({ '_id': new ObjectId(id) }, { safe: true }, function (err, obj) {
                                if (err) {
                                    log(err);
                                    return callback('database-error');
                                }
                    
                                return callback(null);
                            });
                        }

                    });
                }
            }); 
        }
    });
}


/***************************************************JOB STUFF**************************************************************/

exports.getAllJobs = (callback) => {
    jobCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        }

        var jobs = {
            saved: [],
            queue: [],
            requested: []
        };
        for (var i in res) {
            if (res[i].status == 'saved') {
                jobs.saved.push(res[i]);
            } else if (res[i].status == 'queueing') {
                jobs.queue.push(res[i]);
            }
        }

        tweetCollection.find({}, {}).toArray((err, res) => {
            if (err) {
                log(err);
                return callback(err);
            } else {
                for (var i in res) {
                    jobs.requested.push(res[i]);
                }
                callback(null, jobs);
            }
        });
    });
}

exports.updateJobStatus = (id, status, callback) => {
    if (status == 'delete') {
        jobCollection.remove({ '_id': new ObjectId(id) }, { safe: true }, function (err, obj) {
            if (err) {
                log(err);
                return callback('database-error');
            }

            return callback(null);
        });
    } else {
        var newvalues = { $set: {status: status} };
        jobCollection.updateOne({ '_id': new ObjectId(id) }, newvalues, { safe: true }, function (err, obj) {
            if (err) {
                log(err);
                return callback('database-error');
            }

            return callback(null, obj);
        });
    }
}

exports.getJobDataById = (id, callback) => {
    jobCollection.findOne({ '_id': new ObjectId(id) }, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }

        return callback(null, obj);
    });
}





/*************************************************DRONE STUFF**************************************************************/


exports.getAllDrones = (callback) => {
    droneCollection.find({}, {}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        }

        callback(null, res);
    });
}

exports.getDroneByID = (id, callback) => {
    droneCollection.findOne({ '_id': new ObjectId(id) }, (err, drone) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            return callback(null, drone);
        }
    });
}


exports.connectDrone = (name, ip, mac, callback) => {
    
    droneCollection.findOne({ name: name }, (err, drone) => {
        if (err) {
            log(err);
            return callback(err);
        } else if (!!drone) {
            return callback('name-exists')
        } else {
            droneCollection.findOne({ ip: ip }, (err, drone) => {
                if (err) {
                    log(err);
                    return callback(err);
                } else if (!!drone) {
                    return callback('ip-exists')
                } else {
                    droneCollection.findOne({ mac: mac }, (err, drone) => {
                        if (err) {
                            log(err);
                            return callback(err);
                        } else if (!!drone) {
                            return callback('macaddress-exists')
                        } else {
                            var droneData = {
                                name: name,
                                ip: ip,
                                mac: mac,
                                lat: null,
                                long: null,
                                altitude: null,
                                currentJob: 'none',
                                nextJob: 'none',
                                battery: null,
                                status: 'not connected',
                                lastUpdate: null
                            }
                            droneCollection.insert(droneData, { safe: true }, callback);
                        } 
                    });
                } 
            });
        } 
    });
}

exports.updateDrone = (id, name, ip, mac, callback) => {
    var newvalues = { $set: {name: name, ip: ip, mac: mac} };
    droneCollection.updateOne({ '_id': new ObjectId(id) }, newvalues, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }

        return callback(null, obj);
    });
}

exports.removeDrone = (id, callback) => {
    droneCollection.remove({ '_id': new ObjectId(id) }, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }

        return callback(null);
    });
}




/*************************************************MAP STUFF**************************************************************/

exports.savePointData = (data, callback) => {
    if (!data.lon || !data.lat || !data.name || !data.type) return callback('invalid-parameters');

    var icon = "triangle";
    if (data.type == 'emergency') {
        icon = "fire-station";
    } else if (data.type == 'interest') {
        icon = "triangle";
    }

    var pointData = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [Number(data.lon), Number(data.lat)]
        },
        "properties": {
            "title": data.name || 'not defined',
            "date": Number(new Date().getTime()),
            "icon": icon
        }
    }

    pointCollection.insert(pointData, { safe: true }, callback);
}

exports.getPointLayer = (callback) => {
    pointCollection.find({},{_id: 0}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            var layerData = {
                "id": "points",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": res
                    }
                },
                "layout": {
                    "icon-image": "{icon}-15",
                    "icon-allow-overlap": true,
                    "text-field": "{title}",
                    "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                    "text-offset": [0, 0.6],
                    "text-anchor": "top"
                }
            };
            return callback(null, layerData);
        }
    });
}

exports.saveJobData = (data, callback) => {
    if (!data.pointLayer || !data.lineLayer || !data.name || !data.description || !data.distance) return callback('invalid-parameters');

    var jobData = {
        name: data.name,
        description: data.description,
        distance: data.distance,
        status: 'saved',
        pointLayer: data.pointLayer,
        lineLayer: data.lineLayer
    };

    jobCollection.insert(jobData, { safe: true }, callback);
    //callback()
}

exports.getJobLayers = (callback) => {
    jobCollection.find({},{_id: 0}).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        } else {
            return callback(null, res);
        }
    });
}





/*************************************************LOGIN/ACCOUNT STUFF******************************************************/


exports.login = (email, password, callback) => {
    if (!email || !password) return callback('invalid-parameters');

    userCollection.findOne({ email: email }, (err, obj) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (!obj) return callback('not-found');
        if (obj.emailVerified != true) return callback('not-verified');

        validatePassword(password, obj.password, (err, response) => {
            if (err) {
                log(err);
                return callback('validate-error');
            }
            if (!response) return callback('invalid-password');
            saveToken(obj.email, session_timeout, (err, token) => {
                if (err) {
                    log(err);
                    return callback(err);
                }

                var data = {session: token, access: obj.access}
                return callback(null, data);
            });
        });
    });
}

/* Functions for retrieving users */

exports.getAllUsers = (callback) => {
    userCollection.find().toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        }

        return callback(null, res);
    });
}

exports.getUser = (email, callback) => {
    if (email.includes('@') && email.includes('.')) {
        userCollection.findOne({ email: email }, (err, obj) => {
            if (err) {
                log(err);
                return callback(err);
            }

            return callback(null, obj);
        });
    } else {
        userCollection.findOne({ '_id': new ObjectId(email) }, (err, user) => {
            if (err) {
                log(err);
                return callback(err);
            }
    
            return callback(null, user);
        });
    }
}

exports.getUserBySession = (token, callback) => {
    tokenCollection.findOne({ token: token }, (err, obj) => {
        if (err) {
            log(err);
            return callback(err);
        }

        userCollection.findOne({ '_id': new ObjectId(obj.id) }, (err, user) => {
            if (err) {
                log(err);
                return callback(err);
            }
    
            return callback(null, user);
        });
    });
}

exports.getMiddlewareBySession = (token, callback) => {
    tokenCollection.findOne({ token: token }, (err, tokenObject) => {
        if (err) {
            log(err);
            return callback('not-found');
        } else if (!!tokenObject) {
            userCollection.findOne({ '_id': new ObjectId(tokenObject.id) }, (err, userObject) => {
                if (err) {
                    log(err);
                    return callback('database-error');
                } else if (!!userObject) {
                    if (tokenObject.timeout != 0) {
                        if (tokenObject.timeout > Number(Date.now())) {
                            tokenObject.timeout = Number(Date.now()) + Number(60000 * session_timeout);
                            tokenCollection.save(tokenObject, { safe: true }, (err) => {
                                if (err) {
                                    log(err);
                                    return callback('database-error');
                                } else {
                                    var returnObject = {
                                        token: String(tokenObject.token),
                                        access: String(tokenObject.access),
                                        id: String(userObject._id),
                                    }
                                    return callback(null, returnObject);
                                }
                            });
                        } else {
                            if (!token) throw new Error(`Token is: ${token}`);
                            tokenCollection.remove({ token: token }, (err) => {
                                if (err) {
                                    log(err);
                                    return callback('database-error');
                                } else {
                                    return callback('token-timeout');
                                }
                            });
                        }
                    } else {
                        if (tokenObject.access == 'api') {
                            var returnObject = {
                                token: String(tokenObject.token),
                                access: String(tokenObject.access),
                                id: String(userObject._id),
                            }
                            return callback(null, returnObject);
                        } else {
                            tokenCollection.remove({ token: token }, (err) => {
                                if (err) {
                                    log(err);
                                    return callback('database-error');
                                } else {
                                    return callback('invalid-token'); //if timeout=0 access must be api
                                }
                            });
                        }
                    }
                } else {
                    tokenCollection.remove({ token: token }, (err) => {
                        if (err) {
                            log(err);
                            return callback('database-error');
                        } else {
                            return callback('not-found');
                        }
                    });
                }
            });
        } else {
            return callback('not-found');
        }
    });
}

/* Functions for removing users */

exports.removeUser = (email, callback) => {
    if (!email) throw new Error(`Email is: ${email}`);
    userCollection.remove({ email: email }, (err) => {
        if (err) {
            log(err);
            return callback(err);
        }

        return callback(null);
    });
}

/* Functions for adding users */

exports.newUser = (email, password, firstname, lastname, callback) => {
    if (!email || !password || !firstname || !lastname) return callback('invalid-parameters');
    
    email = email.toLowerCase();
    userCollection.find().toArray((err, currentUsers) => {
        if (err) {
            log(err);
            return callback(err);
        }
        if (currentUsers.length > 0) {
            if (currentUsers.filter(function(user) { return user.email === email; }).length > 0) {
                return callback('email-taken');
            }
        }
        var access = 'user';
        if (currentUsers.length == 0) {
            access = 'admin';
        }
        var emailVerified = true;
        if (process.env.VALIDATE_EMAIL) {
            emailVerified = false;
        }
        saltAndHash(password, (hash) => {
            var newUserData = {
                email: email,
                password: hash,
                firstname: firstname,
                lastname: lastname,
                access: access,
                phone: null,
                address1: null,
                address2: null,
                city: null,
                state: null,
                zipcode: null,
                emailVerified: emailVerified,
                passwordReset: false
            }
            if (process.env.VALIDATE_EMAIL) {
                EM.dispatchEmailConfirmation(newUserData, (err, m) => {
                    if (err) {
                        log(err);
                        return callback('email-dispatch-failed');
                    }

                    userCollection.insert(newUserData, { safe: true }, callback);
                });
            } else {
                userCollection.insert(newUserData, { safe: true }, callback);
            }
        });   
    });
}


/* Functions for editing users */

exports.updateUser = function (email, firstname, lastname, phone, address1, address2, city, state, zipcode, callback) {
    if (!!email && !!firstname && !!lastname && !!phone && !!address1 && !!address2 && !!city && !!state && !!zipcode) {
        if (email == 'null'){
            email == null;
        }
        if (firstname == 'null'){
            firstname == null;
        }
        if (lastname == 'null'){
            lastname == null;
        }
        if (phone == 'null'){
            phone == null;
        }
        if (address1 == 'null'){
            address1 == null;
        }
        if (address2 == 'null'){
            address2 == null;
        }
        if (city == 'null'){
            city == null;
        }
        if (state == 'null'){
            state == null;
        }
        if (zipcode == 'null'){
            zipcode == null;
        }
        var newvalues = { $set: {firstname: firstname, lastname: lastname, phone: phone, address1: address1, address2: address2, city: city, state: state, zipcode: zipcode} };
        userCollection.updateOne({ email: email }, newvalues, { safe: true }, function (err, obj) {
            if (err) {
                log(err);
                return callback('database-error');
            }
        
            return callback(null, obj);
        });
    } else {
        callback('invalid-parameters');
    }
}

//still used?
exports.updateAccess = function (email, access, callback) {
    var newvalues = { $set: {access: access } };
    userCollection.updateOne({ email: email }, newvalues, { safe: true }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }
    
        return callback(null, obj);
    });
}


/* Password reset and email verification functions */

exports.enablePasswordReset = (email, callback) => {
    userCollection.findOne({ email: email }, (err, obj) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (obj == null) {
            return callback('not-found');
        }
        if (obj.emailVerified == false) {
            return callback('not-verified');
        }

        obj.passwordReset = Number(Date.now() + 3600000);//epoch in one hour
        EM.dispatchResetPasswordLink(obj, (err) => {
            if (err) {
                log(err);
                return callback('email-dispatch-error');
            }

            userCollection.save(obj, { safe: true }, (err, obj) => {
                if (err) {
                    log(err)
                    return callback('database-error');
                }

                return callback(null, obj);
            });

        });
    });
}

exports.resetPassword = (email, newPass, oldPass, callback) => {
    userCollection.findOne({ email: email }, (err, obj) => {
        if (err) {
            log(err);
            return callback(err, null);
        }
        if (obj == null) {
            return callback('not-found');
        }
        if (obj.password != oldPass || obj.passwordReset == false) callback('invalid-reset-link');

        if (obj.passwordReset > Number(Date.now())) {
            saltAndHash(newPass, (hash) => {
                obj.password = hash;
                obj.passwordReset = false;
                userCollection.save(obj, { safe: true }, callback);
            });
        } else {
            obj.passwordReset = false;
            userCollection.save(obj, { safe: true }, (err) => {
                if (err) {
                    log(err);
                    return callback(err, null);
                }
                callback('reset-link-timeout');
            });
        }
    });
}

exports.verifyEmail = (email, hashedpass, callback) => {
    userCollection.findOne({ email: email }, (err, obj) => {
        if (err) {
            log(err);
            callback('database-error');
        }
        if (obj == null) {
            return callback('not-found');
        }
        if (obj.emailVerified == true) {
            return callback('already-verified');
        }
        if (hashedpass != obj.password) return callback('invalid-link');

        obj.emailVerified = true;
        userCollection.save(obj, { safe: true }, (err) => {
            if (err) {
                log(err);
                return callback('database-error');
            }

            return callback(null, obj);
        });

    });
}

exports.resendEmailVerification = function (email, password, callback) {
    userCollection.findOne({ email: email }, (err, user) => {
        if (err) {
            log(err);
            return callback(err, null);
        }
        if (user == null) {
            return callback('not-found');
        }
        if (user.emailVerified) {
            return callback('already-verified');
        }

        var salt = user.password.substr(0, 10);
        var validHash = salt + md5(password + salt);
        if (validHash === user.password) {
            if (process.env.VALIDATE_EMAIL) {
                EM.dispatchEmailConfirmation(user, (err, m) => {
                    if (err) {
                        log(err);
                        callback('email-dispatch-failed');
                    } else {
                        callback(null, 'success');
                    }
                });
            } else {
                return callback('not-required');
            }
        } else {
            return callback('invalid-password');
        }
    });
}

/*************************************************TOKEN STUFF**********************************************************/


exports.validateSession = (token, callback) => {
    tokenCollection.findOne({ token: token }, (err, tokenObj) => {//FIX: Something causing error here!! Error below for reference
        if (err) {
            log(err)
            return callback('database-error');
        }
        if (!tokenObj) return callback('invalid-token');
        if (tokenObj.token != token) return callback('invalid-token');

        if (tokenObj.timeout != 0) {
            if (tokenObj.timeout > Number(Date.now())) {
                tokenObj.timeout = Number(Date.now()) + Number(60000 * session_timeout);
                tokenCollection.save(tokenObj, { safe: true }, (err) => {
                    if (err) {
                        log(err);
                        return callback('database-error');
                    }

                    return callback(null, token);
                });
            } else {
                if (!token) throw new Error(`Token is: ${token}`);
                tokenCollection.remove({ token: token }, (err) => {
                    if (err) {
                        log(err);
                        return callback('database-error');
                    }

                    return callback('token-timeout');
                });
            }
        } else {
            if (tokenObj.access == 'api') {
                return callback(null, token);
            } else {
                return callback('invalid-token'); //if timeout is 0 then access must be api
            }
        }
    });
}

/*
TypeError: Cannot read property 'findOne' of undefined
    at Object.exports.validateSession (/Users/chris1/Documents/Git Repositories/CHARR-V2/server/modules/database-manager.js:564:20)
    at Server.<anonymous> (/Users/chris1/Documents/Git Repositories/CHARR-V2/server/modules/socket-manager.js:54:16)
    at emitOne (events.js:96:13)
    at Server.emit (events.js:188:7)
    at Server.handshake (/Users/chris1/Documents/Git Repositories/CHARR-V2/node_modules/engine.io/lib/server.js:338:8)
    at /Users/chris1/Documents/Git Repositories/CHARR-V2/node_modules/engine.io/lib/server.js:232:12
    at Server.verify (/Users/chris1/Documents/Git Repositories/CHARR-V2/node_modules/engine.io/lib/server.js:167:36)
    at Server.handleRequest (/Users/chris1/Documents/Git Repositories/CHARR-V2/node_modules/engine.io/lib/server.js:222:8)
    at Server.<anonymous> (/Users/chris1/Documents/Git Repositories/CHARR-V2/node_modules/engine.io/lib/server.js:467:14)
    at emitTwo (events.js:106:13)
*/

exports.validateSessionAdmin = (token, callback) => {
    tokenCollection.findOne({ token: token }, (err, tokenObj) => {
        if (err) {
            log(err)
            return callback('database-error');
        }
        if (!tokenObj) return callback('invalid-token');
        if (tokenObj.token != token) return callback('invalid-token');

        if (tokenObj.timeout > Number(Date.now())) {
            if (tokenObj.access == 'admin') {
                tokenObj.timeout = Number(Date.now()) + Number(60000 * session_timeout);
                tokenCollection.save(tokenObj, { safe: true }, (err) => {
                    if (err) {
                        log(err)
                        return callback('database-error');
                    }

                    callback(null, token);
                });
            } else {
                return callback('not-authorized');
            }
        } else {
            if (!token) throw new Error(`Token is: ${token}`);
            tokenCollection.remove({ token: token }, (err) => {
                if (err) {
                    log(err)
                    return callback('database-error');
                }

                return callback('token-timeout');
            });
        }
    });
}

exports.newToken = (session, password, callback) => {
    sessionLookup(session, (err, user) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (!user) {
            return callback('token-error');
        } else {
            var salt = user.password.substr(0, 10);
            var validHash = salt + md5(password + salt);
            if (validHash === user.password) {
                tokenCollection.find({ id: user._id }).toArray((err, tokenObj) => {
                    if (err) {
                        log(err);
                        return callback(err);
                    } else if (!!tokenObj) {
                        if (max_user_tokens == 0) {
                            saveToken(user.email, 1, (err, token) => {
                                if (err) {
                                    log(err);
                                    return callback(err);
                                }
            
                                callback(null, token);
                            });
                        } else {
                            if (tokenObj.length > max_user_tokens) {
                                callback('max-tokens-exceeded');
                            } else {
                                saveToken(user.email, 1, (err, token) => {
                                    if (err) {
                                        log(err);
                                        return callback(err);
                                    }
                
                                    callback(null, token);
                                });
                            }
                        }
                    } else {
                        saveToken(user.email, 1, (err, token) => {
                            if (err) {
                                log(err);
                                return callback(err);
                            }
        
                            callback(null, token);
                        });
                    }
                });
            } else {
                callback('invalid-password');
            }
        }
    });
}

exports.clearTokens = (session, password, callback) => {
    sessionLookup(session, (err, user) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (user == null) {
            return callback('token-error');
        } else {
            var salt = user.password.substr(0, 10);
            var validHash = salt + md5(password + salt);
            if (validHash === user.password) {
                tokenCollection.find({ id: user._id }).toArray((err, tokenObj) => {
                    if (err) {
                        log(err);
                        return callback(err);
                    }

                    for (var i in tokenObj) {
                        if (tokenObj[i].timeout == 0 || tokenObj[i].timeout < Number(Date.now())) {
                            tokenCollection.remove({ token: tokenObj[i].token }, (err) => {
                                if (err) {
                                    log(err);
                                    return callback('database-error-3');
                                }
                            });
                        }
                    }
                    callback(null, 'success');
                });
            } else {
                callback('invalid-password');
            }
        }
    });
}

exports.getAllTokens = (callback) => {
    tokenCollection.find({}, { _id: 0 }).toArray((err, res) => {
        if (err) {
            log(err);
            return callback(err);
        }

        callback(null, res);
    });
}

exports.endSession = (token, callback) => {
    tokenCollection.findOne({ token: token }, (err, tokenObj) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (!tokenObj) return callback(null, 'session-ended');
        if (!tokenObj.token) throw new Error(`Token is: ${tokenObj.token}`);
        tokenCollection.remove({ token: tokenObj.token }, (err) => {
            if (err) {
                log(err)
                return callback('database-error');
            }

            callback(null, 'session-ended');
        });
    });
}

/* Private encryption and validation methods */

var generateSalt = () => {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
}

var md5 = (str) => {
    return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = (pass, callback) => {
    var salt = generateSalt();
    return callback(salt + md5(pass + salt));
}

var validatePassword = (plainPass, hashedPass, callback) => {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    return callback(null, hashedPass === validHash);
}

var generateToken = (length) => {
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

var saveToken = (email, timeout, callback) => {
    // Note: timeout in minutes
    if (!email || !timeout) return callback('invalid-parameters');

    var token = generateToken(128);
    userCollection.findOne({ email: email }, function (err, obj) {
        if (err) {
            log(err);
            return callback('database-error');
        }
        var userid = obj._id;
        var access = obj.access;
        if (timeout != 1) {
            timeout = Number(Date.now()) + Number(timeout * 60000);
        } else {
            timeout = 0;
            access = 'api';
        }
        
        var newToken = {
            id: userid,
            token: token,
            access: access,
            timeout: timeout
        }
        tokenCollection.save(newToken, { safe: true }, (err) => {
            if (err) {
                log(err);
                return callback('database-error');
            }

            callback(null, token);
        });
    });
}

var validateToken = (email, token, callback) => {
    userCollection.findOne({ email: email }, (err, obj) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (!obj){
            return callback('invalid-email');
        } else {
            tokenCollection.find({ id: obj._id }).toArray((err, tokenObj) => {
                if (err) {
                    log(err);
                    return callback(err);
                }
                if (!tokenObj) {
                    return callback('invalid-token');
                } else {
                    for (var i in tokenObj) {
                        if (tokenObj[i].timeout != 0) {
                            if (tokenObj[i].token != token) return callback('invalid-token');
                            if (tokenObj[i].timeout > Number(Date.now())) {
                                callback(null, token);
                            } else {
                                tokenCollection.remove({ token: token }, (err) => {
                                    if (err) {
                                        log(err);
                                        return callback('database-error');
                                    }
                                    callback('token-timeout');
                                });
                            }
                        }
                    }
                }
            });
        }
    });
}

var sessionLookup = (token, callback) => {
    tokenCollection.findOne({ token: token }, (err, tokenObj) => {
        if (err) {
            log(err);
            return callback('database-error');
        }
        if (!tokenObj) return callback(null, 'invalid-token');
        userCollection.findOne({ '_id': new ObjectId(tokenObj.id) }, (err, userObj) => {
            if (err) {
                log(err);
                return callback('database-error');
            }
            validateToken(userObj.email, token, (err) => {
                if (err) {
                    log(err)
                    return callback(err);
                }

                callback(null, userObj);
            });

        });
    });
}

//TODO: remove any tokens associated with account
exports.deleteAccount = (email, callback) => {
    inviteCollection.remove({ email: email }, (err) => {
        if (err) {
            log(err);
            return callback('database-error');
        } else {
            userCollection.remove({ email: email }, (err) => {
                if (err) {
                    log(err);
                    return callback('database-error');
                } else {
                    log(email + ' removed from accounts');
                    return callback(null, (email + ' removed from accounts'));
                }
            });
        }
    });
}
const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:jobs');

const T = require('./twitter');


module.exports = function(app) {

    app.get('/jobs', function(req, res) {
        if (req.session.access == 'admin') {
            DM.getAllJobs(function (err, jobs) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    res.render("jobs", {
                        header: 'Job Manager',
                        title: 'Job Manager',
                        saved: jobs.saved,
                        queue: jobs.queue,
                        requested: jobs.requested
                    });
                }
            });
        } else {
            return res.redirect('/'); //add unauthorized page?
        }
    });

    app.get('/jobs/:id', function(req, res) {
        DM.getJobDataById(req.params.id, function (err, job) {
            if (err) {
                log(err);
                return res.status(400).send(err);
            } else {
                res.render("job", {
                    header: 'View Job',
                    title: 'View Job',
                    job: job
                });
            }
        });
    });

    app.post('/jobs', function (req, res) {
        if (!!req.body.command) {
            if (req.body.command == 'updateStatus') {
                if (!!req.body.id && !!req.body.status) {
                    DM.updateJobStatus(req.body.id, req.body.status, function (err, status) {
                        if (err) {
                            res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                        } else {
                            res.status(200).send(JSON.stringify({status: 'OK'}));
                        }
                    });
                } else {
                    res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
                }
            } else if (req.body.command == 'delete') {
                DM.updateJobStatus(req.body.id, 'delete', function (err, status) {
                    if (err) {
                        res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        res.status(200).send(JSON.stringify({status: 'OK'}));
                    }
                });
            } else if (req.body.command == 'deleteTweet') {
                if (!!req.body.id) {
                    DM.removeTweetData(req.body.id, function (err, status) {
                        if (err) {
                            res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                        } else {
                            res.status(200).send(JSON.stringify({status: 'OK'}));
                        }
                    });
                } else {
                    res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
                }
            } else if (req.body.command == 'queueTweet') {
                if (!!req.body.id) {
                    DM.queueTweetData(req.body.id, function (err, status) {
                        if (err) {
                            res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                        } else {
                            res.status(200).send(JSON.stringify({status: 'OK'}));
                        }
                    });
                } else {
                    res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
                }
            } else {
                res.status(400).send(JSON.stringify({status: 'ERROR', error: 'unknown-command'}));
            }
        } else {
            res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
        }
    });

    app.get('/tweets', function(req, res) {
        DM.getTweetData(function (err, tweets) {
            if (err) {
                log(err);
                return res.status(400).send(err);
            } else {
                return res.status(200).send(tweets);
            }
        });
    });

    app.get('/tweets/:id', function(req, res) {
        DM.getTweetDataById(req.params.id, function (err, tweet) {
            if (err) {
                log(err);
                return res.status(400).send(err);
            } else {
                res.render("tweet", {
                    header: 'View Tweet',
                    title: 'View Tweet',
                    tweet: tweet
                });
            }
        });
    });

    app.post('/tweets/:id', function (req, res) {
        if (!!req.body.command) {
            if (req.body.command == 'queueTweet') {
                DM.queueTweetData(req.body.id, function (err, status) {
                    if (err) {
                        res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        res.status(200).send(JSON.stringify({status: 'OK'}));
                    }
                });
            } else if (req.body.command == 'deleteTweet') {
                DM.removeTweetData(req.body.id, function (err, status) {
                    if (err) {
                        res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        res.status(200).send(JSON.stringify({status: 'OK'}));
                    }
                });
            } else {
                res.status(400).send(JSON.stringify({status: 'ERROR', error: 'unknown-command'}));
            }
        } else {
            res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
        }
    });


}
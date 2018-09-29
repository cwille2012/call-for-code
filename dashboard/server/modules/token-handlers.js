//This file handles only API tokens that admin can generate
//API tokens never expire (unless they are deleted)
//API tokens are used for POSTs and sockets from external sockets where credentials cannot be left

const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:tokens');

module.exports = function(app) {

    app.get('/tokens', function(req, res) {
        if (req.session.access == 'admin') {
            DM.getAllTokens(function(err, obj){
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    return res.status(200).json(obj);
                }
            });
        } else {
            return res.redirect('/');
        }
    });

    app.get('/tokenmanager', function(req, res) {
        if (req.session.access == 'admin') {
            DM.getAllTokens(function (err, tokens) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    var accountTokens = [];
                    for (var i in tokens) {
                        if (req.session.id == tokens[i].id && tokens[i].timeout == 0) {
                            accountTokens.push(tokens[i]);
                        }
                    }
                    res.render("tokenmanager", {
                        title: 'Manage Tokens',
                        tokens: accountTokens
                    });
                }
            });
        } else {
            return res.redirect('/'); //add unauthorized page?
        }
    });

    app.post('/tokenmanager', function (req, res) {
        if (!!req.body.password && !!req.body.command) {
            if (req.body.command =='request') {
                DM.newToken(req.session.token, req.body.password, function (err, token) {
                    if (err) {
                        log(err);
                        return res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        log('New token created for: ' + req.session.id);
                        return res.status(200).send(JSON.stringify({status: 'OK', token: token}));
                    }
                });
            } else if (req.body.command == 'clear'){
                DM.clearTokens(req.session.token, req.body.password, function (err, token) {
                    if (err) {
                        log(err);
                        return res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        log('Tokens cleared for: ' + req.session.id);
                        return res.status(200).send(JSON.stringify({status: 'OK'}));
                    }
                });
            } else {
            return res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
            }
        } else {
            return res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
        }
    });



}
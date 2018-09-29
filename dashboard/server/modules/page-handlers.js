const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:pages');

module.exports = function(app) {

    app.get('/', function (req, res) {
        if (!!req.session) {
            if (req.session.access == 'admin') {
                res.render("admin", {
                    title: 'Damage Portal [admin]',
                    account: req.session.id
                });
            } else if (req.session.access == 'manager') {
                //manager page not made yet
            } else {
                res.render("user", {
                    title: 'Damage Portal [user]',
                    account: req.session.id
                });
            }
        } else {
            res.redirect('/login');
        }
    });

    app.get('/login', function(req, res) {
        res.render("login", {
            title: 'Damage Portal',
        });
    });
    
    app.get('/newaccount', function(req, res) {
        res.render("newaccount", {
            title: 'Create Account',
        });
    });
    
    app.get('/passwordreset', function(req, res) {
        res.render("passwordreset", {
            title: 'Password Reset',
        });
    });

    app.get('/passwordreset/:details', function (req, res) {
        if (req.params.details.includes('&') && req.params.details.includes('@')) {
            var email = req.params.details.split('&')[0];
            var hashedpass = req.params.details.split('&')[1];
            DM.getUser(email, function (err, obj) {
                if (err) {
                    log(err);
                    return res.status(400).send("account-error");
                } else if (obj) {
                    if (obj.passwordReset != false) {
                        if (Number(obj.passwordReset) > Number(Date.now())) {
                            if (obj.password == hashedpass) {
                                res.render("newpassword", {
                                    title: 'New Password',
                                });
                            } else {
                                res.render("resendpasswordreset", {
                                    title: 'Password Reset',
                                });
                            }
                        } else {
                            res.render("resendpasswordreset", {
                                title: 'Password Reset',
                            });
                        }
                    } else {
                        res.render("resendpasswordreset", {
                            title: 'Password Reset',
                        });
                    }
                } else {
                    return res.status(400).send("account-error");
                }
            });
        } else {
            res.render("resendpasswordreset", {
                title: 'Password Reset',
            });
        }
    });

    app.get('/logout', function(req, res) {
        if (req.headers.cookie.includes('session=')) {
            var session = req.headers.cookie.split('session=')[1].substring(0, 128);
            DM.endSession(session, function(err){
                if (err) {
                    log(err);
                    return res.status(200).send(err);
                } else {
                    return res.status(200).send(exports.returnLogoutSuccess());
                }
            });
        } else {
            return res.status(200).send(exports.returnLogoutSuccess());
        }
    });

    app.get('/verifyemail/:details', function (req, res) {
        if (!!req.params.details) {
            var email = req.params.details.split('&')[0];
            var hashedpass = req.params.details.split('&')[1];
            DM.verifyEmail(email, hashedpass, function (err, response) {
                if (err) {
                    log(err);
                    return res.status(200).send(exports.returnVerifyEmailFailure());
                } else {
                    return res.status(200).send(exports.returnVerifyEmailSuccess());
                }
            });
        } else {
            return res.status(200).send(exports.returnVerifyEmailFailure());
        }
    });

    app.get('/verifyemail', function (req, res) {
        res.render("verifyemail", {
            title: 'Resend Verification',
        });
    });

    app.post('/verifyemail', function(req, res) {
        if (!!req.body.email && !!req.body.password){
            if (process.env.VALIDATE_EMAIL) {
                DM.resendEmailVerification(req.body.email, req.body.password, function (err) {
                    if (err) {
                        log(err);
                        return res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        return res.status(200).send(JSON.stringify({status: 'OK'}));
                    }
                });
            } else {
                return res.status(400).send(JSON.stringify({status: 'ERROR', error: 'not-required'}));
            }
        } else {
          return res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
        }
      });
    
    app.post('/login', function(req, res) {
        if (!!req.body.username && !!req.body.password) {
            if (req.body.username != '' && req.body.password != '') {
                var username = req.body.username;
                var password = req.body.password;
                DM.login(username, password, function(err, data){
                    if (err) {
                        return res.status(530).send(err);
                    } else {
                        log(username + ' authenticated');
                        return res.status(200).send(JSON.stringify({data: data}));
                    }
                });
            } else {
                return res.status(400).send("invalid-parameters");
            }
        } else {
            return res.status(400).send("invalid-parameters");
        }
    });
    
    app.post('/logout', function(req, res) {
        if (!!req.body.session){
            if (req.body.session != '') {
                var token = req.body.session;
                DM.endSession(token, function(err){
                    if (err) {
                        log(err);
                        return res.status(400).send(err);
                    } else {
                        return res.status(200).send("Logout successful");
                    }
                });
            } else {
                return res.status(400).send("invalid-parameters");
            }
        } else {
            return res.status(400).send("invalid-parameters");
        }
    });
    
    app.post('/checksession', function(req, res) {
        var session = ''
        if (req.headers.cookie && req.headers.cookie.includes('session=')) {
            session = req.headers.cookie.split('session=')[1].substring(0, 128);
        } else if (!!req.body.session) {
            session = req.body.session;
        }
        if (session == '') {
            return res.status(400).send("invalid-parameters");
        } else {
            DM.validateSession(session, function(err, token){
                if (err) {
                    log(err);
                    return res.status(530).send(err);
                } else {
                    DM.getUserBySession(token, function(err, user){
                        if (err) {
                            log(err);
                            return res.status(530).send(err);
                        } else {
                            user.password = '********';
                            return res.status(200).send({data: {session: token, user: user, access: user.access}, response_code: 200});
                        }
                    });
                }
            });
        }
    });

    //Still formatted for ios app
    app.post('/passwordreset', function (req, res) {
        if (!!req.body.email) {
            if (req.body.email != '') {
                var email = req.body.email;
                if (email.includes('Optional')) {
                    email = email.split('"')[1];
                }
                DM.enablePasswordReset(email, function (err) {
                    if (err) {
                        log(err);
                        return res.status(400).send(err);
                    } else {
                        log('Password reset enabled for ' + email);
                        return res.status(200).send("OK");
                    }
                });
            } else {
                return res.status(400).send("invalid-parameters");
            }
        } else {
            return res.status(400).send("invalid-parameters");
        }
    });
    
    app.post('/newpassword', function (req, res) {
        if (!!req.body.email && !!req.body.newpass && !!req.body.oldpass) {
            DM.resetPassword(req.body.email, req.body.newpass, req.body.oldpass, function (err) {
                if (err) {
                    log(err);
                    return res.status(400).send("server-error");
                } else {
                    log('Password reset for: ' + req.body.email);
                    return res.status(200).send("OK");
                }
            });
        } else {
            return res.status(400).send("invalid-parameters");
        }
    });
    
    app.post('/newaccount', function (req, res) {
        if (!!req.body.email && !!req.body.password && !!req.body.firstname && !!req.body.lastname) {
            DM.newUser(req.body.email, req.body.password, req.body.firstname, req.body.lastname, function (err) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    log('New user created: ' + req.body.email);
                    if (process.env.VALIDATE_EMAIL) {
                        return res.status(200).send("OK");
                    } else {
                        return res.status(200).send("OK-no-validation");
                    }
                }
            });
        } else {
            return res.status(400).send("invalid-parameters");
        }
    });
}

exports.returnLogoutSuccess = function(){
    var script = '<script>setTimeout(function(){ window.location = "/login" }, 3000)</script>'
    var link = '<a href="/login" style="margin-left: 5px; margin-right: 5px;">login page</a>';
    return (script + '<p>Logout successful. You will be redirected to the' + link + 'in 3 seconds.</p>');
}

exports.returnVerifyEmailSuccess = function(){
    var script = '<script>setTimeout(function(){ window.location = "/login" }, 3000)</script>'
    var link = '<a href="/login" style="margin-left: 5px; margin-right: 5px;">login page</a>';
    return (script + '<p>Email successfully verified.</p><br><p>You will be redirected to the' + link + 'in 3 seconds.</p>');
}

exports.returnVerifyEmailFailure = function(){
    var text = '<p>The server did not recognize the link, it could be expired.</p><p>If you need a new verification email ';
    var link = '<a href="/verifyemail" style="margin-left: 5px; margin-right: 5px;">click here</a>.<br>';
    var login = 'If not, proceed to the <a href="/login" style="margin-left: 5px; margin-right: 5px;">login page</a>.';
    return (text + link + login + '</p>');
}
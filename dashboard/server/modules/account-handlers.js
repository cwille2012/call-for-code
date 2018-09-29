const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:accounts');

module.exports = function(app) {

    app.get('/accounts', function (req, res) {
        if (req.session.access == 'admin') {
            DM.getAllUsers(function (err, accounts) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    res.render("accountlist", {
                        title: 'Accounts',
                        header: 'Account List',
                        accounts: accounts
                    });
                }
            });
        } else {
            return res.redirect('/');
        }
    });
    
    //NOTE: Admin overrides owner
    app.get('/accounts/:idOrEmail', function(req, res) {
        if (!!req.params.idOrEmail) {
            if (req.params.idOrEmail.includes('@')) {
                //it is an email, need the id
                DM.getUser(req.params.idOrEmail, function(err, account) {
                    if (err) {
                        log(err);
                        return res.status(400).send('database-error');
                    } else if (!!account) {
                        if (req.session.id == account._id) {
                            //this is account owner
                            if (req.session.access == 'admin') {
                                //admin overrides owner
                                account.password = '**********';
                                res.render("accountAdmin", {
                                    title: 'Damage Portal Accounts',
                                    name: 'View Account',
                                    account: account
                                });
                            } else {
                                account.password = '**********';
                                res.render("accountOwner", {
                                    title: 'Damage Portal Accounts',
                                    name: 'View Account',
                                    account: account
                                });
                            }
                        } else {
                            if (req.session.access == 'admin') {
                                //not account owner so only an admin can view
                                account.password = '**********';
                                res.render("accountAdmin", {
                                    title: 'Damage Portal Accounts',
                                    name: 'View Account',
                                    account: account
                                });
                            } else {
                                return res.status(401).send("not-authorized");
                            }
                        }
                    } else {
                        return res.status(400).send('not-found');
                    }
                });
            } else {
                DM.getUser(req.params.idOrEmail, function(err, account) {
                    if (err) {
                        log(err);
                        return res.status(400).send('database-error');
                    } else if (!!account) {
                        if (req.session.id == req.params.idOrEmail) {
                            //this is account owner
                            if (req.session.access == 'admin') {
                                //admin overrides owner
                                account.password = '**********';
                                res.render("accountAdmin", {
                                    title: 'Damage Portal Accounts',
                                    name: 'View Account',
                                    account: account
                                });
                            } else {
                                account.password = '**********';
                                res.render("accountOwner", {
                                    title: 'Damage Portal Accounts',
                                    name: 'View Account',
                                    account: account
                                });
                            }
                        } else {
                            if (req.session.access == 'admin') {
                                //not account owner so only an admin can view
                                account.password = '**********';
                                res.render("accountAdmin", {
                                    title: 'Damage Portal Accounts',
                                    name: 'View Account',
                                    account: account
                                });
                            } else {
                                return res.status(401).send("not-authorized");
                            }
                        }
                    } else {
                        return res.status(400).send('not-found');
                    }
                });
            }
        } else {
            return res.status(400).send("invalid-link");
        }
    });

    //TODO: Update this to use new custom middleware
    app.post('/update/:email', function (req, res) {
        DM.validateSession(req.session.token, function(err, userToken){
            if (err) {
                log(err);
                return res.status(401).send("not-authorized");
            } else {
                if (!!req.params.email) {
                    DM.getUserBySession(req.session.token, function(err, userObject){
                        if (err) {
                            log(err);
                            return res.status(400).send('lookup-error');
                        } else {
                            if (userObject.email == req.params.email) {
                                if (!!req.body.firstname && !!req.body.lastname && !!req.body.phone && !!req.body.address1 && !!req.body.address2 && !!req.body.city && !!req.body.state && !!req.body.zipcode) {
                                    if(req.body.firstname == '' || req.body.lastname == '' || req.body.firstname == 'null' || req.body.lastname == 'null') {
                                        return res.status(400).send("invalid-parameters");
                                    } else {
                                        DM.updateUser(req.params.email, req.body.firstname, req.body.lastname, req.body.phone, req.body.address1, req.body.address2, req.body.city, req.body.state, req.body.zipcode, function(err, newUser){
                                            if (err) {
                                                log(err);
                                                return res.status(400).send("server-error");
                                            } else {
                                                return res.status(200).send("OK");
                                            }
                                        });
                                    }
                                } else {
                                    return res.status(400).send("invalid-parameters");
                                }
                            } else if (userObject.access == 'admin') {
                                if (!!req.body.access) {
                                    if (req.body.access == 'admin' || req.body.access == 'manager' || req.body.access == 'user' || req.body.access == 'developer') {
                                        DM.updateAccess(req.params.email, req.body.access, function(err, updatedObj){
                                            if (err) {
                                                log(err);
                                                return res.status(400).send("server-error");
                                            } else {
                                                return res.status(200).send("OK");
                                            }
                                        });
                                    } else {
                                        return res.status(400).send("invalid-parameters");
                                    }
                                } else {
                                    return res.status(400).send("invalid-parameters");
                                }
                            } else {
                                return res.status(401).send("not-authorized");
                            }
                        }
                    });
                } else {
                    return res.status(400).send("invalid-parameters");
                }
            }
        });
    }); 

    app.post('/deleteaccount', function(req, res) {
        if (req.session.access == 'admin') {
            if (!!req.body.email) {
                DM.deleteAccount(req.params.email, function (err, response){
                    if (err) {
                        log(err);
                        return res.status(400).send(err);
                    } else {
                        return res.status(200).send('OK');
                    }
                });
            } else {
                return res.status(200).send('invalid-parameters');
            }
        } else {
            return res.status(401).send("not-authorized");
        }
    });


}
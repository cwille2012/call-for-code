const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:bases');

module.exports = function(app) {
    //show bases on map and add map to base pages
    app.get('/bases', function(req, res) {
        if (req.session.access == 'admin' || req.session.access == 'user') {
            DM.getBaseData(function (err, bases) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    res.render("bases", {
                        header: 'Base Stations',
                        title: 'Base Stations',
                        bases: bases
                    });
                }
            });
        } else {
            return res.redirect('/'); //add unauthorized page?
        }
    });

    app.get('/bases/:base', function(req, res) {
        if (!!req.params.base) {
            DM.getBaseByID(req.params.base, function (err, base) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    res.render("base", {
                        header: base.name,
                        title: 'Base Station Information',
                        base: base
                    });
                }
            });
        } else {
            return res.redirect('/bases'); //add unauthorized page?
        }
    });

    app.get('/newbase', function(req, res) {
        if (req.session.access == 'admin') {
            res.render("newbase", {
                header: 'Add Base Station',
                title: 'Add Base Station',
            });
        } else {
            return res.redirect('/'); //add unauthorized page?
        }
    });

    app.post('/newbase', function (req, res) {
        if (!!req.body.name && !!req.body.lat && !!req.body.long && !!req.body.capacity) {
            DM.saveBaseData(req.body, function (err, status) {
                if (err) {
                    res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                } else {
                    res.status(200).send(JSON.stringify({status: 'OK'}));
                }
            });
        } else {
            res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
        }
    });

    app.post('/bases/:id', function (req, res) {
        if (!!req.body.command) {
            if (req.body.command == 'update') {
                if (!!req.body.name && !!req.body.lat && !!req.body.long && !!req.body.capacity) {
                    DM.updateBaseData(req.params.id, req.body.name, req.body.lat, req.body.long, req.body.capacity, function (err, status) {
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
                DM.removeBaseData(req.params.id, function (err, status) {
                    if (err) {
                        res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
                    } else {
                        res.status(200).send(JSON.stringify({status: 'OK'}));
                    }
                });
            } else {
                res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-command'}));
            }
        } else {
            res.status(400).send(JSON.stringify({status: 'ERROR', error: 'invalid-parameters'}));
        }
        
    });


}
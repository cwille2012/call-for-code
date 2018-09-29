const http = require('https');
const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:drones');


//Video streaming:
//stream: <img src='http://<ip>/stream?topic=<link to stream1>'>
//snapshot: <img src='http://<ip>/snapshot?topic=<link to stream1>'>
//To stop the video stream you need to delete the img tag completely


exports.updateDrone = (ip, callback) => {

    var droneData = {
        location: {},
        battery: {},
        status: {},
        stream: {}
    }

    //get namespace:
    http.get('http://'+ip+'/ros/get_global_namespace', (resp) => {
    let data = '';

    resp.on('end', () => {
        data = JSON.parse(data);
        log(data);

        var namespace = null;

        if (data.success === true) {
            if (!!data.param_info) {
                if (!!data.param_info.param_value) {
                    namespace = data.param_info.param_value;
                }
            }
        }
        if (!!namespace) {
            log('namespace: ' + namespace);

            //get lat, long, altitude
            http.get('http://'+ip+'/ros/'+namespace+'/mavros/global_position/global', (resp) => {
            let data = '';

            resp.on('end', () => {
                data = JSON.parse(data);
                log(data);
                if (!!data) {
                    if (!!data.altitude && !!data.longitude && !!data.latitude) {
                        droneData.location = data;
                    } else {
                        log('location-undefined');
                    }
                } else {
                    log('location-undefined');
                }

                //get battery status
                http.get('http://'+ip+'/ros/'+namespace+'/mavros/battery', (resp) => {
                let data = '';
    
                resp.on('end', () => {
                    data = JSON.parse(data);
                    log(data);
                    if (!!data) {
                        if (!!data.voltage && !!data.current && !!data.remaining) {
                            droneData.battery = data;
                        } else {
                            log('battery-undefined');
                        }
                    } else {
                        log('battery-undefined');
                    }

                    //get drone status
                    http.get('http://'+ip+'/ros/'+namespace+'/flyt/state', (resp) => {
                    let data = '';
        
                    resp.on('end', () => {
                        data = JSON.parse(data);
                        log(data);
                        if (!!data) {
                            if (!!data.connected && !!data.armed && !!data.mode) {
                                droneData.status = data;
                            } else {
                                log('status-undefined');
                            }
                        } else {
                            log('status-undefined');
                        }

                        callback(null, droneData);

                        // //get drone streams
                        // //need to post: 
                        // http.get('http://'+ip+'/list_streams', (resp) => {
                        // let data = '';
            
                        // resp.on('end', () => {
                        //     data = JSON.parse(data);
                        //     log(data);
                        //     if (!!data) {
                        //         if (!!data.connected && !!data.armed && !!data.mode) {
                        //             droneData.status = data;
                        //         } else {
                        //             log('status-undefined');
                        //         }
                        //     } else {
                        //         log('status-undefined');
                        //     }
                        // });
                        // }).on("error", (err) => {
                        //     log("Error: " + err.message);
                        //     callback(err.message)
                        // });
                    });
                    }).on("error", (err) => {
                        log("Error: " + err.message);
                        callback(err.message)
                    });
                });
                }).on("error", (err) => {
                    log("Error: " + err.message);
                    callback(err.message)
                });
            });
            }).on("error", (err) => {
                log("Error: " + err.message);
                callback(err.message)
            });
        } else {
            log('namespace-undefined');
            callback('namespace-undefined');
        }
    });

    }).on("error", (err) => {
        log("Error: " + err.message);
        callback(err.message)
    });

}


module.exports = function(app) {

    app.get('/drones', function(req, res) {
        if (req.session.access == 'admin' || req.session.access == 'user') {
            DM.getAllDrones(function (err, drones) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    res.render("drones", {
                        header: 'Drone List',
                        title: 'Drone List',
                        drones: drones
                    });
                }
            });
        } else {
            return res.redirect('/'); //add unauthorized page?
        }
    });

    app.get('/drones/:drone', function(req, res) {
        if (!!req.params.drone) {
            DM.getDroneByID(req.params.drone, function (err, drone) {
                if (err) {
                    log(err);
                    return res.status(400).send(err);
                } else {
                    res.render("drone", {
                        header: drone.name,
                        title: 'Drone Details',
                        drone: drone
                    });
                }
            });
        } else {
            return res.redirect('/drones'); //add unauthorized page?
        }
    });

    app.get('/connectdrone', function(req, res) {
        if (req.session.access == 'admin') {
            res.render("connectdrone", {
                header: 'Conect a Drone',
                title: 'Connect a Drone',
            });
        } else {
            return res.redirect('/'); //add unauthorized page?
        }
    });

    app.post('/connectdrone', function (req, res) {
        if (!!req.body.name && !!req.body.ip && !!req.body.mac) {
            DM.connectDrone(req.body.name, req.body.ip, req.body.mac, function (err, status) {
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

    app.post('/drones/:id', function (req, res) {
        if (!!req.body.command) {
            if (req.body.command == 'update') {
                if (!!req.body.name && !!req.body.ip && !!req.body.mac) {
                    DM.updateDrone(req.params.id, req.body.name, req.body.ip, req.body.mac, function (err, status) {
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
                DM.removeDrone(req.params.id, function (err, status) {
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
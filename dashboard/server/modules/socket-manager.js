/* Initial Dependencies */
const path = require('path');
const log = require('debug')('MAPENGINE:socket');

/* Initilize Database */
const DM = require('./database-manager');

//***********************************************//
//**************** SOCKET SETUP *****************//
//***********************************************//

const engine = require('engine.io');

log('Opening websocket...');

if (!process.env.SOCKET_PORT) {
  log('Missing environmental variable: "SOCKET_PORT"!');
  process.exit(1);
} else if (isNaN(process.env.SOCKET_PORT)) {
  log('Invalid environmental variable: "SOCKET_PORT"!');
  log('"SOCKET_PORT" must be a number');
  process.exit(1);
} else if (process.env.SOCKET_PORT === process.env.SERVER_PORT) {
  log('Invalid environmental variable: "SOCKET_PORT"!');
  log('"SOCKET_PORT" is already in use');
  process.exit(1);
} else if (process.env.SOCKET_PORT === process.env.PORT) {
  log('Invalid environmental variable: "SOCKET_PORT"!');
  log('"SOCKET_PORT" is already in use');
  process.exit(1);
} else if (!process.env.SOCKET_URL) {
  log('Missing environmental variable: "SOCKET_URL"!');
  process.exit(1);
}

const socket_port = process.env.SOCKET_PORT;
const socket_url = process.env.SOCKET_URL;

var socket_server = engine.listen(socket_port, function() {
  log(`Websocket open on port ${socket_port}`);
  log(`Websocket URL: ${socket_url}`);
});

var activeUsers = [];

socket_server.on('connection', function(socket){
    var sessionInfo = {
        socket: socket
    }

    if (!!socket.request.headers.cookie) {
        if (socket.request.headers.cookie.includes('session=')) {
            var session = socket.request.headers.cookie.split('session=')[1].split(';')[0];
            DM.validateSession(session, function(err, token){
                if (err) {
                    log('Socket connection denied: ' + socket.id + '(' + err + ')');
                    socket.close();
                } else {
                    log('New socket connection: ' + socket.id);
                    activeUsers.push(sessionInfo);
                    log('Current open sockets: ' + activeUsers.length);
                    DM.getPointLayer(function(err, pointLayerData){
                        if (err) {
                            log(err);
                        } else {
                            socket.send(JSON.stringify({
                                data: pointLayerData,
                                status: 'INIT'
                            }));
                        }
                    });
                }
            });
        } else {
            log('Socket connection denied: ' + socket.id + '(invalid-headers)');
            socket.close();
        }
    } else {
      log('Socket connection denied: ' + socket.id + '(invalid-headers)');
      socket.close();
    }

    socket.on('message', function(data){
        var message = '';
        try {
            message = JSON.parse(data);
        } catch(err) {
            log('Unable to parse message from socket: ' + socket.id);
            log('Message:');
            log(data);
        }
        if (message != '') {
            //send new data to connected sockets so real time updates?
            if (message.status == 'NEWPOINT'){
                DM.savePointData(message.data, function(err){
                    if (err) {
                        log(err);
                        socket.send(JSON.stringify({
                            status: 'RESPONSE',
                            response: err
                        }));
                    } else {
                        socket.send(JSON.stringify({
                            status: 'RESPONSE',
                            response: 'OK'
                        }));
                    }
                });
            } else if (message.status == 'NEWJOB') {
                DM.saveJobData(message.data, function(err){
                    if (err) {
                        log(err);
                        socket.send(JSON.stringify({
                            status: 'RESPONSE',
                            response: err
                        }));
                    } else {
                        socket.send(JSON.stringify({
                            status: 'RESPONSE',
                            response: 'OK'
                        }));
                    }
                });
            } else if (message.status == 'REQUEST') {
                if (message.request == 'jobs') {
                    if (message.name == 'all') {
                        DM.getJobLayers(function(err, jobs){
                            if (err) {
                                log(err);
                                socket.send(JSON.stringify({
                                    status: 'RESPONSE',
                                    response: err
                                }));
                            } else {
                                socket.send(JSON.stringify({
                                    data: jobs,
                                    status: 'RESPONSE',
                                    response: 'OK',
                                    type: 'jobs'
                                }));
                            }
                        });
                    }
                }
            } else if (message.status == 'something else') {
                //so something
            }
            log(message);
        }
    });

    socket.on('close', function(){
        log('Socket closed: ' + socket.id);
        for (var i in activeUsers) {
            if (activeUsers[i].socket.id == socket.id) {
                activeUsers.splice(i,1);
                break;
            }
        }
    });
});
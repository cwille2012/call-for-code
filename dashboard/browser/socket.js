//var socketAddress = 'ws://localhost:9601';
var socketAddress = 'ws://169.62.169.178:9601';
var socketStatus = 'closed';
var socketBuffer = '';

var socket;

const socketOpen = (event) => {
    socketStatus = 'open';
};

const socketMessage = (data) => {
    try { data = JSON.parse(data); }
    catch (err) { data = data; }
    if (data.status == 'ALERT'){
        alert(data.message);
    } else {
        socketBuffer = data;
    }
};

const socketClose = (event) => {
    if (socket) {
      socketStatus = 'closed';
      updateStatus();
    }
    window.setTimeout(reconnectSocket, 500);
};

socketClose();

function reconnectSocket() {
    socket = eio(socketAddress);
    socket.addEventListener('open', socketOpen);
    socket.addEventListener('message', socketMessage);
    socket.addEventListener('close', socketClose);
    window.setTimeout(clearBuffer, 500);
}

function clearBuffer() {
    socketBuffer = '';
    updateStatus();
}

function updateStatus() {
    var statusHolder = document.getElementById('statusHolder');
    if (!!statusHolder) {
        if (socketStatus == 'open') {
            statusHolder.innerHTML = 'Connection OK';
            statusHolder.style.color = 'green';
        } else {
            statusHolder.innerHTML = 'Connection Failure';
            statusHolder.style.color = 'red';
        }
        window.setTimeout(updateStatus, 5000);
    } else {
        console.log('Error: The container "statusHolder" was not found');
    }
}

function sendData(data, callback) {
    if (typeof data != 'string') {
        try { data = JSON.stringify(data); }
        catch (err) {
            callback('Cannot stringify data: ' + err);
        }
    }
    if (socketStatus == 'open') {
        socket.send(data);
        waitForResponse(() => (socketBuffer != ''), () => {
            if (socketBuffer.status == 'RESPONSE') {
                if (socketBuffer.response == 'OK') {
                    callback(null, socketBuffer);
                } else {
                    callback(socketBuffer.response);
                }
            } else {
                callback('Invalid response')
            }
        });
    } else {
        callback('Socket closed');
    }
}

function waitForResponse(condition, callback) {
    if (!condition()) {
        window.setTimeout(waitForResponse.bind(null, condition, callback), 250);
    } else {
        callback();
    }
}

// waitForResponse(() => !(socketBuffer == ''), () => console.log('got you'))
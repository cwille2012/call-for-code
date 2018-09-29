//TODO: When admin edits account add change ability for password reset attribute
//TODO: Use account id to edit and remove so email can be changed
//TODO: Add popup verification before removing accounts

function connectDrone(){
    if (!!document.getElementById('name') && document.getElementById('name').value != '' && !!document.getElementById('ip') && document.getElementById('ip').value != '') {
        var postaddress = window.location.href;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = '';
                try {
                    response = JSON.parse(xhr.responseText);
                } catch(err) {
                    alert(xhr.responseText);
                }
                if (response != '') {
                    if (!!response.status) {
                        if (response.status == 'OK') {
                            alert('Drone added!');
                            window.location = '/drones';
                        } else {
                            alert(response.error);
                        }
                    } else {
                        alert(response);
                    }
                } else {
                    alert('Invalid response from server');
                }
            }
        }
        xhr.open("POST", postaddress, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            name: document.getElementById('name').value,
            ip: document.getElementById('ip').value,
            mac: '00:00:00:00:00'
        }));
    } else {
        alert('Please fill in all fields.');
    }
}

function editDrone() {
    if (!!document.getElementById('name') && !!document.getElementById('ip') && !!document.getElementById('mac') && !!document.getElementById('buttons')) {
        var name = document.getElementById('name').innerHTML;
        var ip = document.getElementById('ip').innerHTML;
        var mac = document.getElementById('mac').innerHTML;


        var input = document.createElement('input');
        input.id = 'nameIn';
        input.value = name;
        document.getElementById('name').innerHTML = '';
        document.getElementById('name').appendChild(input);

        var input = document.createElement('input');
        input.id = 'ipIn';
        input.value = ip;
        document.getElementById('ip').innerHTML = '';
        document.getElementById('ip').appendChild(input);

        var input = document.createElement('input');
        input.id = 'macIn';
        input.value = mac;
        document.getElementById('mac').innerHTML = '';
        document.getElementById('mac').appendChild(input);

        var input = document.createElement('button');
        input.id = 'cancel';
        input.innerHTML = 'Cancel';
        input.onclick = () => window.location.reload();
        document.getElementById('buttons').innerHTML = '';
        document.getElementById('buttons').appendChild(input);

        var input = document.createElement('button');
        input.id = 'save';
        input.innerHTML = 'Save';
        input.onclick = () => updateDrone(document.getElementById('nameIn').value, document.getElementById('ipIn').value, document.getElementById('macIn').value);
        document.getElementById('buttons').appendChild(input);

    }
}

function updateDrone(name, ip, mac) {
    console.log('saving ' + name + ' ' + ip + ' ' + mac)
    if (name != '' && ip != '') {
        var postaddress = window.location.href;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = '';
                try {
                    response = JSON.parse(xhr.responseText);
                } catch(err) {
                    alert(xhr.responseText);
                }
                if (response != '') {
                    if (!!response.status) {
                        if (response.status == 'OK') {
                            alert('Drone updated!');
                            window.location.reload();
                        } else {
                            alert(response.error);
                        }
                    } else {
                        alert(response);
                    }
                } else {
                    alert('Invalid response from server');
                }
            }
        }
        xhr.open("POST", postaddress, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            command: 'update',
            name: name,
            ip: ip,
            mac: mac
        }));
    }
}

function removeDrone() {
    var postaddress = window.location.href;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                alert(xhr.responseText);
            }
            if (response != '') {
                if (!!response.status) {
                    if (response.status == 'OK') {
                        alert('Drone removed!');
                        window.location = '/drones';
                    } else {
                        alert(response.error);
                    }
                } else {
                    alert(response);
                }
            } else {
                alert('Invalid response from server');
            }
        }
    }
    xhr.open("POST", postaddress, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        command: 'delete'
    }));
    
}
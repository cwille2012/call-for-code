//TODO: When admin edits account add change ability for password reset attribute
//TODO: Use account id to edit and remove so email can be changed
//TODO: Add popup verification before removing accounts

function newBase(){
    if (!!document.getElementById('name') && document.getElementById('name').value != '' && !!document.getElementById('lat') && document.getElementById('lat').value != '') {
        if (!!document.getElementById('long') && document.getElementById('long').value != '' && !!document.getElementById('capacity') && document.getElementById('capacity').value != '') {
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
                                alert('Base added!');
                                window.location = '/bases';
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
                lat: document.getElementById('lat').value,
                long: document.getElementById('long').value,
                capacity: document.getElementById('capacity').value
            }));
        } else {
            alert('Please fill in all fields.');
        }
    } else {
        alert('Please fill in all fields.');
    }
}

function editBase() {
    if (!!document.getElementById('name') && !!document.getElementById('lat') && !!document.getElementById('long') && !!document.getElementById('capacity') && !!document.getElementById('buttons')) {
        var name = document.getElementById('name').innerHTML;
        var lat = document.getElementById('lat').innerHTML;
        var long = document.getElementById('long').innerHTML;
        var capacity = document.getElementById('capacity').innerHTML;

        var input = document.createElement('input');
        input.id = 'nameIn';
        input.value = name;
        document.getElementById('name').innerHTML = '';
        document.getElementById('name').appendChild(input);

        var input = document.createElement('input');
        input.id = 'latIn';
        input.value = lat;
        document.getElementById('lat').innerHTML = '';
        document.getElementById('lat').appendChild(input);

        var input = document.createElement('input');
        input.id = 'longIn';
        input.value = long;
        document.getElementById('long').innerHTML = '';
        document.getElementById('long').appendChild(input);

        var input = document.createElement('input');
        input.id = 'capacityIn';
        input.value = capacity;
        document.getElementById('capacity').innerHTML = '';
        document.getElementById('capacity').appendChild(input);

        var input = document.createElement('button');
        input.id = 'cancel';
        input.innerHTML = 'Cancel';
        input.onclick = () => window.location.reload();
        document.getElementById('buttons').innerHTML = '';
        document.getElementById('buttons').appendChild(input);

        var input = document.createElement('button');
        input.id = 'save';
        input.innerHTML = 'Save';
        input.onclick = () => updateBase(document.getElementById('nameIn').value, document.getElementById('latIn').value, document.getElementById('longIn').value, document.getElementById('capacityIn').value);
        document.getElementById('buttons').appendChild(input);
    }
}

function updateBase(name, lat, long, capacity) {
    console.log('saving ' + name + ' ' + lat + ' ' + long + ' ' + capacity)
    if (name != '' && lat != '' && long != '' && capacity != '') {
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
                            alert('Base updated!');
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
            lat: lat,
            long: long,
            capacity: capacity
        }));
    }
}

function removeBase() {
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
                        alert('Base removed!');
                        window.location = '/bases';
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

function mapBase(lat, long) {
    
}
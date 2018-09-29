function queueJob(jobId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response != '') {
                if (response.status == 'OK') {
                    alert('Job added to queue!');
                    window.location.reload();
                } else {
                    alert('Error: ' + response);
                }
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: jobId,
        command: 'updateStatus',
        status: 'queueing'
    }));
}

function cancelJob(jobId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response != '') {
                if (response.status == 'OK') {
                    alert('Job removed from queue!');
                    window.location.reload();
                } else {
                    alert('Error: ' + response);
                }
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: jobId,
        command: 'updateStatus',
        status: 'saved'
    }));
}

function deleteJob(jobId) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response != '') {
                if (response.status == 'OK') {
                    alert('Job removed from queue!');
                    window.location.reload();
                } else {
                    alert('Error: ' + response);
                }
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: jobId,
        command: 'delete'
    }));
}

function addTweetToQueue(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response != '') {
                if (response.status == 'OK') {
                    alert('Tweet added queue!');
                    window.location.reload();
                } else {
                    alert('Error: ' + response);
                }
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: id,
        command: 'queueTweet'
    }));
}

function removeTweet(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response != '') {
                if (response.status == 'OK') {
                    alert('Tweet removed!');
                    window.location = '/jobs';
                } else {
                    alert('Error: ' + response);
                }
            }
        }
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        id: id,
        command: 'deleteTweet'
    }));
}

function showTweetMap(coordinates) {
    var pointData = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [Number(coordinates[0]), Number(coordinates[1])]
        },
        "properties": {
            "title": 'Tweet Position',
            "icon": 'triangle'
        }
    }

    var pointLayer = {
        "id": 'tweet',
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [pointData]
            }
        },
        "layout": {
            "icon-image": "{icon}-15",
            "icon-allow-overlap": true,
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    };

}
//TODO: Add time to wait number input (set to 0 if flyover)
//TODO: Color line according to height: https://www.mapbox.com/mapbox-gl-js/example/line-gradient/ (might need multiple lines?)
//TODO: Make points 3D: https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
//TODO: Export as JSON if cannot save
//FIX: Creating multiple jobs without refresh has ID conflict on map layer

//TODO: Disallow saving two points on top of eachother back to back (ok if other points between)

var jobPointMarker = new mapboxgl.Marker({
    draggable: true
});

var totalPoints = new Number();
var allPointData = [];
var allCoordinates = [];


function createJob() {
    document.getElementById('addPoint').style.display = 'none';
    document.getElementById('viewJobs').style.display = 'none';
    document.getElementById('addJob').style.display = 'none';
    document.getElementById('layer-list').style.display = 'none';
    document.getElementById('saveJob').style.display = 'inline-block';
    document.getElementById('jobName').style.display = 'inline-block';
    document.getElementById('jobDescription').style.display = 'inline-block';
    jobPointMarker.setLngLat(map.getCenter())
    jobPointMarker.addTo(map)
    jobPointMarker.on('dragend', onJobDragEnd);
    totalPoints = 0;
}

function onJobDragEnd() {
    var lngLat = jobPointMarker.getLngLat();

    var currentAltitude = '';
    if (!!document.getElementById('pointAltitude')){
        currentAltitude = document.getElementById('pointAltitude').value;
    }

    var currentWaitTime = '';
    if (!!document.getElementById('pointWaitTime')){
        currentWaitTime = document.getElementById('pointWaitTime').value;
    }

    var coordinates = document.getElementById('coordinates');
    coordinates.style.display = 'block';

    var coordinatesHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat + '<br />';
    var altutudeInputHTML = '<input id="pointAltitude" type="number" style="width: 45%;" placeholder="Altitude (meters)" value=' + currentAltitude + '>';
    var actionInputHTML = '<select id="action-list" onchange="actionInputChange()" style="width: 45%; float: right;"><option value="flyover">Fly Over</option><option value="droppayload">Drop Payload</option><option value="wait">Wait</option></select><br />';
    var waitTimeInputHTML = '<input id="pointWaitTime" type="number" style="width: 45%; display: none;" placeholder="Time (secinds)" value=' + currentWaitTime + '>';
    var saveButtonHTML = '<input id="saveJobPoint" type="button" value="Save Point to Job" onclick="saveJobPoint()">';
    coordinates.innerHTML = coordinatesHTML + altutudeInputHTML + actionInputHTML + waitTimeInputHTML + saveButtonHTML;
}

function actionInputChange() {
    var action = document.getElementById("action-list").options[document.getElementById("action-list").selectedIndex].value;
    var waitTimeInput = document.getElementById('pointWaitTime');

    if (action == 'wait') {
        waitTimeInput.style.display = 'inline-block';
    } else {
        waitTimeInput.style.display = 'none';
    }
}

function saveJobPoint() {
    totalPoints++;

    var lngLat = jobPointMarker.getLngLat();

    allCoordinates.push([Number(lngLat.lng), Number(lngLat.lat)]);

    var altitude = document.getElementById('pointAltitude').value;
    var action = document.getElementById("action-list").options[document.getElementById("action-list").selectedIndex].value;

    var pointData = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [Number(lngLat.lng), Number(lngLat.lat)]
        },
        "properties": {
            "title": 'Point ' + totalPoints,
            "height": Number(altitude),
            "action": action,
            "icon": 'triangle'
        }
    }

    allPointData.push(pointData);

    if (totalPoints == 1) {
        var pointLayer = {
            "id": "newJob:points",
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
        map.addLayer(pointLayer);
    } else if (totalPoints == 2) {
        var lineLayer = {
            "id": "newJob:line",
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": allCoordinates
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#888",
                "line-width": 8
            }
        };
        map.addLayer(lineLayer);

        map.getSource('newJob:points').setData({
            "type": "FeatureCollection",
            "features": allPointData
        });

        document.getElementById('jobDistance').style.display = 'inline-block';
        document.getElementById('jobDistance').innerHTML = String('Distance: ' + calculateJobDistance());

    } else {
        map.getSource('newJob:line').setData({
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": allCoordinates
            }
        });

        map.getSource('newJob:points').setData({
            "type": "FeatureCollection",
            "features": allPointData
        });

        document.getElementById('jobDistance').innerHTML = String('Distance: ' + calculateJobDistance());
    }
}

function saveJob() {
    if (document.getElementById('jobName').value == '' || document.getElementById('jobName').value == undefined) {
        alert('Please enter job name!');
    } else if (document.getElementById('jobDescription').value == '' || document.getElementById('jobDescription').value == undefined) {
        alert('Please enter job description!');
    } else if (totalPoints < 1) {
        alert('Please add at least one point to job!');
    } else {
        if (socketStatus == 'open') {
            var jobData = {
                data:{
                    pointLayer: allPointData,
                    lineLayer: allCoordinates,
                    name: document.getElementById('jobName').value,
                    description: document.getElementById('jobDescription').value,
                    distance: String(calculateJobDistance())
                },
                status: 'NEWJOB'
            }
            sendData(jobData, function(err, response) {
                if (err) {
                    alert(err);
                } else {
                    saveSuccess();
                }
            });
        } else {
            alert('Could not save job! The socket connection was broken.');
        }
    }
}

function saveSuccess() {
    map.removeLayer('newJob:line');
    map.removeLayer('newJob:points');
    jobPointMarker.remove();
    document.getElementById('addPoint').style.display = 'inline-block';
    document.getElementById('viewJobs').style.display = 'inline-block';
    document.getElementById('addJob').style.display = 'inline-block';
    document.getElementById('layer-list').style.display = 'inline-block';
    document.getElementById('saveJob').style.display = 'none';
    document.getElementById('jobName').style.display = 'none';
    document.getElementById('jobDescription').style.display = 'none';
}

function calculateJobDistance() {
    if (allCoordinates.length > 1) {
        var totalDistance = 0;
        for (i = 0; i < allCoordinates.length-1; i++) {
            totalDistance = totalDistance + distance(allCoordinates[i], allCoordinates[i+1], "kilometers");
        }
        totalDistance = Math.round(totalDistance * 1000) / 1000;
        return String(totalDistance + " kilometers");
    } else {
        return String("N/A");
    }
}

function distance(point1, point2, unit) {
    var lat1 = point1[1];
    var lon1 = point1[0];
    var lat2 = point2[1];
    var lon2 = point2[0];
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
    if (unit=="kilometers") { dist = dist * 1.609344 }
    if (unit=="miles") { dist = dist * 1 }
	return dist
}
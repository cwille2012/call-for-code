var marker = new mapboxgl.Marker({
    draggable: true
});

function addPoint() {
    marker.setLngLat(map.getCenter())
    marker.addTo(map)
}

marker.on('dragend', onDragEnd);

function onDragEnd() {
    var lngLat = marker.getLngLat();

    var currentName = '';
    if (!!document.getElementById('pointName')){
        currentName = document.getElementById('pointName').value;
    }

    var coordinates = document.getElementById('coordinates');
    coordinates.style.display = 'block';

    var coordinatesHTML = 'Longitude: ' + lngLat.lng + '<br />Latitude: ' + lngLat.lat + '<br />';
    var nameInputHTML = '<input id="pointName" style="width: 97%;" placeholder="Point Name" value=' + currentName + '><br />';
    var typeInputHTML = 'Point Type: <select id="type-list"><option value="interest">Interest</option><option value="emergency">Emergency</option></select><br />';
    var saveButtonHTML = '<input id="savePoint" type="button" value="Save Point" onclick="savePoint()">';
    coordinates.innerHTML = coordinatesHTML + nameInputHTML + typeInputHTML + saveButtonHTML;
}

function savePoint() {
    var longitude = marker.getLngLat().lng;
    var latitude = marker.getLngLat().lat;
    var name = document.getElementById('pointName').value;
    var type = document.getElementById("type-list").options[document.getElementById("type-list").selectedIndex].value;
    console.log(longitude)
    console.log(latitude)
    console.log(name)
    console.log(type)
    sendData({
        data:{
            lat: latitude,
            lon: longitude,
            name: name,
            type: type
        },
        status: 'NEWPOINT'
    });
}
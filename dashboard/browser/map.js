mapboxgl.accessToken = 'pk.eyJ1IjoiY3dpbGxlMjAxMiIsImEiOiJjajJxdWJyeXEwMDE5MzNydXF2cm1sbDU1In0.kCKIz6Ivh3EfNOmEfTANOA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/basic-v9',
    zoom: 6,
    center: [-81.7279, 28.3158]
});

map.on('load', function () {
    if (socketBuffer != ''){
        if(socketBuffer.status == 'INIT') {
            map.addLayer(socketBuffer.data);
            socketBuffer = '';
        }
    }
    map.on('click', 'points', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var title = e.features[0].properties.title;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('<strong>Name: </strong>' + title + '<br /><strong>Longitude: </strong>' + coordinates[0] + '<br /><strong>Latitude: </strong>' + coordinates[1])
            .addTo(map);
    });

    map.on('mouseenter', 'points', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'points', function () {
        map.getCanvas().style.cursor = '';
    });
});
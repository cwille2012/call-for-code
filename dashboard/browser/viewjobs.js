//Add onclick to layers
//Add handler for viewing one job at a time

function viewJobs() {
    var jobRequest = {
        status: 'REQUEST',
        request: 'jobs',
        name: 'all'
    }
    sendData(jobRequest, function(err, response) {
        if (err) {
            alert(err);
        } else {
            showJobs(response.data);
        }
    });
}

function showJobs(jobs) {
    for (var i in jobs) {
        var lineLayer = {
            "id": String(jobs[i].name + ':line'),
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {
                        name: jobs[i].name,
                        description: jobs[i].description,
                        distance: jobs[i].distance
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": jobs[i].lineLayer
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

        var pointLayer = {
            "id": String(jobs[i].name + ':points'),
            "type": "symbol",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "FeatureCollection",
                    "properties": {
                        name: jobs[i].name,
                        description: jobs[i].description,
                        distance: jobs[i].distance
                    },
                    "features": jobs[i].pointLayer
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

        map.addLayer(lineLayer);
        map.addLayer(pointLayer); //combine these into one layer?
    }
}

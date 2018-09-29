const request = require('request');
const log = require('debug')('MAPENGINE:weather');

exports.getWeather = (lat, long, callback) => {

    var weather = {
        current: {},
        warnings: {}
    }

    const apiAccess = {
        username: '1ff21889-5175-4dce-ac43-30ae31a5937d',
        password: 'bEu1bTiCBE',
        host: 'twcservice.mybluemix.net',
        port: 443,
        url: 'https://1ff21889-5175-4dce-ac43-30ae31a5937d:bEu1bTiCBE@twcservice.mybluemix.net'
    }

    const baseURL = String('https://'+apiAccess.username+':'+apiAccess.password+'@'+apiAccess.host+':'+apiAccess.port);

    if (!(isNaN(lat) || isNaN(long) || !lat || !long)) {
        var apiURL = String('/api/weather/v1/geocode/'+lat+'/'+long+'/observations.json?units=m&language=en-US');
        var options = { method: 'GET', url: String(baseURL + apiURL)};
        request(options, function (error, response, body) {
            if (error) {
                log(error);
                callback('weather-fail');
            } else {
                body = JSON.parse(body);
                weather.current = body.observation;
                var apiURL = String('/api/weather/v1/geocode/'+lat+'/'+long+'/alerts.json?language=en-US');
                var options = { method: 'GET', url: String(baseURL + apiURL)};
                request(options, function (error, response, body) {
                    if (error) {
                        log(error);
                        callback('weather-fail');
                    } else {
                        body = JSON.parse(body);
                        if (body.success == false || body.success == 'false') {
                            weather.warnings = {}
                        } else {
                            weather.warnings = body;
                        }
                        callback(null, weather)
                    }
                });
            }
        });
    } else {
        callback('invalid-coordinates');
    }
}
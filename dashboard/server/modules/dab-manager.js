const DM = require('./database-manager');
const log = require('debug')('MAPENGINE:dabs');

module.exports = function(app) {
    app.post('/api/dab', function (req, res) {
        DM.saveDabData(req.body, function (err, dabID) {
            if (err) {
                res.status(400).send(JSON.stringify({status: 'ERROR', error: err}));
            } else {
                res.status(200).send(JSON.stringify({status: 'OK'}));
            }
        });
    });
}
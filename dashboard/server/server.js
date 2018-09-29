//TODO: Old tokens not being deleted? (fix)

//TEST: Add resend password resend link ability (test this)
//TEST: Test resend email verification page

//TODO: Simplify /update/:email using req.session.access and replace email with emailOrId

/* Initial Dependencies */
const path = require('path');
const log = require('debug')('MAPENGINE:server');

/* Initilize Database Manager */
const DM = require('./modules/database-manager');

/* Initilize Socket Manager */
require('./modules/socket-manager');


//***********************************************//
//**************** SERVER SETUP *****************//
//***********************************************//

log('Starting webserver...');

/* Initilize Express Server as "app" */
const express = require('express');
const app = express();

/* Initilize Express middleware */
const cors = require('cors');
const compress = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');

/* Attach middleware to Express Server */
app.disable('etag');
app.set('json spaces', 2);
app.use(cors());
app.use(compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.engine("handlebars", exphbs({
    defaultLayout: "main",
    extname: '.handlebars'
}));
app.set("view engine", "handlebars");
app.use(express.static('./browser'));

/* Custom Middleware */
app.use((req, res, next) => {
    if (req.headers.cookie && req.headers.cookie.includes('session=')) {
        var session = req.headers.cookie.split('session=')[1].substring(0, 128);
        DM.getMiddlewareBySession(session, function(err, sessionDetails){
            if (!!sessionDetails && !err) {
                req.session = sessionDetails;
            }
            next();
        });
    } else {
        next();
    }
    res.on('finish', () => {
        if (res.statusCode != 200) {
            log(`${req.method} ${req.path} ${res.statusCode}`);
        }
    });
});

/* Check required enviornmental variables exist and are valid */
if (!process.env.SERVER_URL) {
    log('Missing environmental variable: "SERVER_URL"!');
    process.exit(1);
} else if (!process.env.SERVER_PORT && !process.env.PORT) {
    log('Missing environmental variable: "SERVER_PORT" or "PORT"!');
    process.exit(1);
}

/* Set Port and URL from enviornmental variables */
const server_port = process.env.PORT || process.env.SERVER_PORT;
const server_url = process.env.SERVER_URL;


//***********************************************//
//************** SERVER RESPONSES ***************//
//***********************************************//

/* Attach authentication free routes to Express Server */
require('./modules/page-handlers')(app);

app.post('/api/phone', function (req, res) {
    console.log(req.body);
    DM.savePhoneData(req.body, function(err, response){
        if(err) {
            res.status(400).send(err);
        } else {
            res.status(200).send('OK');
        }
    });
});

/* Authenticate every GET request and redirect non-authenticated users to login page */
app.get('*', function (req, res, next) {
    res.header('Cache-Control', 'no-cache');
    if (!!req.session) {
        next();
    } else {
        return res.redirect('/login');
    }
});

/* Authenticate every POST request and reject unauthenticated requests */
app.post('*', function (req, res, next) {
    if (!!req.session) {
        next();
    } else {
        return res.status(401).send("not-authorized");
    }
});

app.get('/map', function (req, res) {
    return res.sendFile(path.join(__dirname, '../browser/map.html'));
});

const WM = require('./modules/weather-manager');
app.get('/weather/:lat/:long', function (req, res) {
    var lat = Number(req.params.lat);
    var long = Number(req.params.long);

    WM.getWeather(lat, long, function(err, response){
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(200).json(response);
        }
    });
});

app.get('/api/phone', function (req, res) {
    DM.getTweetData(function(err, response){
        if(err) {
            res.status(400).send(err);
        } else {
            res.status(200).json(response);
        }
    });
});

app.get('/api/dab', function (req, res) {
    DM.getDabData(function(err, response){
        if(err) {
            res.status(400).send(err);
        } else {
            res.status(200).json(response);
        }
    });
});

/* Attach routes that require login to Express now that authentication is done */
require('./modules/account-handlers')(app);
require('./modules/token-handlers')(app);
require('./modules/drone-manager')(app);
require('./modules/job-manager')(app);
require('./modules/base-manager')(app);
require('./modules/dab-manager')(app);

/* Telling Express to remain open on port server_port */
app.listen(server_port, () => {
    log(`Webserver started on port ${server_port}`);
    log(`Webserver address: ${server_url}`);
});
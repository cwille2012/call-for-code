const log = require('debug')('MAPENGINE:email');

var EM = {};
module.exports = EM;

const email_from = 'Damage Portal'; 

if (!process.env.EMAIL_HOST) {
    log('Missing environmental variable: "EMAIL_HOST"!');
    process.exit(1);
} else if (!process.env.EMAIL_ADDRESS) {
    log('Missing environmental variable: "EMAIL_ADDRESS"!');
    process.exit(1);
} else if (!process.env.EMAIL_USER) {
    log('Missing environmental variable: "EMAIL_USER"!');
    process.exit(1);
} else if (!process.env.EMAIL_PASSWORD) {
    log('Missing environmental variable: "EMAIL_PASSWORD"!');
    process.exit(1);
} else if (!process.env.VALIDATE_EMAIL) {
    log('Missing environmental variable: "VALIDATE_EMAIL"!');
    process.exit(1);
}

var EMAIL_HOST = process.env.EMAIL_HOST || '';
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS || '';
var EMAIL_USER = process.env.EMAIL_USER || '';
var EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
var SERVER_URL = process.env.SERVER_URL || '';

EM.server = require(`emailjs/email`).server.connect({
    host: EMAIL_HOST,
    user: EMAIL_USER,
    password: EMAIL_PASSWORD,
    ssl: true
});

EM.dispatchResetPasswordLink = function (account, callback) {
    EM.server.send({
        from: `<${email_from}> <${EMAIL_ADDRESS}>`,
        to: account.email,
        subject: 'Password Reset',
        text: 'Please follow the link below to reset your password.',
        attachment: EM.composeResetEmail(account)
    }, callback);
}

EM.composeResetEmail = function (obj) {
    var link = `${SERVER_URL}/passwordreset/${obj.email}&${obj.password}`;
    var html = "<html><body>";
    html += "Hello " + obj.firstname + ",<br><br>";
    html += "<a href='" + link + "'>Click here to reset your password</a><br><br>";
    html += "</body></html>";
    return [{ data: html, alternative: true }];
}

EM.dispatchEmailConfirmation = function (account, callback) {
    EM.server.send({
        from: process.env.EMAIL_FROM || `<${EMAIL_ADDRESS}>`,
        to: account.email,
        subject: 'Email Verification',
        text: 'Please follow the link below to verify your account.',
        attachment: EM.composeVerificationEmail(account)
    }, callback);
}

EM.composeVerificationEmail = function (obj) {
    var link = SERVER_URL + '/verifyemail/' + obj.email + '&' + obj.password;
    var html = "<html><body>";
    html += "Hello " + obj.firstname + ",<br><br>";
    html += "Please verify your email address associated with the user <b>" + obj.firstname + " " + obj.lastname + "</b> by clicking the link below.<br><br>";
    html += "<a href='" + link + "'>Verify Email</a><br><br>";
    html += "If you did not create this account, please ignore this email or contact an administrator at the address below.<br><br>";
    html += "Support: <a href='mailto:" + EMAIL_ADDRESS + "'> " + EMAIL_ADDRESS + "</a><br><br>";
    html += "</body></html>";
    return [{ data: html, alternative: true }];
}
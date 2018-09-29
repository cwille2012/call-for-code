function requestToken(){
    if (!!document.getElementById('token')) {
        if (!!document.getElementById('password') && document.getElementById('password').value != '') {
            var password = document.getElementById('password').value;
            document.getElementById('passholder').innerHTML = '<br><br>';
            document.getElementById('token').innerHTML = 'Generating token...';
            var postaddress = window.location.href;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", postaddress, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var response = '';
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch(err) {
                        document.getElementById('cleartoken').innerHTML = 'Error: Invalid response from server! <br> Please refresh and try again.';
                    }
                    if (response != '') {
                        if (!!response.token && response.token != '') {
                            document.getElementById('cleartoken').style.fontSize = '14px';
                            document.getElementById('cleartoken').innerHTML = 'New token: <br>' + response.token + '<br><br> This token is linked to your account, do not share it with anyone. <br> If someone gets access to any of your tokens please clear your tokens and generate a new one.';
                        } else {
                            if (!!response.error) {
                                document.getElementById('cleartoken').innerHTML = 'Error generating token! <br>' + response.error + '<br>Please refresh to try again.';
                            } else {
                                document.getElementById('cleartoken').innerHTML = 'Error generating token! Please refresh and try again.';
                            }
                        }
                    }
                }
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                password: password,
                command: 'request'
            }));
        } else {
            alert('Please enter your password before proceeding');
        }
    }
}

function clearTokens(){
    if (!!document.getElementById('cleartoken')) {
        if (!!document.getElementById('password') && document.getElementById('password').value != '') {
            var password = document.getElementById('password').value;
            document.getElementById('passholder').innerHTML = '<br><br>';
            document.getElementById('token').innerHTML = 'Clearing tokens...';
            document.getElementById('cleartoken').innerHTML = '';
            var postaddress = window.location.href;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", postaddress, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var response = '';
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch(err) {
                        document.getElementById('cleartoken').innerHTML = 'Error: Invalid response from server!';
                    }
                    if (!!response.status) {
                        if (response.status == 'OK') {
                            document.getElementById('cleartoken').innerHTML = 'All tokens associated with your account have been successfully cleared. <br> To generate a new token, refresh this page and click "Generate Token".';
                            document.getElementById('tokens').innerHTML = '';
                            document.getElementById('count').innerHTML = 'Existing Tokens (0):';
                        } else {
                            if (!!response.error) {
                                document.getElementById('cleartoken').innerHTML = 'Error clearing tokens! <br>' + response.error + '<br>Please refresh to try again.';
                            } else {
                                document.getElementById('cleartoken').innerHTML = 'Error clearing tokens! Please refresh and try again.';
                            }
                        }
                    }
                }
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                password: password,
                command: 'clear'
            }));
        } else {
            alert('Please enter your password before proceeding');
        }
    }
}
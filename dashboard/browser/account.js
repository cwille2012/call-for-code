//TODO: When admin edits account add change ability for password reset attribute
//TODO: Use account id to edit and remove so email can be changed
//TODO: Add popup verification before removing accounts

function login(){
    if (!!document.getElementById('email') && document.getElementById('email').value != '' && !!document.getElementById('password') && document.getElementById('password').value != '') {
        var postaddress = window.location.href;
        if (!postaddress.includes('login')) {
            postaddress = postaddress.substr(0, postaddress.lastIndexOf('/')) + '/login';
        }
        var originalAddress = window.location.href;
        if (originalAddress.includes('login')) {
            var page = originalAddress.split('/');
            page = page[page.length-1];
            originalAddress = originalAddress.replace(page, '');
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = '';
                try {
                    response = JSON.parse(xhr.responseText);
                    console.log(response)
                } catch(err) {
                    alert(xhr.responseText);
                }
                if (response != '') {
                    if (!!response.data.session) {
                        setCookie('session', response.data.session, 1);
                        //alert('Login successful!');
                        window.location = originalAddress;
                    }
                }
            }
        }
        xhr.open("POST", postaddress, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            username: document.getElementById('email').value,
            password: document.getElementById('password').value
        }));
    } else {
        alert('Please fill in all fields.');
    }
}

function newAccount(){
    if (!!document.getElementById('email') && document.getElementById('email').value != '' && document.getElementById('password').value != '' && document.getElementById('cpassword').value != '') {
        if (document.getElementById('password').value == document.getElementById('cpassword').value) {
            var postaddress = window.location.href;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var response = '';
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch(err) {
                        response = xhr.responseText;
                    }
                    if (response != '') {
                        if (response == 'OK') {
                            alert('Account created successfully, please verify your email then proceed to the login page.');
                            window.location = '/login';
                        } else if (response == 'OK-no-validation') {
                            alert('Account created successfully, please proceed to the login page.');
                        } else {
                            alert('Error: ' + response);
                        }
                    }
                }
            }
            xhr.open("POST", postaddress, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                firstname: document.getElementById('firstname').value,
                lastname: document.getElementById('lastname').value
            }));
        } else {
            alert('Passwords must match');
        }
    } else {
        alert('Please enter all fields');
    }
}

function setPass(){
    if (!!document.getElementById('newpass') && document.getElementById('newpass').value != '') {
        var newpass = document.getElementById('newpass').value;
        var email = window.location.href.split('passwordreset')[1].split('/')[1].split('&')[0];
        var hashedpass = window.location.href.split('passwordreset')[1].split('/')[1].split('&')[1];
        var postaddress = window.location.href.split('passwordreset')[0] + 'newpassword';
        var xhr = new XMLHttpRequest();
        xhr.open("POST", postaddress, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = '';
                try {
                    response = JSON.parse(xhr.responseText);
                } catch(err) {
                    response = xhr.responseText;
                }
                if (response != '') {
                    if (response == 'OK') {
                        alert('Password updated successfully. Please continue to login.');
                        window.location = '/login';
                    } else {
                        alert('Error: ' + response);
                    }
                }
            }
        }
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            newpass: newpass,
            oldpass: hashedpass,
            email: email
        }));
    } else {
        alert('Please fill in all fields.');
    }
}

function passReset(){
    if (!!document.getElementById('email') && document.getElementById('email').value != '') {
        var postaddress = window.location.href;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", postaddress, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = '';
                try {
                    response = JSON.parse(xhr.responseText);
                } catch(err) {
                    response = xhr.responseText;
                }
                if (response != '') {
                    if (response == 'OK') {
                        alert('Success. Please check your email for instructions on resetting your password..');
                        window.location = '/login';
                    } else {
                        alert('Error: ' + response);
                    }
                }
            }
        }
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            email: document.getElementById('email').value
        }));
    } else {
        alert('Please fill in all fields.');
    }
}

function enablePasswordReset(){
    if (!!document.getElementById('passwordreset')) {
        if (!!document.getElementById('email') && document.getElementById('email').value != '') {
            var email = document.getElementById('email').value;
            document.getElementById('passwordreset').innerHTML = '<br>';
            document.getElementById('response1').innerHTML = 'Sending reset email...';
            var postaddress = window.location.href;
            if (postaddress.includes('/passwordreset')) {
                postaddress = postaddress.substr(0, postaddress.lastIndexOf('/passwordreset')) + '/passwordreset';
            }
            var xhr = new XMLHttpRequest();
            xhr.open("POST", postaddress, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var response = '';
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch(err) {
                        document.getElementById('response2').innerHTML = 'Error: Invalid response from server!';
                    }
                    if (!!response.status) {
                        if (response.status == 'OK') {
                            document.getElementById('response2').innerHTML = 'Email successfully sent.';
                        } else {
                            if (!!response.error) {
                                document.getElementById('response2').innerHTML = 'Error sending email: ' + response.error + '<br>Please contact an administrator.';
                            } else {
                                document.getElementById('response2').innerHTML = 'Error sending email: Please contact an administrator.';
                            }
                        }
                    }
                }
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                email: email
            }));
        } else {
            alert('Please enter your account associated email and password before proceeding');
        }
    }
}

function sendVerification(){
    if (!!document.getElementById('verifyemail')) {
        if (!!document.getElementById('email') && document.getElementById('email').value != '' && !!document.getElementById('password') && document.getElementById('password').value != '') {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            document.getElementById('verifyemail').innerHTML = '<br><br>Sending email...';
            var postaddress = window.location.href;
            if (postaddress.includes('/verifyemail')) {
                postaddress = postaddress.substr(0, postaddress.lastIndexOf('/verifyemail')) + '/verifyemail';
            }
            var xhr = new XMLHttpRequest();
            xhr.open("POST", postaddress, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var response = '';
                    try {
                        response = JSON.parse(xhr.responseText);
                    } catch(err) {
                        document.getElementById('verifyemail').innerHTML = '<br><br>Error: Invalid response from server!';
                    }
                    if (!!response.status) {
                        if (response.status == 'OK') {
                            document.getElementById('verifyemail').innerHTML = '<br><br>Email successfully sent.';
                        } else {
                            if (!!response.error) {
                                document.getElementById('verifyemail').innerHTML = '<br><br>Error sending email: ' + response.error + '<br>Please contact an administrator.';
                            } else {
                                document.getElementById('verifyemail').innerHTML = '<br><br>Error sending email: Please contact an administrator.';
                            }
                        }
                    }
                }
            }
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                email: email,
                password: password
            }));
        } else {
            alert('Please enter your account associated email and password before proceeding');
        }
    }
}

function viewAccount(email){
    console.log('Viewing account: ' + email);
    window.location = '/accounts/'+email;
}

function editAccount(email){
    console.log('Editing account: ' + email);
    if (!!document.getElementById('_id')) {
        if (!!document.getElementById('access')) {
            var currentAccess = document.getElementById('access').innerHTML;
            var accessDropdown = document.createElement('select');
            accessDropdown.id = 'newaccess';
            var unknown = new Option();
            unknown.value = '';
            unknown.text = "--";
            var admin = new Option();
            admin.value = 'admin';
            admin.text = "Admin";
            var manager = new Option();
            manager.value = 'manager';
            manager.text = "Manager";
            var user = new Option();
            user.value = 'user';
            user.text = "User";
            if (currentAccess == 'admin') {
                accessDropdown.options.add(admin);
                accessDropdown.options.add(manager);
                accessDropdown.options.add(user);
            } else if (currentAccess == 'manager') {
                accessDropdown.options.add(manager);
                accessDropdown.options.add(admin);
                accessDropdown.options.add(user);
            } else if (currentAccess == 'user') {
                accessDropdown.options.add(user);
                accessDropdown.options.add(manager);
                accessDropdown.options.add(admin);
            } else {
                accessDropdown.options.add(unknown);
                accessDropdown.options.add(user);
                accessDropdown.options.add(manager);
                accessDropdown.options.add(admin);
            }
            document.getElementById('access').innerHTML = '';
            document.getElementById('access').appendChild(accessDropdown);
        }
        if (!!document.getElementById('editbutton')) {
            document.getElementById('editbutton').innerHTML = 'Save Changes';
            document.getElementById('editbutton').setAttribute("onClick", "updateByAdmin()");
        }
        if (!!document.getElementById('backbutton')) {
            document.getElementById('backbutton').innerHTML = 'Cancel';
            document.getElementById('backbutton').setAttribute("onClick", "window.location.reload()");
        }
        if (!!document.getElementById('firstname')) {
            var input = document.createElement('input');
            input.id = 'firstnameInput';
            input.setAttribute("value", document.getElementById('firstname').innerHTML);
            document.getElementById('firstname').innerHTML = '';
            document.getElementById('firstname').appendChild(input);
        }
        if (!!document.getElementById('lastname')) {
            var input = document.createElement('input');
            input.id = 'lastnameInput';
            input.value = document.getElementById('lastname').innerHTML;
            document.getElementById('lastname').innerHTML = '';
            document.getElementById('lastname').appendChild(input);
        }
        if (!!document.getElementById('phone')) {
            var input = document.createElement('input');
            input.id = 'phoneInput';
            input.value = document.getElementById('phone').innerHTML;
            document.getElementById('phone').innerHTML = '';
            document.getElementById('phone').appendChild(input);
        }
        if (!!document.getElementById('address1')) {
            var input = document.createElement('input');
            input.id = 'address1Input';
            input.value = document.getElementById('address1').innerHTML;
            document.getElementById('address1').innerHTML = '';
            document.getElementById('address1').appendChild(input);
        }
        if (!!document.getElementById('address2')) {
            var input = document.createElement('input');
            input.id = 'address2Input';
            input.value = document.getElementById('address2').innerHTML;
            document.getElementById('address2').innerHTML = '';
            document.getElementById('address2').appendChild(input);
        }
        if (!!document.getElementById('city')) {
            var input = document.createElement('input');
            input.id = 'cityInput';
            input.value = document.getElementById('city').innerHTML;
            document.getElementById('city').innerHTML = '';
            document.getElementById('city').appendChild(input);
        }
        if (!!document.getElementById('state')) {
            var input = document.createElement('input');
            input.id = 'stateInput';
            input.value = document.getElementById('state').innerHTML;
            document.getElementById('state').innerHTML = '';
            document.getElementById('state').appendChild(input);
        }
        if (!!document.getElementById('zipcode')) {
            var input = document.createElement('input');
            input.id = 'zipcodeInput';
            input.value = document.getElementById('zipcode').innerHTML;
            document.getElementById('zipcode').innerHTML = '';
            document.getElementById('zipcode').appendChild(input);
        }
        if (!!document.getElementById('emailVerified')) {
            var currentEmailVerified = document.getElementById('emailVerified').innerHTML;
            var emailVerifiedDropdown = document.createElement('select');
            emailVerifiedDropdown.id = 'newEmailVerified';
            var unknown = new Option();
            unknown.value = '';
            unknown.text = "--";
            var verifiedTrue = new Option();
            verifiedTrue.value = 'true';
            verifiedTrue.text = "true";
            var verifiedFalse = new Option();
            verifiedFalse.value = 'false';
            verifiedFalse.text = "false";
            if (currentEmailVerified == true || currentEmailVerified == 'true') {
                emailVerifiedDropdown.options.add(verifiedTrue);
                emailVerifiedDropdown.options.add(verifiedFalse);
            } else if (currentEmailVerified == false || currentEmailVerified == 'false') {
                emailVerifiedDropdown.options.add(verifiedFalse);
                emailVerifiedDropdown.options.add(verifiedTrue);
            } else {
                emailVerifiedDropdown.options.add(unknown);
                emailVerifiedDropdown.options.add(verifiedTrue);
                emailVerifiedDropdown.options.add(verifiedFalse);
            }
            document.getElementById('emailVerified').innerHTML = '';
            document.getElementById('emailVerified').appendChild(emailVerifiedDropdown);
        }
    } else {
        //user updating account (not admin)
        if (!!document.getElementById('editbutton')) {
            document.getElementById('editbutton').innerHTML = 'Cancel';
            document.getElementById('editbutton').setAttribute("onClick", "window.location.reload()");
        }
        if (!!document.getElementById('removebutton')) {
            document.getElementById('removebutton').innerHTML = 'Save Changes';
            document.getElementById('removebutton').setAttribute("onClick", "updateByUser()");
        }
        if (!!document.getElementById('firstname')) {
            var input = document.createElement('input');
            input.id = 'firstnameInput';
            input.setAttribute("value", document.getElementById('firstname').innerHTML);
            document.getElementById('firstname').innerHTML = '';
            document.getElementById('firstname').appendChild(input);
        }
        if (!!document.getElementById('lastname')) {
            var input = document.createElement('input');
            input.id = 'lastnameInput';
            input.value = document.getElementById('lastname').innerHTML;
            document.getElementById('lastname').innerHTML = '';
            document.getElementById('lastname').appendChild(input);
        }
        if (!!document.getElementById('phone')) {
            var input = document.createElement('input');
            input.id = 'phoneInput';
            input.value = document.getElementById('phone').innerHTML;
            document.getElementById('phone').innerHTML = '';
            document.getElementById('phone').appendChild(input);
        }
        if (!!document.getElementById('address1')) {
            var input = document.createElement('input');
            input.id = 'address1Input';
            input.value = document.getElementById('address1').innerHTML;
            document.getElementById('address1').innerHTML = '';
            document.getElementById('address1').appendChild(input);
        }
        if (!!document.getElementById('address2')) {
            var input = document.createElement('input');
            input.id = 'address2Input';
            input.value = document.getElementById('address2').innerHTML;
            document.getElementById('address2').innerHTML = '';
            document.getElementById('address2').appendChild(input);
        }
        if (!!document.getElementById('city')) {
            var input = document.createElement('input');
            input.id = 'cityInput';
            input.value = document.getElementById('city').innerHTML;
            document.getElementById('city').innerHTML = '';
            document.getElementById('city').appendChild(input);
        }
        if (!!document.getElementById('state')) {
            var input = document.createElement('input');
            input.id = 'stateInput';
            input.value = document.getElementById('state').innerHTML;
            document.getElementById('state').innerHTML = '';
            document.getElementById('state').appendChild(input);
        }
        if (!!document.getElementById('zipcode')) {
            var input = document.createElement('input');
            input.id = 'zipcodeInput';
            input.value = document.getElementById('zipcode').innerHTML;
            document.getElementById('zipcode').innerHTML = '';
            document.getElementById('zipcode').appendChild(input);
        }
    }
}

function updateByUser(){
    var firstname = '';
    var lastname = '';
    var phone = '';
    var address1 = '';
    var address2 = '';
    var city = '';
    var state = '';
    var zipcode = '';

    if (!!document.getElementById('firstnameInput')) {
        firstname = document.getElementById('firstnameInput').value;
    }
    if (!!document.getElementById('lastnameInput')) {
        lastname = document.getElementById('lastnameInput').value;
    }
    if (!!document.getElementById('phoneInput')) {
        phone = document.getElementById('phoneInput').value;
    }
    if (!!document.getElementById('address1Input')) {
        address1 = document.getElementById('address1Input').value;
    }
    if (!!document.getElementById('address2Input')) {
        address2 = document.getElementById('address2Input').value;
    }
    if (!!document.getElementById('cityInput')) {
        city = document.getElementById('cityInput').value;
    }
    if (!!document.getElementById('stateInput')) {
        state = document.getElementById('stateInput').value;
    }
    if (!!document.getElementById('zipcodeInput')) {
        zipcode = document.getElementById('zipcodeInput').value;
    }

    var postaddress = postaddress = window.location.href.replace(/accounts/g, 'update');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response == 'OK') {
                alert('Update successful!');
                window.location.reload;
            }
        }
    }
    xhr.open("POST", postaddress, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        address1: address1,
        address2: address2,
        city: city,
        state: state,
        zipcode: zipcode
    }));
}

function updateByAdmin(){
    var postaddress = postaddress = window.location.href.replace(/accounts/g, 'update');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                response = xhr.responseText;
            }
            if (response == 'OK') {
                alert('Update successful!');
                window.location.reload;
            }
        }
    }
    xhr.open("POST", postaddress, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        access: document.getElementById('newaccess').options[document.getElementById('newaccess').selectedIndex].value,
        firstname: document.getElementById('firstnameInput').value,
        lastname: document.getElementById('lastnameInput').value,
        phone: document.getElementById('phoneInput').value,
        address1: document.getElementById('address1Input').value,
        address2: document.getElementById('address2Input').value,
        city: document.getElementById('cityInput').value,
        state: document.getElementById('stateInput').value,
        zipcode: document.getElementById('zipcodeInput').value,
        emailVerified: document.getElementById('newEmailVerified').options[document.getElementById('newEmailVerified').selectedIndex].value
    }));
    console.log({
        access: document.getElementById('newaccess').options[document.getElementById('newaccess').selectedIndex].value,
        firstname: document.getElementById('firstnameInput').value,
        lastname: document.getElementById('lastnameInput').value,
        phone: document.getElementById('phoneInput').value,
        address1: document.getElementById('address1Input').value,
        address2: document.getElementById('address2Input').value,
        city: document.getElementById('cityInput').value,
        state: document.getElementById('stateInput').value,
        zipcode: document.getElementById('zipcodeInput').value,
        emailVerified: document.getElementById('newEmailVerified').options[document.getElementById('newEmailVerified').selectedIndex].value
    });
}

function removeAccount(email){
    console.log('Removing account: ' + email);
    // TODO: add popup verification
    //post req.body.email to /deleteaccount
}

function checkStatus() {
    var session = getCookie('session');
    var currentPage = window.location.href;
    if (currentPage.slice(-1) == '/') {
        currentPage = currentPage.slice(0, -1);
    }
    currentPage = currentPage.split('/').pop();
    var postaddress = window.location.href.replace(currentPage, 'checksession');
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var response = '';
            try {
                response = JSON.parse(xhr.responseText);
            } catch(err) {
                //do nothing, error just means user not logged in
            }
            if (response != '') {
                if (!!response.data.session) {
                    alert('You are currently logged in, please log out before continuing.');
                    window.location = '/';
                }
            }
            
        }
    }
    xhr.open("POST", postaddress, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        session: session,
    }));
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}
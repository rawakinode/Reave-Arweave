
$(document).ready(function(){

        var loginstat = localStorage.getItem("reave-login");

        if(loginstat === 'true'){
           window.location.href = 'story.html';
        }else{
            //console.log('Login first');
        }

});

function runUploadLogin(files){
   document.getElementById('loginUpload').click();
}

async function uploadLogin (files) {
    var fr = new FileReader()
    fr.onload = function (ev) {
        try {
            let res = JSON.parse(ev.target.result);
            //console.log(res);
            if(res.kty === 'RSA'){
                //console.log('True');
                localStorage.setItem("reave-key", JSON.stringify(res));
                localStorage.setItem("reave-login", "true");
                arweave.wallets.jwkToAddress(res).then((address) => {
                    //console.log(address);
                    localStorage.setItem("reave-address", address);
                    location.reload();
                });

             }

        } catch (err) {
            alert('Error logging in: ' + err)
        }
    }
    fr.readAsText(files[0])
}

var key = localStorage.getItem("reave-key");
var login = localStorage.getItem("reave-login");
var address = localStorage.getItem("reave-address");
//console.log(JSON.parse(key));
//console.log(login);
//console.log(address);

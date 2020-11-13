//GET SESSION
getStatusSessionForLogin();
function getStatusSessionForLogin(){
    var ssa = Date.now();
    var importJwk = localStorage.getItem('reaveSessionLogin');
    var importTime = localStorage.getItem('reaveSessionTime');
    
    var timeHit = Number(ssa) - Number(importTime);
    if (importJwk !== null) {
        
        if (timeHit < 3600000) {
            window.location.href = 'index.html';
        } else {
            localStorage.removeItem('reaveSessionLogin');
            localStorage.removeItem('reaveSessionTime');
        }
    } else {
        localStorage.removeItem('reaveSessionLogin');
        localStorage.removeItem('reaveSessionTime');        
    }
}

//IMPORT KEY FILE
function openfile() {
    document.getElementById('inputfile').click();
}

async function fileproses(files) {
    var fr = new FileReader()
    fr.onload = async function (ev) {
        try {
            var jwk = ev.target.result;
            var key = JSON.parse(jwk);
            if (key.kty === 'RSA') {
                try {
                    var u = await getAddress(key);
                    localStorage.setItem('reaveSessionLogin', JSON.stringify(key));
                    localStorage.setItem('reaveSessionTime', Date.now());
                    localStorage.setItem('reaveSessionAddress', u);
                    window.location.href = 'index.html';
                } catch (error) {
                    alert('FAILED GET ADDRESS FROM JWK');
                }

            } else {
                alert('PLEASE SELECT VALID JSON WALLET !');
            }
        } catch (err) {
            alert('FAILED TO READ YOUR JSON WALLET !');
        }
    }
    fr.readAsText(files[0])
}

// GET WALLET ADDRESS 
async function getAddress(e) {
    return arweave.wallets.jwkToAddress(e).then((address) => {
        wallet = address;
        return wallet;
    });
}
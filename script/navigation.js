function opennav() {
    var s = sessionStorage.getItem('rev-sidebar');
    var u = '';
    var d = '';

    if (s === '2') {
        u = '-200px';
        d = 'none';
        sessionStorage.setItem('rev-sidebar', '1');
    }else {
        u = '0';
        d = 'block';
        sessionStorage.setItem('rev-sidebar', '2');
    }

    document.getElementById('mainside').style.display = d;
    document.getElementById('sidebar').style.right = u;
    
}

var importJwk = localStorage.getItem('reaveSessionLogin');
var importAddr = localStorage.getItem('reaveSessionAddress');
console.log(importJwk);
if (importJwk !== null) {
    document.getElementById('logstatus').setAttribute('onclick', 'logoutSession()');
    document.getElementById('logstatus').setAttribute('title', importAddr);
    document.getElementById('logstatus').setAttribute('href', 'javascript:void(0)');
    document.getElementById('logstatus').innerText = 'Logout';
}
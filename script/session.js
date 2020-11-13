//GET SESSION
getStatusSession();
function getStatusSession(){
    var ssa = Date.now();
    var importJwk = localStorage.getItem('reaveSessionLogin');
    var importTime = localStorage.getItem('reaveSessionTime');
    var timeHit = Number(ssa) - Number(importTime);
    if (importJwk !== null) {
        
        if (timeHit > 3600000) {
            localStorage.removeItem('reaveSessionLogin');
            localStorage.removeItem('reaveSessionTime');
            localStorage.removeItem('reaveSessionAddress');
            window.location.href = 'login.html';
        } else {
            console.log('LOGIN SUCCESS');
        }
    } else {
        localStorage.removeItem('reaveSessionLogin');
        localStorage.removeItem('reaveSessionTime');
        localStorage.removeItem('reaveSessionAddress');
        window.location.href = 'login.html';
        console.log('LOGIN FAILED');
    }
}

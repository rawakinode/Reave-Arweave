//LOGOUT
function logoutSession() {
    localStorage.removeItem('reaveSessionLogin');
    localStorage.removeItem('reaveSessionTime');
    localStorage.removeItem('reaveSessionAddress');
    window.location.href = 'login.html';
}
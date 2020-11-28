//LOGOUT
function logoutSession() {
    localStorage.removeItem('reaveSessionLogin');
    localStorage.removeItem('reaveSessionTime');
    localStorage.removeItem('reaveSessionAddress');
    localStorage.removeItem('Profile-Name');
    localStorage.removeItem('Profile-Image');
    localStorage.removeItem('Profile-Site');
    localStorage.removeItem('Profile-Desc');
    localStorage.removeItem('preview-body');
    localStorage.removeItem('preview-title');
    window.location.href = 'login.html';
}
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
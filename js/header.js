$(document).ready(function(){
    
    var ex = localStorage.getItem('reave-login');
    var drr = localStorage.getItem('reave-address');
    
    if(ex === 'true'){
         document.getElementById('btnloghead').style.display = 'none';
         document.getElementById('dropdownhead').style.display = 'block';
         document.getElementById('dropdownheadlink').innerText = drr.slice(0, 15);
     }else{
         document.getElementById('btnloghead').style.display = 'block';
         document.getElementById('dropdownhead').style.display = 'none';
     }
    
});

function started(){
    window.location.href = 'login.html';
}

function toMyAuthor(){
    var drr = localStorage.getItem('reave-address');
    window.location.href = 'author.html?'+drr;
}
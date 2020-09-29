

$(document).ready(function(){
    
        var loginstat = localStorage.getItem("reave-login");

        if(loginstat !== 'true'){
           window.location.href = 'login.html';
        }else{
            console.log('logged');
        }
    
});
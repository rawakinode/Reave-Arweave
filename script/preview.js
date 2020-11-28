//GET DATA FROM LOCALSTORAGE
var q = localStorage.getItem('preview-body');
var w = localStorage.getItem('preview-title');

//DOM DATA TO HTML
var t = '<div class="cont-title" style="margin-bottom:40px;">'+w+'</div>';
$('#contentplace').append(t+q);
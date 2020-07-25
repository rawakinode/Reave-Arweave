function showPreview(){
    var data = localStorage.getItem('reave-preview');
    var title = localStorage.getItem('reave-preview-title');
    data = JSON.parse(data);

    document.getElementById('mainreadcontent').innerHTML = data;
      document.getElementById('reavetitle').innerText = title;
}

showPreview();

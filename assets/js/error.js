function errorpopup(e){
    $.alert({
      title: 'Error!',
      content: e,
      icon: 'fa fa-warning',
      type: 'red',
      closeIcon: true,
      boxWidth: '300px',
      useBootstrap: false,
    });
}

function successpopup(e){
    $.alert({
      title: 'Success!',
      content: e,
      type: 'green',
      closeIcon: true,
      boxWidth: '300px',
      useBootstrap: false,
    });
}
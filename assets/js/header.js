$(document).ready(async function(){

    var ex = localStorage.getItem('reave-login');
    var drr = localStorage.getItem('reave-address');

    var profile = await getNameProfile(drr);

    if(ex === 'true'){
         document.getElementById('btnloghead').style.display = 'none';
         document.getElementById('dropdownhead').style.display = 'block';
         document.getElementById('dropdownheadlink').innerText = profile;
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


async function getNameProfile(e){
    try {
          const contx = await arweave.arql({
              op: "and",
              expr1: {
                op: "equals",
                  expr1: "from",
                  expr2: e
              },
              expr2: {
                  op:"equals",
                  expr1:"Reave-Type",
                  expr2: "profile"

              }
        })

           //console.log(contx);
           if (contx.length > 0) {
               const profileTx     = await arweave.transactions.get(contx[0]);
               const profileTxData = profileTx.get('data', { decode: true, string: true });
               //console.log(profileTxData);
               let profileTxDatare = profileTxData.split('hcseu83h387svlnv8');
               return profileTxDatare[0];

           }else {
               //console.log('Profil not set');
           }
    } catch (e) {
        return false;
    }
}

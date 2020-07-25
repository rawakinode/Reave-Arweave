let ar;
var wallet;
getData();
getLastTrx();
async function getData() {
    try {
        wallet = localStorage.getItem('reave-address');
        document.getElementById('profiladdress').innerText = wallet;
        arweave.wallets.getBalance(wallet).then((balance) => {
        let winston = balance;
        ar = arweave.ar.winstonToAr(balance);
          document.getElementById('balance').innerText = ar+' AR';
          console.log(ar);
        });

          const contx = await arweave.arql({
              op: "and",
              expr1: {
                op: "equals",
                  expr1: "from",
                  expr2: wallet
              },
              expr2: {
                  op:"equals",
                  expr1:"Reave-Type",
                  expr2: "profile"

              }
        })

        console.log(contx);
        if (contx.length > 0) {
            const profileTx     = await arweave.transactions.get(contx[0]);
            const profileTxData = profileTx.get('data', { decode: true, string: true });
            console.log(profileTxData);
            let profileTxDatare = profileTxData.split('hcseu83h387svlnv8');
            console.log(profileTxDatare[0]);
            document.getElementById('profilename').innerText = profileTxDatare[0];
            document.getElementById('usernameprofil').innerText = profileTxDatare[1];
            document.getElementById('profildescription').innerText = profileTxDatare[2];
        }else {
            console.log('Profil not set');
        }

    } catch (e) {
        console.log(e);
        errorpopup('Failed to fetch data !')
    }
}

async function getLastTrx() {
    try {
          const contx = await arweave.arql({
              op: "and",
              expr1: {
                op: "equals",
                  expr1: "from",
                  expr2: wallet
              },
              expr2: {
                  op:"equals",
                  expr1:"App-Name",
                  expr2: "Reave-Apps-Demo"

              }
        })

        console.log(contx);
        let contxe = contx.slice(0, 10);

        for(const e in contxe){

            try {
                console.log(contx[e]);
                const dataTx = await arweave.transactions.get(contx[e]);
                console.log(dataTx);
                var type = getTag(dataTx, 'Reave-Type');
                console.log(type);
                var mystamp = getTag(dataTx, 'Reave-Stamp');
                var times = mystamp.substring(0, 10);
                var date = moment.unix(times).format("MMM Do YY");

                if (type === 'profile') {
                    $('#lastActivity').append('<p class="lastactivity">You update profile<span style="color:#c7c7c7;"> - '+date+'</span></p>');
                }else if (type === 'Story') {
                    $('#lastActivity').append('<p class="lastactivity">You create story<span style="color:#c7c7c7;"> - '+date+'</span></p>');
                }else if (type === 'Comment') {
                    $('#lastActivity').append('<p class="lastactivity">You send comment<span style="color:#c7c7c7;"> - '+date+'</span></p>');
                }else if (type === 'SubComment') {
                    $('#lastActivity').append('<p class="lastactivity">You send comment<span style="color:#c7c7c7;"> - '+date+'</span></p>');
                }
            } catch (e) {

            }



        }

    } catch (e) {
        errorpopup('Failed to fetch transaction !');
    }
}

function showEditProfil(){
    document.getElementById('editprofilbox').style.display = 'block';
    document.getElementById('profilbox').style.display = 'none';
}


async function saveProfilAll(){
   var n =  (document.getElementById('editprofilname').value).trim();
   var u =  (document.getElementById('edituprofilusername').value).trim();
   var d =  (document.getElementById('editprofildescription').value).trim();

   if (n === '' || u ==='' || d === '') {
      errorpopup('Please fill all form !');
   }else if(n.length > 15){
        errorpopup('Your name limit 15 Character');
   }else if(u.length > 15){
        errorpopup('Username limit 15 Character');
   }else if(d.length > 200){
        errorpopup('Description limit 200 Character');
   }else{
         //Check feecheck
      let createJSON = n+'hcseu83h387svlnv8'+u+'hcseu83h387svlnv8'+d;
       var size = createJSON.length;
       let checking = await fetch('https://arweave.net/price/'+size+'/'+wallet);
       let result = await checking.text();
       let wiston = (result / 1000000000000);
       console.log(wiston);
       var times = Date.now();

       if (ar < wiston) {
          errorpopup('Balance is not sufficient !');
       }else{
         var jwk = JSON.parse(localStorage.getItem("reave-key"));
         let transaction = await arweave.createTransaction({
                   data: createJSON
                 }, jwk);

                   transaction.addTag('App-Name', 'Reave-Apps-Demo')
                   transaction.addTag('App-Version', '1.0')
                   transaction.addTag('Reave-Type', 'profile')
                   transaction.addTag('Reave-Name', n)
                   transaction.addTag('Reave-Username', u)
                   transaction.addTag('Reave-Desc', d)
                   transaction.addTag('Reave-Stamp', times.toString())


                   await arweave.transactions.sign(transaction, jwk);
                   const response = await arweave.transactions.post(transaction);
                   console.log(response.status);
                   if (response.status === 200) {
                       successpopup('Profil update, Need time to show !');

                   }else{
                       errorpopup('Failed! Please check your Balance !');
                   }
       }
   }

    console.log(n);
    console.log(u);
    console.log(d);

}

function backFromEdit(){
  document.getElementById('editprofilbox').style.display = 'none';
  document.getElementById('profilbox').style.display = 'block';
}


function getTag(tx, name) {
      let tags = tx.get('tags');

      for(let i = 0; i < tags.length; i++) {
        // decoding tags can throw on invalid utf8 data.
        try {
          if(tags[i].get('name', { decode: true, string: true }) == name)
            return tags[i].get('value', { decode: true, string: true })
        } catch (e) {

        }
      }
      return false;
}

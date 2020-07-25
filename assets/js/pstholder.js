//Run show pst holder
listPST();

//Get PST Holder
async function getPstHolder(){
  var idcontract = 'kxvgKIaAzpmecguWz9vFGyyiLtPLVee3ROPMVQRyJGs';
  return SmartWeaveSDK.readContract(arweave, idcontract).then(state => {return state});
}

//Show PST Holder
async function listPST(){
    try {
        var m = await getPstHolder();
        let k = m.balances;
        for (const x in k) {
          console.log(`${x}: ${k[x]}`);
          var t = '<tr><td>'+`${x}`+'</td><td>'+`${k[x]}`+'</td></tr>';
          $('#tablebody').append(t);
        }

        document.getElementById('spin1').style.display = 'none';
    } catch (e) {
        errorpopup('Failed get data !');
        document.getElementById('spin1').style.display = 'none';
    }
}

//Run show last PST Rewarded
getLastPstReward();

async function getLastPstReward() {
    try {
          const transaction = await arweave.arql({
             op: "and",
             expr1: {
               op: "equals",
               expr1: "App-Name",
               expr2: "Reave-Apps"
             },
             expr2: {
                 op:"equals",
                 expr1:"Reave-Type",
                 expr2: "pst"
             }
         })

         console.log(transaction);
         var m = transaction;
         for (const n of m){
             try {
               const c  = await arweave.transactions.get(n);
               var atag = getTag(c, 'Reave-Stamp');
               var time = atag.substring(0, 10);
               var times =  moment.unix(time).startOf('hour').fromNow();
               var target = c.target;
               var amount = c.quantity;
               let pst = arweave.ar.winstonToAr(amount);

               var u = '<tr><td>'+times+'</td><td>'+pst+'</td><td>'+target+'</td></tr>';
               $('#lastxbody').append(u);
               
             } catch (e) {

             }


         }

         document.getElementById('spin2').style.display = 'none';

    } catch (e) {
      errorpopup('Failed get data !');
      document.getElementById('spin2').style.display = 'none';
    }
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

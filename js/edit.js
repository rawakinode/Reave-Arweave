checkprofileavailable();
readDatafromTX();

var getURL;
var imgBase64 ;
var idstory ;
var fromauthor ;
async function readDatafromTX(){
    try {
        getURL = (window.location.search).trim();
        getURL = getURL.slice(1, 44);
        if (getURL.length !== 43) {
            errorpopup('Invalid transaction id');
        }else {
            const dataTagTx = await arweave.transactions.get(getURL);
            fromauthor = await arweave.wallets.ownerToAddress(dataTagTx.owner);
            var user = localStorage.getItem('reave-address');
            if (fromauthor !== user) {
                errorpopup('You can not edit this story !');
            }else{
                const myCoverdata = dataTagTx.get('data', { decode: true, string: true });

                var contenttx = getTag(dataTagTx, 'Reave-Content-Tx');
                if (contenttx === '') {
                    errorpopup('Error fetch tx id !');
                }

                const dataTx = await arweave.transactions.get(contenttx);
                const mydata = dataTx.get('data', { decode: true, string: true });
                let dataAr = mydata.split('uidfsvydfydfsiu8df9usds9gu89fsxxx');
                //console.log(dataAr);
                let dataArDelta = dataAr[0];

                //set cover variable base64 data
                let dataArCover = dataAr[1];
                let dataArCoverArray = JSON.parse(dataArCover);
                imgBase64 = dataArCoverArray.cover;
                document.getElementById("showCover").src = imgBase64;

                //set cover to canvas
                var canvas = document.getElementById('canvasx');
                var context = canvas.getContext("2d");
                var image = new Image();
                image.onload = function() {
                      canvas.width = 800;
                      canvas.height = (800 * image.height) / image.width;
                    //context.clearRect(0, 0, 600, (600 * canvas.height) / canvas.width);
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);

                	var newcan = document.getElementById('canvasx');
                	imgBase64 = newcan.toDataURL('image/jpeg', 0.5);
                	//console.log(imgBase64);

                };
                image.src = myCoverdata;


                let ll = JSON.parse(dataArDelta);
                //Set content to Editors
                quill.setContents(ll.ops);

                //Set title
                var mytitle = getTag(dataTx, 'Reave-Title');
                document.getElementById('myTitle').innerText = mytitle;

                //Set category
                var mycategory = getTag(dataTx, 'Reave-Category');
                document.querySelector('#categoryselect [value="' + mycategory + '"]').selected = true;

                //set Descriptions
                var mydesc = getTag(dataTx, 'Reave-Desc');
                document.getElementById('metadesc').value = mydesc;

                //set keyword
                var mykey = getTag(dataTx, 'Reave-Key');
                document.getElementById('metakey').value = mykey;

                //set id story
                idstory = getTag(dataTx, 'Reave-Story-Id');

                //hideloading
               document.getElementById('loading').style.display = 'none';
            }
        }

    } catch (e) {
        errorpopup('Failed fetch data !');
        //hideloading
       document.getElementById('loading').style.display = 'none';
    }
}

async function checkprofileavailable() {
    try {
        var mwallet = localStorage.getItem('reave-address');

          const contx = await arweave.arql({
              op: "and",
              expr1: {
                op: "equals",
                  expr1: "from",
                  expr2: mwallet
              },
              expr2: {
                  op:"equals",
                  expr1:"Reave-Type",
                  expr2: "profile"

              }
        })

        if (contx.length > 0) {
            console.log('Profile updated');
        }else{

              $.confirm({
                title: 'Error!',
                content: 'Must Update Profil Before Publish !!',
                buttons: {
                    confirm: function () {
                       window.location.href = 'profile.html';
                    },
                    cancel: function () {
                       window.location.href = 'profile.html';
                    }

                }
              });

        }

    } catch (e) {
          errorpopup('Failed to check profile data !');
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


async function addr(){
    var myAddress = localStorage.getItem("reave-address");
    await balancechecking(myAddress);
}

//Get PST Holder
var idcontract;
async function getPstHolder(){
  idcontract = 'BX2x3nm16zzOAgoneNqPeVQ02PY3teTs_5aiYAuuALU';
  return SmartWeaveSDK.readContract(arweave, idcontract).then(state => {return state});
}

async function nextPst() {
    let pst = await getPstHolder();
    let pstHolderBalance = pst.balances;
    var i = 0;
    let checking = await fetch('https://arweave.net/price/0/1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY');
    let result = await checking.text();
    let fee = (result / 1000000000000);

    for (const property in pstHolderBalance) {
      console.log(`${property}: ${pstHolderBalance[property]}`);
      i += 1;
    }
    var pstfee = Number(i) * Number(fee);
    return {pstHolderBalance, i, pstfee};
}

var toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  ['link'],

  [{ 'header': 1 }, { 'header': 2 }],               // custom button values
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent

  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
  [{ 'align': [] }],
  ['image'],
  ['video'],

  ['clean']                                         // remove formatting button
];

var quill = new Quill('#editors', {
  modules: {
    toolbar: toolbarOptions
  },
    theme: 'snow',
    placeholder: 'Write story ...'
});

function preview(){
    var delta = quill.getContents();
    var html = quill.root.innerHTML;
    var titlepreview = (document.querySelector("#myTitle").textContent).trim();
    localStorage.setItem('reave-preview', JSON.stringify(html));
    localStorage.setItem('reave-preview-title',titlepreview);
    window.open('preview.html' , '_blank');

}


//upload cover

function runUploadCover(files){
   document.getElementById('coverUpload').click();

}


function uploadCover (files) {
    var fr = new FileReader()
    fr.onload = function (ev) {
        try {

            //console.log(ev.target.result);
             $( "#coverUpload" ).load(window.location.href + " #coverUpload" );
            imgBase64 = ev.target.result;
            document.getElementById("showCover").src = ev.target.result;

            var canvas = document.getElementById('canvasx');
            var context = canvas.getContext("2d");
            var image = new Image();
            image.onload = function() {
                  canvas.width = 800;
                  canvas.height = (800 * image.height) / image.width;
                //context.clearRect(0, 0, 600, (600 * canvas.height) / canvas.width);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

            	var newcan = document.getElementById('canvasx');
            	imgBase64 = newcan.toDataURL('image/jpeg', 0.5);
            	console.log(imgBase64);

            };
            image.src = ev.target.result;

        } catch (err) {
            alert('Error logging in: ' + err)
        }
    }
    fr.readAsDataURL(files[0])
}

//Publish article
async function Publish(){

    var a = (document.querySelector("#myTitle").textContent).trim();
    var b = quill.getContents();
    var c = imgBase64;
    var d = $( "#categoryselect" ).val();
    var e = (document.querySelector("#metadesc").value).trim();
    var f = (document.querySelector("#metakey").value).trim();
    var g = Date.now();
    var html = quill.root.innerHTML;
    var v = html.length;
    if(e === ''){
        var metadescription = html.replace(/<(.|\n)*?>/g, '');
        metadescription = metadescription.slice(0, 300);
        e = metadescription;
    }

    var xx = JSON.stringify(b);
    var xc = xx+'uidfsvydfydfsiu8df9usds9gu89fsxxx{"cover":"'+c+'"}uidfsvydfydfsiu8df9usds9gu89fsxxx{"html":"'+html+'"}';
    let dd = xc.split('uidfsvydfydfsiu8df9usds9gu89fsxxx');

    if(a === 'Write your title here...' || a === ''){
        errorpopup('Write title !');
    }else if(v < 30){
         errorpopup('Your story is too short !');
    }else if(d === '0'){
         errorpopup('Select category !');
    }else if(c === void 0){
         errorpopup('Please add cover or thumbnail !');
    }else{
        //showloading
        document.getElementById('loading').style.display = 'block';
        let feepst = await nextPst();
        var fee = await feechecking(xc);
        var bal = localStorage.getItem("reave-balance");

        let pstreward = '0.1'; //reward to pst holder
        var totalfee = Number(feepst.pstfee) + Number(fee) + Number(pstreward);

        if(bal < totalfee){
            //hideloading
           document.getElementById('loading').style.display = 'none';
           errorpopup('Balance is not sufficient');
        }else{
            $.confirm({
                title: 'Confirm!',
                content: 'You need fee to publish : '+totalfee+' AR',
                buttons: {
                    confirm: function () {
                        nextPublish(a, xc, d, e, f, g, feepst);
                    },
                    cancel: function () {
                         //hideloading
                        document.getElementById('loading').style.display = 'none';
                    }

                }
            });
        }

    }
}

//submitpublish
async function feechecking(e){

    var myAddress = localStorage.getItem("reave-address");
    let checking = await fetch('https://arweave.net/price/'+(e.length).toString()+'/'+myAddress);
    let result = await checking.text();
    let wiston = (result / 1000000000000);
    return wiston;

}

async function balancechecking(e){

    arweave.wallets.getBalance(e).then((balance) => {
        let winston = balance;
        let ar = arweave.ar.winstonToAr(balance);

        console.log(ar);
        localStorage.setItem("reave-balance", ar);
    });


}

//disable enter
$('#myTitle').keypress(
  function(event){
    if (event.which == '13') {
      event.preventDefault();
    }
});

//Publish Story
async function nextPublish(aa, bb, cc, dd, ee, ff, hh){

    var jwk = JSON.parse(localStorage.getItem("reave-key"));
          console.log(jwk);

    let m = hh.pstHolderBalance;
    var times = Date.now();
    for(const h in m ){

        //console.log(`${h}: ${m[h]}`);
        var rewardforpst = '0.01';
        var calc = (`${m[h]}` / 1000000 ) * rewardforpst;
        //console.log(calc);
        let transaction = await arweave.createTransaction({
        target: `${h}`,
        quantity: arweave.ar.arToWinston(calc)
        }, jwk);

        transaction.addTag('App-Name', 'Reave-Apps')
        transaction.addTag('App-Version', '1.0')
        transaction.addTag('Reave-Type', 'pst')
        transaction.addTag('Reave-Contract', idcontract)
        transaction.addTag('Reave-Stamp', times.toString())

        await arweave.transactions.sign(transaction, jwk);
        const response = await arweave.transactions.post(transaction);

    }

    try {
      let transaction = await arweave.createTransaction({
          data: bb
        }, jwk);

          transaction.addTag('App-Name', 'Reave-Apps-Demo')
          transaction.addTag('App-Version', '1.0')
          transaction.addTag('Reave-Type', 'Story')
          transaction.addTag('Reave-Story-Id', idstory)
          transaction.addTag('Reave-Title', aa)
          transaction.addTag('Reave-Category', cc)
          transaction.addTag('Reave-Desc', dd)
          transaction.addTag('Reave-Key', ee)
          transaction.addTag('Reave-Status', 'Edited')
          transaction.addTag('Reave-Stamp', ff.toString())


          await arweave.transactions.sign(transaction, jwk);
          const response = await arweave.transactions.post(transaction);

          publishTag(aa, bb, cc, dd, ee, ff, hh, transaction.id);

    } catch (e) {
      //hideloading
     document.getElementById('loading').style.display = 'none';
     console.log(e);
     errorpopup('Failed, please try again !');
    }
}


async function publishTag(aa, bb, cc, dd, ee, ff, hh, ii) {
  var jwk = JSON.parse(localStorage.getItem("reave-key"));
        //console.log(jwk);
        try {
            let transaction = await arweave.createTransaction({
                data: imgBase64
              }, jwk);

                transaction.addTag('App-Name', 'Reave-Apps-Demo')
                transaction.addTag('App-Version', '1.0')
                transaction.addTag('Reave-Type', 'Tags-Story')
                transaction.addTag('Reave-Story-Id', idstory)
                transaction.addTag('Reave-Title', aa)
                transaction.addTag('Reave-Category', cc)
                transaction.addTag('Reave-Desc', dd)
                transaction.addTag('Reave-Key', ee)
                transaction.addTag('Reave-Status', 'Edited')
                transaction.addTag('Reave-Stamp', ff.toString())
                transaction.addTag('Reave-Content-Tx', ii)

                await arweave.transactions.sign(transaction, jwk);
                const response = await arweave.transactions.post(transaction);

                successpopup('Success publish! wait for few minutes !');

                //hideloading
               document.getElementById('loading').style.display = 'none';
        } catch (e) {
            //hideloading
           document.getElementById('loading').style.display = 'none';
           console.log(e);
           errorpopup('Failed, please try again !');
        }
}

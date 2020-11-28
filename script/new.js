//VARIABLES
var jwk = localStorage.getItem('reaveSessionLogin');
jwk = JSON.parse(jwk);
var cg = '';
var imgBase64 = '';
var cntn = '';
var jud = '';
var time = Date.now();
var version = '3.0';

var wallet = localStorage.getItem('reaveSessionAddress');

// GET WALLET BALANCE
async function getBalanceWallet(){
    return arweave.wallets.getBalance(wallet).then((balance) => {
        //let winston = balance;
        let ar = arweave.ar.winstonToAr(balance);
        return ar;
    });
}

// QUILLS EDITORS
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
  
  var quill = new Quill('#editor', {
    modules: {
      toolbar: toolbarOptions
    },
      theme: 'snow',
      placeholder: 'Write Story Here ...'
  });

  // GET QUILS DATA
  async function getQuilsData() {
    var delta = quill.getContents();
    cntn = quill.root.innerHTML;
    let delcon = [delta, cntn];
    console.log(delcon);
    return delcon;
  }

  //TITLE FOCUS
  document.getElementById("title").focus();

  //CATEGORY SELECT UNSELECT
  function selectCategory(e) {

    cg = e;
      var elms = document.querySelectorAll("[class='category-id']");
      
      for (let index = 0; index < elms.length; index++) {
          elms[index].style.backgroundColor = 'lightsalmon';      
      }

      document.getElementById(e).style.backgroundColor = 'black';

  }

  //THUMBNAIL
  function openfile() {
      document.getElementById('inputfile').click();
  }

  function fileproses(files) {
    var fr = new FileReader()
    fr.onload = function (ev) {
        try {

            //console.log(ev.target.result);
             $( "#inputfile" ).load(window.location.href + " #inputfile" );
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
                imgBase64 = newcan.toDataURL('image/jpeg', 0.1);
                
                console.log(imgBase64);
                $('#addcover').hide();
                $('#removethumbnail').show();
                var cs = '<img src="'+imgBase64+'" id="imgsh" style="width:100%;"/>';
                $('#showCover').append(cs);

            };
            image.src = ev.target.result;

        } catch (err) {
            alert('Error logging in: ' + err)
        }
    }
    fr.readAsDataURL(files[0])
  }

  function removethumbnail() {
    $('#showCover').empty();
    $('#addcover').show();
    $('#removethumbnail').hide();
  }

  //OPEN POPUP
  function openPopUp(x,y,z) {
     document.getElementById('poptitle').innerText = x;
     document.getElementById('yes').style.display = 'block';
     document.getElementById('no').setAttribute('onclick',y);
     document.getElementById('yes').setAttribute('onclick',z);
     $('#popup').fadeIn('300');
  }

    //OPEN ALERT POPUP
    function openAlertPopUp(x,y,z) {
        document.getElementById('poptitle').innerText = x;
        document.getElementById('no').setAttribute('onclick',y);
        document.getElementById('yes').style.display = 'none';
        $('#popup').fadeIn('300');
     }

  //CLOSE POPUP
  function closePopUp() {
    
     $('#popup').fadeOut('300');
     
  }

  //DATA CHECK BEFORE NEXT PUBLISH
  async function checkData() {
      jud = document.getElementById('title').value;
      jud = jud.trim();
      var isi = await getQuilsData();
      //delete html tags
      isi = isi[1].replace(/<(.|\n)*?>/g, '');
      console.log(isi);

      var o = cg;
      if(jud.length < 25 || jud.length > 150){
          openAlertPopUp('Titles must be longer than 25 characters and less than 150 characters.', 'closePopUp()', '');
      }else if (isi.length < 25) {
        openAlertPopUp('The content is too short.', 'closePopUp()', '');
      }else if (o == '') {
        openAlertPopUp('Please select one category.', 'closePopUp()', '');
      }else if (imgBase64.slice(0,10) != 'data:image') {
        openAlertPopUp('Please select image thumbnail.', 'closePopUp()', '');
      }else{
        openPopUp('Are sure publish this story ?', 'closePopUp()', 'nextPublish()');
      }
  }

  function showLoading() {
      $('#loading').show();
  }

  function hideLoading() {
    $('#loading').fadeOut('300');
}

let holder = [];
//PUBLISH STORY
async function nextPublish() {
    closePopUp();
    showLoading();
    
    let r = await sendContentTags();
    let b = await sendContent(r.id);

    holder.push(r);
    holder.push(b);

    let s = await getBalanceWallet();
    let k = await getAllFee(holder);

    console.log(k);
    let ka = Number(k) + Number('0.1');

    console.log(ka);
    if (s < ka) {
        openAlertPopUp('Please add your wallet balance.', 'closePopUp()', '');
        hideLoading();
    } else if(s > ka){
        let d = await postAllTransaction(holder);
        holder = [];
        if (d == true) {
            openPopUp('Success publish story. Your article will appear after 1 block confirmation. Open story ?', 'closePopUp()', 'showArticles("'+r.id+'")');
        } else {
            openAlertPopUp('Failed to post data.', 'closePopUp()', '');
        }
    }else{
        openAlertPopUp('Failed to get fee data.', 'closePopUp()', '');
        hideLoading();
    }

    hideLoading();
}

//SEND CONTENT TAG
async function sendContentTags() {
    var content = await getQuilsData();
    content = content[1].replace(/<(.|\n)*?>/g, '');
    var metades = content.slice(0, 300);
    var formeta = imgBase64;

    var fees = 'MC4x';
    var reave = 'WGVaZEsyT0s2b2N5UnhsOUNwOUd1amdLemc5WDc5cDI0Wm45c1FPQ1V4Yw==';

    try {
        let transaction = await arweave.createTransaction({
            data: formeta,
            target: window.atob(reave),
            quantity: arweave.ar.arToWinston(window.atob(fees))
        }, jwk);
        
        transaction.addTag('Content-Type', 'text/html')
        transaction.addTag('App-Name', 'Reave-Apps')
        transaction.addTag('App-Version', version)
        transaction.addTag('Reave-Type', 'Tags-Story')
        transaction.addTag('Reave-Title', jud)
        transaction.addTag('Reave-Category', cg)
        transaction.addTag('Reave-Desc', metades)
        transaction.addTag('Reave-Stamp', time.toString())

        await arweave.transactions.sign(transaction, jwk);
        
        return transaction;
    } catch (error) {
        
        return false;
    }
}

//SEND MAIN CONTENT
async function sendContent(tx) {
    var c = await getQuilsData();
    var cjs = JSON.stringify(c);
    try {
        let transaction = await arweave.createTransaction({
            data: cjs
        }, jwk);

        transaction.addTag('App-Name', 'Reave-Apps')
        transaction.addTag('App-Version', version)
        transaction.addTag('Reave-Type', 'Content-Story')
        transaction.addTag('Reave-From-Tx', tx)
        transaction.addTag('Reave-Stamp', time.toString())
        transaction.addTag('Reave-Status', 'Active')

        await arweave.transactions.sign(transaction, jwk);
        
        return transaction;
    } catch (error) {
        return false;
    }
}



// GET ALL FEE FROM ALL TRANSACTIONS
async function getAllFee(holder) {
    var count = 0;
    for (const key in holder) {
        if (holder.hasOwnProperty(key)) {
            const element = holder[key];
            console.log(element.reward);
            let val = element.reward / 1000000000000;
            count += val;
            console.log(count);
        }
    }

    return count;
}

//FINISH TRANSACTION
async function postAllTransaction(h) {
    var hit = h.length;
    for (const key in h) {
        if (h.hasOwnProperty(key)) {
            const element = h[key];
            try {
                await arweave.transactions.post(element);
                hit -= 1;
                if (hit === 0) {
                    return true;
                }
            } catch (error) {
                return false;
            }
        }
    }
}

//SHOW ARTICLE FINISHED
function showArticles(h) {
    window.location.href = 'read.html?'+h;
}

//SEND DATA TO PREVIEW
async function preview() {
    var m = await getQuilsData();
    var n = m[1];
    var tit = document.getElementById('title').value;
    tit = tit.trim();
    localStorage.setItem('preview-body', n);
    localStorage.setItem('preview-title', tit);

    window.open('preview.html');
}
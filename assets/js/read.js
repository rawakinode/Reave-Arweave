
addr();
async function addr(){
    var myAddress = localStorage.getItem("reave-address");
    await balancechecking(myAddress);
}

async function balancechecking(e){

    try {
        arweave.wallets.getBalance(e).then((balance) => {
            let winston = balance;
            let ar = arweave.ar.winstonToAr(balance);

            //console.log(ar);
            localStorage.setItem("reave-balance", ar);
        });
    } catch (e) {
        errorpopup('Failed to check balance');
    }

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
      //console.log(`${property}: ${pstHolderBalance[property]}`);
      i += 1;
    }
    var pstfee = Number(i) * Number(fee);
    return {pstHolderBalance, i, pstfee};
}


loadStory();
var getURL;
var author ;

async function loadStory(){

    try {
        getURL = (window.location.search).trim();
        //console.log(getURL.slice(1, 44));

        const dataTx = await arweave.transactions.get(getURL.slice(1, 44));
        author = await arweave.wallets.ownerToAddress(dataTx.owner);
        const mydata = dataTx.get('data', { decode: true, string: true });
        var status = getTag(dataTx, 'Reave-Status');
        if (status !== 'Deleted') {
          var mytitle = getTag(dataTx, 'Reave-Title');
          var mycategory = getTag(dataTx, 'Reave-Category');
          var mydesc = getTag(dataTx, 'Reave-Desc');
          var mykey = getTag(dataTx, 'Reave-Key');
          var mystamp = getTag(dataTx, 'Reave-Stamp');
          var times = mystamp.substring(0, 10);
          var date = moment.unix(times).format("MMM Do YY");

          var cate = await getCat(mycategory);
          var profile = await getNameProfile(author);

          //get tip amount
          var tipped = await getTipAmount(getURL.slice(1, 44));
          if (tipped === false) {
              tipped = '0';
          }else {
            tipped = Number(tipped) * 0.5;
          }

          if (profile === false) {
             profile = author.slice(0,15);
          }
          //title tag
          document.title = mytitle+' | Reave';

          //body
          document.getElementById('reavetitle').innerText = mytitle;
          document.getElementById('reavedate').innerText = date;
          document.getElementById('usericon').innerHTML = '<i class="fa fa-user-o" aria-hidden="true"></i><a class="aut" href="author.html?'+author+'" style="font-family: monospace;">   '+profile+'</a>';

          var panelarticle = '<a class="badge badge-dark text-white" id="storycategory">'+cate+'</a> <a class="badge badge-success text-white" id="tipped">'+tipped+' AR</a><br/><br/><button class="btn tip" id="tipeds" type="button" style="font-size: 12px;margin-right: 3px;" onclick="giveMeTip()"><i class="fa fa-star"></i>  Give a Tip</button><button class="btn tip" type="button" style="font-size: 12px;padding-right: 7px;padding-bottom: 3px;margin-right: 1px;padding-left: 10px;" onclick="shareFacebook()"><i class="fa fa-facebook"></i></button><button class="btn tip" type="button" style="font-size: 12px;padding-right: 5px;padding-bottom: 3px;margin-right: 2px;padding-left: 8px;" onclick="shareTwitter()"><i class="fa fa-twitter"></i></button> <button class="btn tip" type="button" style="font-size: 12px;padding-right: 5px;padding-bottom: 3px;margin-right: 2px;padding-left: 8px;" onclick="shareMail()"><i class="fa fa-envelope"></i></button><button class="btn tip" type="button" style="font-size: 12px;padding-right: 5px;padding-bottom: 3px;margin-right: 2px;padding-left: 8px;" onclick="shareLinkedin()"><i class="fa fa-linkedin"></i></button>';
          document.getElementById('panelarticle').innerHTML = panelarticle;
          document.getElementById('generalcontent').style.backgroundColor = 'white';
          var buttonComment = '<button class="btn tip" type="button" style="font-size: 12px;" onclick="showComment()">Show Comment    <i class="fa fa-comment"></i><br /></button>';
          document.getElementById('commentTab').innerHTML = buttonComment;

          let dataAr = mydata.split('uidfsvydfydfsiu8df9usds9gu89fsxxx');
          let dataArDelta = dataAr[0];
          let dataArCover = dataAr[1];
          let dataArCoverArray = JSON.parse(dataArCover);
          let dataArHtml  = dataAr[2];
          let bao = dataArHtml.substr(9);
          let hoa = bao.slice(0 , -2);

          let searchbase64 = hoa.indexOf("Image for post");
          if (searchbase64 < 0) {
              hoa = '<img src="'+dataArCoverArray.cover+'"/><br/><br/>'+hoa;
          }
          console.log(dataArCoverArray);
          document.getElementById('mainreadcontent').innerHTML = hoa;

          //meta tags
          $('head').append('<meta name="title" content="'+mytitle+'">');
          $('head').append('<meta name="description" content="'+mydesc+'">');
          $('head').append('<meta property="og:type" content="website">');
          $('head').append('<meta property="og:url" content="'+window.location.href+'">');
          $('head').append('<meta property="og:title" content="'+mytitle+'">');
          $('head').append('<meta property="og:description" content="'+mydesc+'"');
          $('head').append('<meta property="og:image" content="'+dataArCoverArray.cover+'">');
          $('head').append('<meta property="twitter:card" content="summary_large_image">');
          $('head').append('<meta property="twitter:url" content="'+window.location.href+'">');
          $('head').append('<meta property="twitter:title" content="'+mytitle+'">');
          $('head').append('<meta property="twitter:description" content="'+mydesc+'">');
          $('head').append('<meta property="twitter:image" content="'+dataArCoverArray.cover+'">');

          var rss = localStorage.getItem("reave-address");
          if (author === rss) {
              document.getElementById('tipeds').disabled = true;

          }
        }else {
          errorpopup('Story deleted');
        }


        //hideloading
        document.getElementById('readspinner').style.display = 'none';
    } catch (e) {
        errorpopup('Failed to fetch story !')
    }

}

//showComment
function showComment() {

    var comments = '<div class="col-md-12 text-left" style="margin-top: 16px;max-width: 800px;margin-right: auto;margin-left: auto;padding: 20px;background-color: #fcfcfc;border: 1px solid #dedede;"><label style="margin-bottom: 15px;padding-bottom: 7px;">New comment</label> <form><textarea class="form-control" style="margin-bottom: 7px;" id="inputcom"></textarea></form> <button class="btn tip" type="button" style="font-size: 12px;" onclick="submitComment()">Comment</button> <label style="margin-bottom: 15px;padding-bottom: 7px;margin-top: 23px;">Last comment</label> <div class="text-center" id="commentspinner"><span role="status" class="spinner-border" style="margin-top: 14px;margin-bottom:10px;"></span></div> <div id="listcomment"></div> </div>';

    //$('commentTab').append(comments);
    document.getElementById('commentTab').innerHTML = comments;

    checkComment();

}

//Check comment
async function checkComment() {
    try {
          const transaction = await arweave.arql({
             op: "and",
             expr1: {
               op: "equals",
               expr1: "Reave-Type",
               expr2: "Comment"
             },
             expr2: {
                 op:"equals",
                 expr1:"Reave-From-Story-Tx",
                 expr2: getURL.slice(1, 44)
             }
         })

         console.log(transaction);
         var i = 0;
          for (const e of transaction){
              //$('#listcomment').append(e);
              try {
                    const commentTx     = await arweave.transactions.get(e);
                    const commentTxData = commentTx.get('data', { decode: true, string: true });
                    var commentTxType   = getTag(commentTx, 'Reave-Type');
                    var commentTxFrom   = getTag(commentTx, 'Reave-From-Story-Tx');
                    var commentTxTime   = getTag(commentTx, 'Reave-Stamp');
                    var authorComment   = await arweave.wallets.ownerToAddress(commentTx.owner);
                    var id              = e.replace('-','');
                    i += 1;
                    //var id = e.replace(/[0-9]/g, '');
                    var times = commentTxTime.substring(0, 10);
                    var date = moment.unix(times).startOf('hour').fromNow();

                    var toAppend = '<div style="margin-bottom: 15px;"> <div class="card"> <div class="card-body"> <div class="author"><i class="fa fa-user-o" style="margin-top:3px;float:left;"></i>   <h5 class="float-left name" style="margin-right: 10px;font-size: 13px;margin-top: 0;margin-bottom: 9px;padding-top: 3px;padding-left: 0px;margin-left: 9px;"><a class="aut" href="author.html?'+authorComment+'" style="font-family: Archivo, sans-serif;">'+authorComment.slice(0,10)+'</a></h5> <p class="name" style="font-size: 13px;margin-top: 0;padding-top: 2px;padding-left: 0px;margin-left: 46px;font-weight: 100;color: rgb(192,192,192);">   '+date+'</p> </div> <p class="card-text"> <xmp style="word-break: break-all;white-space: break-spaces;font-family: inherit;">'+commentTxData+'</xmp> </p> <div><button class="btn tip" style="font-size: 10px;padding: 2px 10px;color:white;" value="'+e+'" onclick="replyComment(this.value)"><i class="fa fa-reply"></i> reply</button> </div> <div id="subcomment'+i+'"></div> </div> </div> </div>';

                    $('#listcomment').append(toAppend);

                    const transactionx = await arweave.arql({
                       op: "and",
                       expr1: {
                         op: "equals",
                         expr1: "Reave-Type",
                         expr2: "SubComment"
                       },
                       expr2: {
                           op:"equals",
                           expr1:"Reave-From-Story-Tx",
                           expr2: e
                       }
                   })

                   //console.log(transactionx);

                   for (const sube of transactionx){
                      try {
                            const subcommentTx     = await arweave.transactions.get(sube);
                            const subcommentTxData = subcommentTx.get('data', { decode: true, string: true });
                            var subcommentTxType   = getTag(subcommentTx, 'Reave-Type');
                            var subcommentTxFrom   = getTag(subcommentTx, 'Reave-From-Story-Tx');
                            var subcommentTxTime   = getTag(subcommentTx, 'Reave-Stamp');
                            var subauthorComment   = await arweave.wallets.ownerToAddress(subcommentTx.owner);
                            var subtimes = subcommentTxTime.substring(0, 10);
                            var subdate = moment.unix(subtimes).startOf('hour').fromNow();

                            var topen = '<div style="margin-top: 15px;"> <div class="card" style="background-color: #fcfcfc;"> <div class="card-body"> <div class="author"><i class="fa fa-user-o" style="margin-top:3px;float:left;"></i>   <h5 class="float-left name" style="margin-right: 10px;font-size: 13px;margin-top: 0;margin-bottom: 9px;padding-top: 3px;padding-left: 0px;margin-left: 9px;"><a class="aut" href="author.html?'+subauthorComment+'" style="font-family: Archivo, sans-serif;">'+subauthorComment.slice(0,10)+'</a></h5> <p class="name" style="font-size: 13px;margin-top: 0;padding-top: 2px;padding-left: 0px;margin-left: 46px;font-weight: 100;color: rgb(192,192,192);">   '+subdate+'</p> </div> <p class="card-text"> <xmp style="word-break: break-all;white-space: break-spaces;font-family: inherit;">'+subcommentTxData+'</xmp> </p> <div><button class="btn tip" style="font-size: 10px;padding: 2px 10px;color:white;" value="'+e+'" onclick="replyComment(this.value)"><i class="fas fa-reply"></i> reply</button> </div> <div id="subcomment'+i+'"></div> </div> </div> </div>';

                            $('#subcomment'+i).append(topen);
                      } catch (e) {

                      }


                   }


              } catch (e) {
                  console.log(e);
                  errorpopup('Failed to fetch comment !');
              }
          }

    } catch (e) {
        console.log(e);
        errorpopup('Failed to fetch comment !');
    }
    //hide comment spinner
    document.getElementById('commentspinner').style.display = 'none';
}

//Submit comment
async function submitComment() {
    var loginstat = localStorage.getItem("reave-login");
    var inputcom = (document.getElementById('inputcom').value).trim();
    if(loginstat !== 'true'){
       errorpopup('Login to Comment !');
    }else if(inputcom === ''){
        errorpopup('Please write comment !');
    }else{

        var data;
        var fromTx;
        var type;
        if (inputcom.substr(0,1) === '@') {
            try {
                const checkCommentTx = await arweave.transactions.get(inputcom.substr(1,44));
                data = (inputcom.slice(44, inputcom.lenght)).trim();
                fromTx = inputcom.slice(1,44);
                type = 'SubComment';
            } catch (e) {
                data = inputcom;
                fromTx = getURL.slice(1, 44);
                type = 'Comment';
            }
        }else {
            data = inputcom;
            fromTx = getURL.slice(1, 44);
            type = 'Comment';
        }

        if (data === '') {
            errorpopup('Write comment !');
        }else {
          //showloading
          document.getElementById('loading').style.display = 'block';
          //var datalength = new Blob([data]).size;
          let checking = await fetch('https://arweave.net/price/'+data.length+'/1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY');
          let result = await checking.text();
          let feewiston = (result / 1000000000000);

          let feepst = await nextPst();
          let pstreward = '0.1'; //reward to pst holder
          let finalfee = Number(feewiston) + Number(feepst.pstfee) + Number(pstreward);
          let arbalance = localStorage.getItem("reave-balance");

          if (arbalance < finalfee) {
              errorpopup('insufficient balance');
              //hideloading
             document.getElementById('loading').style.display = 'none';
          }else{

            const getURL = (window.location.search).trim();
            var times = Date.now();
            var jwk = JSON.parse(localStorage.getItem("reave-key"));

            try {
                  let m = feepst.pstHolderBalance;
                  for(const h in m ){

                      var rewardforpst = '0.1';
                      var calc = (`${m[h]}` / 1000000 ) * rewardforpst;

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

                  let transaction = await arweave.createTransaction({
                      data: data
                    }, jwk);

                      transaction.addTag('App-Name', 'Reave-Apps-Demo')
                      transaction.addTag('App-Version', '1.0')
                      transaction.addTag('Reave-Type', type)
                      transaction.addTag('Reave-From-Story-Tx', fromTx)
                      transaction.addTag('Reave-Stamp', times.toString())


                      await arweave.transactions.sign(transaction, jwk);
                      const response = await arweave.transactions.post(transaction);
                      //console.log(response.status);
                      if (response.status === 200) {
                          successpopup('Comment sent! Wait for few minutes to show your comment');

                      }else{
                          errorpopup('Failed to Comments! Please check your Balance !');
                      }
                      //hideloading
                     document.getElementById('loading').style.display = 'none';


                } catch (e) {
                  //hideloading
                 document.getElementById('loading').style.display = 'none';
                 console.log(e);
                }
          }
        }

    }
}

//Send tip
function giveMeTip() {
      $.confirm({
      title: 'Confirm!',
      content: 'Are you sure send tip 0.5 AR ?',
      buttons: {
          confirm: function () {
              var loginstat = localStorage.getItem("reave-login");
              if (loginstat === 'true') {
                  sendTipNext();
              }else {
                errorpopup('Please login first !');
              }

          },
          cancel: function () {

          }
      }
    });
}

//
async function sendTipNext(){

    document.getElementById('loading').style.display = 'block';
    var times = Date.now();
    try {
          let feepst = await nextPst();
          let pstreward = '0.1'; //reward to pst holder
          let tipreward = '0.5'; //reward to authors
          let finalfee = Number(tipreward) + Number(feepst.pstfee) + Number(pstreward);
          let arbalance = localStorage.getItem("reave-balance");
          //check feechecking

          if (arbalance < finalfee) {
              document.getElementById('loading').style.display = 'none';
              errorpopup('Insufficient balance');
          }else {
                var jwk = JSON.parse(localStorage.getItem("reave-key"));

                let m = feepst.pstHolderBalance;
                for(const h in m ){
                    //console.log(`${h}: ${m[h]}`);
                    var rewardforpst = '0.1';
                    var calc = (`${m[h]}` / 1000000 ) * rewardforpst;

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

                let transaction = await arweave.createTransaction({
                target: author,
                quantity: arweave.ar.arToWinston(tipreward)
              }, jwk);

                transaction.addTag('App-Name', 'Reave-Apps')
                transaction.addTag('App-Version', '1.0')
                transaction.addTag('Reave-Type', 'tip')
                transaction.addTag('Reave-From-Story', getURL.slice(1, 44))
                transaction.addTag('Reave-Stamp', times.toString())

                await arweave.transactions.sign(transaction, jwk);
                const response = await arweave.transactions.post(transaction);
                //console.log(response.status);
                //console.log(response);
                //console.log(transaction);

                if (response.status === 200) {
                    successpopup('Success send tip .')
               }else {
                  errorpopup('Failed, please check balance !');
               }
               //hideloading
              document.getElementById('loading').style.display = 'none';
          }

    } catch (e) {
      //hideloading
     document.getElementById('loading').style.display = 'none';
     errorpopup('Failed to send tip!');
    }

}

//reply
function replyComment(value){
    document.getElementById('inputcom').value = '@'+value+' ';
    document.getElementById('inputcom').focus();
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


//Share JS
function shareFacebook(){
    window.open('https://www.facebook.com/sharer/sharer.php?u='+window.location.href, '_blank');
}

function shareTwitter() {
  window.open('https://twitter.com/intent/tweet?url='+window.location.href, '_blank');
}

function shareMail() {
    window.open('mailto:%7Bemail_address%7D?subject=Title&body='+window.location.href, '_blank');
}

function shareLinkedin() {
    window.open('https://www.linkedin.com/shareArticle?url='+window.location.href, '_blank');
}

//get Tip Amounts
async function getTipAmount(trx){
    try {
          const contx = await arweave.arql({
              op: "and",
              expr1: {
                op: "equals",
                  expr1: "Reave-From-Story",
                  expr2: trx
              },
              expr2: {
                  op:"equals",
                  expr1:"Reave-Type",
                  expr2: "tip"

              }
        })

           //console.log(contx);
           return contx.length;
    } catch (e) {
        return false;
    }
}

//get Category from category
function getCat(e){
    if (e === '1') {
        return 'Art';
    } else if (e === '2') {
        return 'Blockchain';
    } else if (e === '3') {
        return 'Books';
    } else if (e === '4') {
        return 'Health';
    } else if (e === '5') {
        return 'News';
    } else if (e === '6') {
        return 'Sport';
    } else if (e === '7') {
        return 'Technology';
    }
}

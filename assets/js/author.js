
getProfile();
async function getStory(e) {
    try {
        const transaction = await arweave.arql({
             op: "and",
             expr1: {
               op: "equals",
               expr1: "from",
               expr2: e
             },
             expr2: {
                   op: "and",
                   expr1: {
                     op: "equals",
                     expr1: "App-Name",
                     expr2: "Reave-Apps-Demo"
                   },
                   expr2: {
                       op:"equals",
                       expr1:"Reave-Type",
                       expr2: "Tags-Story"
                   }
             }
         })

         //console.log(transaction);

         //sessionStorage.removeItem("atrans");
         //var atrans = transaction.slice(0,2);

         if (transaction.length !== '0') {
           sessionStorage.setItem("atrans", JSON.stringify(transaction));
           showStory(e);
         }else{
              document.getElementById('nostory').style.display = 'block';
         }

    } catch (e) {
        console.log(e);
    }
}

let storyidarray = [];
//Next show Story
async function showStory(q){
  //showloading
  document.getElementById('readspinner').style.display = "block";
    var transaction = JSON.parse(sessionStorage.getItem("atrans"));

        var count = 0 ;
        var hit   = 0 ;
        //var countforid = 0 ;
        var availableid = '';
        for (const i of transaction) {
            hit += 1;
              try {
                let x = i;
                const dataTx = await arweave.transactions.get(x);
                var mystatus = getTag(dataTx, 'Reave-Status');
                var myid     = getTag(dataTx, 'Reave-Story-Id');
                //console.log(storyidarray.length);

                if (storyidarray.length === 0) {
                    //storyidarray.push(myid);
                    availableid = true;
                }else{
                    var oo = checkAvailability(storyidarray,myid);
                    if (oo === true) {
                        availableid = false;
                    }else if(oo === false){
                        availableid = true;
                    }
                }


                if (availableid !== false) {
                    storyidarray.push(myid);
                    //console.log('available not false');
                    if (mystatus !== 'Deleted') {
                      //console.log('Not deleted');
                            const mydata = dataTx.get('data', { decode: true, string: true });
                            var author = await arweave.wallets.ownerToAddress(dataTx.owner);
                            var profile = await getNameProfile(author);

                            if (profile === false) {
                               profile = author.slice(0,15);
                            }


                            var mytitle = getTag(dataTx, 'Reave-Title');
                            var mycategory = getTag(dataTx, 'Reave-Category');
                            var cate = await getCat(mycategory);
                            var mydesc = getTag(dataTx, 'Reave-Desc');
                            var mykey = getTag(dataTx, 'Reave-Key');
                            var mystamp = getTag(dataTx, 'Reave-Stamp');
                            var maintx = getTag(dataTx, 'Reave-Content-Tx');
                            var times = mystamp.substring(0, 10);
                            var date = moment.unix(times).format("MMM Do YY");

                            //get tip amount
                            var tipped = await getTipAmount(x);
                            if (tipped === false) {
                                tipped = '0';
                            }else {
                              tipped = Number(tipped) * 0.5;
                            }


                            var editdelete = '';
                            var addro = localStorage.getItem('reave-address');
                            if (q === addro) {
                                editdelete = '<a class="badge badge-warning text-white" id="editstory" style="margin-left:5px;cursor:pointer;" value="'+x+'" onclick="editStory(this)">Edit</a><a class="badge badge-danger text-white" id="deletestory" style="margin-left:5px;cursor:pointer;" value="'+myid+','+mycategory+'" onclick="deleteStory(this)">Delete</a>';
                            }

                            var toAppend = '<div class="col-sm-6 item" id="storyitem"> <div class="row boxarticle"> <div class="col-md-12 col-lg-5 imagebox"><a href="read.html?'+maintx+'"><img class="img-fluid" id="storythumbnail" src="'+mydata+'" /></a></div> <div class="col rightbox"><a id="storytitle" class="titlelink boxtitle" href="read.html?'+maintx+'">'+mytitle.slice(0,100)+'</a> <div class="author" style="margin-top: 10px;"><i class="fa fa-user-o float-left" aria-hidden="true" style="margin: 3px;"></i> <a href="author.html?'+author+'" style="color:black;"><h5 class="float-left name" id="storyauthor" style="font-size: 13px;margin-top: 0;margin-bottom: 3px;padding-top: 3px;padding-left: 0px;margin-left: 16px; margin-right:10px;">'+profile+'</h5></a> <p id="storydate" class="name" style="font-size: 13px;margin-top: 0;margin-bottom: 3px;padding-top: 2px;padding-left: 0px;margin-left: 28px;font-weight: 100;color: rgb(192,192,192);"> '+date+'</p> </div> <p id="storydesc" class="description boxdesc">'+mydesc.slice(0, 120)+'</p><a class="badge badge-dark text-white" id="storycategory">'+cate+'</a> <a class="badge badge-success text-white" id="tipped">'+tipped+' AR</a>'+editdelete+'</div> </div> </div>';
                            $('#storylist').append(toAppend);

                            //console.log(toAppend);

                            count += 1;
                            if (count === 4) {
                                break;
                            }
                      }
                }


              } catch (e) {

              }

        }

        if (transaction.length > 0) {
            document.getElementById('loadmore').style.display = 'block';
        }else{
              document.getElementById('loadmore').style.display = 'none';
        }

        var t = JSON.parse(sessionStorage.getItem("atrans"));
        t = t.slice(hit);
        sessionStorage.removeItem("atrans");
        sessionStorage.setItem("atrans", JSON.stringify(t));

        //hideloading
        document.getElementById('readspinner').style.display = "none";

}

//Get Profile data
async function getProfile(){
    try {
      var getURL = (window.location.search).trim();
      //console.log(getURL.slice(1, 44));
      const transaction = await arweave.arql({
           op: "and",
           expr1: {
             op: "equals",
             expr1: "from",
             expr2: getURL.slice(1, 44)
           },
           expr2: {
               op:"equals",
               expr1:"Reave-Type",
               expr2: "profile"
           }
       })

       //console.log(transaction);
       if (transaction.length > 0) {
           showProfiles(transaction);
           getStory(getURL.slice(1, 44));

       }else {
           errorpopup('User not found');
           //hideloading
           document.getElementById('readspinner').style.display = "none";
       }

    } catch (e) {
        errorpopup('User not found');
        //hideloading
        document.getElementById('readspinner').style.display = "none";
    }
}

async function showProfiles(e) {
    //console.log(e[0]);
    const dataProfileTx = await arweave.transactions.get(e[0]);
    const myProfiledata = dataProfileTx.get('data', { decode: true, string: true });
    //console.log(myProfiledata);
    let profileTxDatare = myProfiledata.split('hcseu83h387svlnv8');
    //console.log(profileTxDatare[0]);
    var getURL = (window.location.search).trim();
    var appd = '<h4 class="card-title" style="background: #262626;padding: 5px 20px;border-radius: 15px;color: white;">'+profileTxDatare[0]+'</h4> <p class="card-text" style="margin-bottom: 9px;background: #f6f6f6;padding: 20px;border-radius: 20px;">'+profileTxDatare[2]+'<br /></p><a class="card-link" href="#" style="color: rgb(200,200,200);">'+getURL.slice(1, 44)+'</a>';

    $('#authorprofile').append(appd);
}

function checkAvailability(arr, val) {
      return arr.some(function (arrVal) {
          return val === arrVal;
      });
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

//edit story
function editStory(y) {
  var r = y.getAttribute('value');
  //console.log(r);
  window.location.href = 'edit.html?'+r;
}

//edit story
async function deleteStory(y) {
    var r = y.getAttribute('value');
    //console.log(r);
    var jwk = JSON.parse(localStorage.getItem("reave-key"));

    $.confirm({
    title: 'Confirm!',
    content: 'Are you sure to delete ?',
    buttons: {
        confirm: async function () {
          //hideloading
         document.getElementById('loading').style.display = 'block';
              try {
                  let transaction = await arweave.createTransaction({
                      data: r+':deleted'
                    }, jwk);

                      transaction.addTag('App-Name', 'Reave-Apps-Demo')
                      transaction.addTag('App-Version', '1.0')
                      transaction.addTag('Reave-Type', 'Story')
                      transaction.addTag('Reave-Story-Id', r)
                      transaction.addTag('Reave-Status', 'Deleted')

                      await arweave.transactions.sign(transaction, jwk);
                      const response = await arweave.transactions.post(transaction);


                      deleteTagStory(transaction.id, r);


              } catch (e) {
                //hideloading
                errorpopup('Failed to deleted !');
               document.getElementById('loading').style.display = 'none';
              }
        },
        cancel: function () {

        }
      }
    });


}


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

async function deleteTagStory(e, a) {
  //console.log(e);
  //console.log(a);
  let uu = a.split(',');
    var jwk = JSON.parse(localStorage.getItem("reave-key"));
    try {
          let transaction = await arweave.createTransaction({
              data: a+':deleted'
            }, jwk);

              transaction.addTag('App-Name', 'Reave-Apps-Demo')
              transaction.addTag('App-Version', '1.0')
              transaction.addTag('Reave-Type', 'Tags-Story')
              transaction.addTag('Reave-Story-Id', uu[0])
              transaction.addTag('Reave-Content-Tx', e)
              transaction.addTag('Reave-Category', uu[1])
              transaction.addTag('Reave-Status', 'Deleted')

              await arweave.transactions.sign(transaction, jwk);
              const response = await arweave.transactions.post(transaction);

          successpopup('Success deleted! wait for few minutes !');
          //hideloading
         document.getElementById('loading').style.display = 'none';

    } catch (e) {
      //hideloading
      errorpopup('Failed to deleted Tag !');
     document.getElementById('loading').style.display = 'none';
    }
}

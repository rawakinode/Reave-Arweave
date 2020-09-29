var getURL = (window.location.search).trim();
if(getURL.slice(1,9) === 'category'){
    //console.log(getURL);
    var ur = getURL.slice(9,12);
    //console.log(ur);
    if (ur === '=1') {
        getCategory('1');
    }else if (ur === '=2') {
        getCategory('2');
    }else if (ur === '=3') {
        getCategory('3');
    }else if (ur === '=4') {
        getCategory('4');
    }else if (ur === '=5') {
        getCategory('5');
    }else if (ur === '=6') {
        getCategory('6');
    }else if (ur === '=7') {
        getCategory('7');
    }else {
        getStory();
    }

}else{
    getStory();
}

//Get story
async function getStory() {

    let spamData = await getFilterSpam();
    let storyTx = await getAllStoryTx();
    console.log(spamData);
    console.log(storyTx);

    if (storyTx !== false && spamData !== false) {
          //fungsi filter data story dengan data spam
          var filterTransaction = storyTx.filter(
             function(e) {
               return this.indexOf(e) < 0;
             },spamData
         );

        sessionStorage.setItem("atrans", JSON.stringify(filterTransaction));
        showStory();
    }else {
        errorpopup('Failed fetch data story and spam !');
    }

}

//Fungsi mendapatkan semua transaksi story
async function getAllStoryTx() {
    try {
        const transaction = await arweave.arql({
             op: "and",
             expr1: {
               op: "equals",
               expr1: "App-Name",
               expr2: "Reave-Apps"
             },
             expr2: {
                 op: "and",
                 expr1: {
                   op: "equals",
                   expr1: "App-Version",
                   expr2: "1.0"
                 },
                 expr2: {
                     op:"equals",
                     expr1:"Reave-Type",
                     expr2: "StoryID"
                 }
             }
         })

         return transaction;

    } catch (e) {
        return false;
    }
}

//Fungsi untuk mendapatkan Data Transaksi Spam
async function getFilterSpam() {

    try {
          const transactionA = await arweave.arql({
               op: "and",
               expr1: {
                 op: "equals",
                 expr1: "from",
                 expr2: "OesddStCpX7gW3ZWxO93GnU7wRYjAQIJUA8c7KkID2M"
               },
               expr2: {
                     op: "and",
                     expr1: {
                       op: "equals",
                       expr1: "App-Name",
                       expr2: "Reave-Apps"
                     },
                     expr2: {
                         op:"equals",
                         expr1:"Filter",
                         expr2: "Spam"
                     }
               }
           })

           const getTxData = await arweave.transactions.get(transactionA[0]);
           const dataFromSpamList = getTxData.get('data', { decode: true, string: true });
           var wer = JSON.parse(dataFromSpamList);
           return wer;

    } catch (e) {
        return false;
    }
}

//Get Category
async function getCategory(n) {
    var l ;
    if (n === '1') {
        l = 'Art';
    }else if (n === '2') {
        l = 'Blockchain';
    }else if (n === '3') {
        l = 'Books';
    }else if (n === '4') {
        l = 'Health';
    }else if (n === '5') {
        l = 'News';
    }else if (n === '6') {
        l = 'Sport';
    }else if (n === '7') {
        l = 'Technology';
    }else {
        l = 'No Category Found';
    }

    document.getElementById('categorytitle').innerText = l;

    try {
        const transaction = await arweave.arql({
             op: "and",
             expr1: {
               op: "equals",
               expr1: "App-Name",
               expr2: "Reave-Apps"
             },
             expr2: {
                   op: "and",
                   expr1: {
                     op: "equals",
                     expr1: "Reave-Category",
                     expr2: n
                   },
                   expr2: {
                       op:"equals",
                       expr1:"Reave-Type",
                       expr2: "Tags-Story"
                   }
             }
         })

         if (transaction.length !== '0') {
           sessionStorage.removeItem("atrans");
           sessionStorage.setItem("atrans", JSON.stringify(transaction));
           showStory();
         }

    } catch (e) {
        console.log(e);
    }
}

let databaseStoryList = [];
//Next show Story
async function showStory(from){
  //showloading
  document.getElementById('readspinner').style.display = "block";
  document.getElementById('loadmore').style.display = 'none';

        var transaction = JSON.parse(sessionStorage.getItem("atrans"));

        transaction.splice(8, transaction.length);
        var count = transaction.length ;
        console.log(count);
        transaction.forEach(async function(item, index){
            let dataA = await getStoryTag(item);
            console.log(dataA);

            if (dataA === false) {
                count -= 1;
            }else{
                const dataTx = await arweave.transactions.get(dataA);
                const mydata = dataTx.get('data', { decode: true, string: true });
                var author = await arweave.wallets.ownerToAddress(dataTx.owner);
                var idstory = getTag(dataTx, 'Reave-Story-Id');
                var owner    = idstory.slice(0,43);

                //Mencegah orang lain menduplikasikan transaksi story tag
                if (author === owner) {
                      var profile = await getNameProfile(author);
                      var mytitle = getTag(dataTx, 'Reave-Title');
                      var mycategory = getTag(dataTx, 'Reave-Category');
                      var cate = await getCat(mycategory);
                      var mydesc = getTag(dataTx, 'Reave-Desc');
                      var mykey = getTag(dataTx, 'Reave-Key');
                      var mystamp = getTag(dataTx, 'Reave-Stamp');

                      var times = mystamp.substring(0, 10);
                      var date = moment.unix(times).format("MMM Do YY");

                      //get tip amount
                      var tipped = await getTipAmount(idstory);
                      if (tipped === false) {
                          tipped = '0';
                      }else {
                        tipped = Number(tipped) * 0.5;
                      }

                      let arrayData = '{"storyid":"'+idstory+'", "storytx":"'+item+'", "storytagtx":"'+dataA+'", "author":"'+profile+'", "title":"'+mytitle+'", "category":"'+cate+'", "desc":"'+mydesc+'", "key":"'+mykey+'", "stamp":"'+mystamp+'", "date":"'+date+'", "tip":"'+tipped+'", "thumbnail":"'+mydata+'"}';
                      var obj = JSON.parse(arrayData);

                      databaseStoryList.push(obj);
                      sortArray = databaseStoryList.sort(dynamicSort("-stamp"));
                      //console.log(databaseStoryList);


                      count -= 1;
                      if (count === 0) {
                          var temporary = JSON.parse(sessionStorage.getItem("atrans"));
                          temporary = temporary.slice(8);
                          sessionStorage.removeItem("atrans");
                          sessionStorage.setItem("atrans", JSON.stringify(temporary));


                          if (temporary.length > 0) {
                              document.getElementById('loadmore').style.display = 'block';
                          }else{
                                document.getElementById('loadmore').style.display = 'none';
                          }

                          await domAppend(sortArray);
                          sortArray = [];
                          databaseStoryList = [];
                          //hideloading
                          document.getElementById('readspinner').style.display = "none";

                      }

                }else {
                  count -= 1;
                }

            }

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


async function getNameProfile(m){

          try {
                const contx = await arweave.arql({
                    op: "and",
                    expr1: {
                      op: "equals",
                        expr1: "from",
                        expr2: m
                    },
                    expr2: {
                        op:"equals",
                        expr1:"Reave-Type",
                        expr2: "profile"

                    }
              })

                 if (contx.length > 0) {
                     const profileTx     = await arweave.transactions.get(contx[0]);
                     const profileTxData = profileTx.get('data', { decode: true, string: true });
                     //console.log(profileTxData);
                     let profileTxDatare = profileTxData.split('hcseu83h387svlnv8');
                     return profileTxDatare[0];



                 }else {
                      return m;
                 }
          } catch (e) {

              return m;
          }

}

//Sort inbox function
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

//Mendapatkan jumlah tipped
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

//Mendapatkan story tag terakhir
async function getStoryTag(i) {
      try {

            const dataTx = await arweave.transactions.get(i);
            const mydata = dataTx.get('data', { decode: true, string: true });
            var author = await arweave.wallets.ownerToAddress(dataTx.owner);
            var myid     = getTag(dataTx, 'Reave-Story-Id');
            var owner    = myid.slice(0,43);
            if (author === owner) {
                  const contx = await arweave.arql({
                      op: "and",
                      expr1: {
                        op: "equals",
                          expr1: "from",
                          expr2: owner
                      },
                      expr2: {
                            op: "and",
                            expr1: {
                              op: "equals",
                                expr1: "Reave-Type",
                                expr2: "Tags-Story"
                            },
                            expr2: {
                                op:"equals",
                                expr1:"Reave-Story-Id",
                                expr2: myid
                            }
                      }
                })
                return contx[0];
            }else {
                return false;
            }



      } catch (e) {
          return false;
      }
}

//Fungsi untuk menampilkan atau Append dari Array
async function domAppend(e) {

      e.forEach(function (item, value){

        console.log(item);
          var toAppend = '<div class="col-sm-6 item" id="storyitem"> <div class="row boxarticle"> <div class="col-md-12 col-lg-5 imagebox"><a href="read.html?'+item.storyid+'"><img class="img-fluid" id="storythumbnail" src="'+item.thumbnail+'" /></a></div> <div class="col rightbox"><a id="storytitle" class="titlelink boxtitle" href="read.html?'+item.storyid+'">'+(item.title).slice(0,100)+'</a> <div class="author" style="margin-top: 10px;"><i class="fa fa-user-o float-left" aria-hidden="true" style="margin: 3px;"></i> <a href="author.html?'+item.storyid+'" style="color:black;"><h5 class="float-left name storyauthor" id="storyauthor">'+item.author+'</h5></a> <p id="storydate" class="name mydatelist"> '+item.date+'</p> </div> <p id="storydesc" class="description boxdesc">'+item.desc+'</p><a class="badge badge-dark text-white" id="storycategory">'+item.category+'</a> <a class="badge badge-success text-white" id="tipped">'+item.tip+' AR</a></div> </div> </div>';
          $('#storylist').append(toAppend);

      });

}


$('#next').click(function() {
  event.preventDefault();
  $('#cat-menu-list').animate({
    scrollLeft: "+=164px"
  }, "slow");
});

 $('#prev').click(function() {
  event.preventDefault();
  $('#cat-menu-list').animate({
    scrollLeft: "-=164px"
  }, "slow");
});

getStory();
let mongoData = [];
async function getStory() {
    //showloading
    document.getElementById('readspinner').style.display = "block";
    document.getElementById('loadmore').style.display = 'none';

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
        targetUrl = 'https://reavedb8.herokuapp.com/story';

    mongoData = await fetch(proxyUrl + targetUrl)
      .then(blob => blob.json())
      .then(data => {
        return data;
      })
      .catch(e => {
        console.log(e);
        return e;
      });

      mongoData = mongoData.sort(dynamicSort("-stamp"));
      sessionStorage.setItem("pagination", "0");
      sendDataToDom();

}


//Fungsi untuk menampilkan atau Append dari Array
async function sendDataToDom() {

    var u = sessionStorage.getItem("pagination");
    var a = Number(u) + 6;

    e = mongoData.slice(u,a);
    await domAppand(e).then(function (data) {
          domThumbnail(e);
    });

    sessionStorage.setItem("pagination", a);


    document.getElementById('readspinner').style.display = "none";


    if (a >= mongoData.length) {
          document.getElementById('loadmore').style.display = 'none';
    }else {
      document.getElementById('loadmore').style.display = 'block';
    }

}

//dom story
async function domAppand(e) {

  //Perulangan
  e.forEach(function (item, value){

      var times = item.stamp.substring(0, 10);
      var date = moment.unix(times).format("MMM Do YY");

      var toAppend = '<div class="col-sm-6 item" id="storyitem"> <div class="row boxarticle"> <div class="col-md-12 col-lg-5 imagebox"><a href="read.html?'+item.storyid+'"><img class="img-fluid" id="'+item.storyid+'" src="loadingimages.svg" /></a></div> <div class="col rightbox"><a id="storytitle" class="titlelink boxtitle" href="read.html?'+item.storyid+'">'+item.title+'</a> <div class="author" style="margin-top: 10px;"><i class="fa fa-user-o float-left" aria-hidden="true" style="margin: 3px;"></i> <a href="author.html?'+(item.storyid).slice(0,43)+'" style="color:black;"><h5 class="float-left name storyauthor" id="storyauthor">'+item.author+'</h5></a> <p id="storydate" class="name mydatelist"> '+date+'</p> </div> <p id="storydesc" class="description boxdesc">'+item.desc+'</p><a class="badge badge-dark text-white" id="storycategory">'+item.category+'</a> <a class="badge badge-success text-white" id="tipped">'+item.tip+' AR</a></div> </div> </div>';
      $('#storylist').append(toAppend);

      console.log('Dom Data');

  });
}

//Dom Thumbnail
async function domThumbnail(e) {
    e.forEach(async function (item, value){
        console.log("DOm Thumbnail");
        const p = await arweave.transactions.get(item.storytagtx);
        const m = p.get('data', { decode: true, string: true });

        $("#"+item.storyid).attr("src", m);
    });

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

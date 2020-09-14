getStory();

async function getStory() {
    var proxyUrl = 'https://cors-anywhere.herokuapp.com/',
        targetUrl = 'https://reavedb8.herokuapp.com/story';

    let mongoData = await fetch(proxyUrl + targetUrl)
      .then(blob => blob.json())
      .then(data => {
        return data;
      })
      .catch(e => {
        console.log(e);
        return e;
      });

        domAppend(mongoData);

}


//Fungsi untuk menampilkan atau Append dari Array
async function domAppend(e) {
      e = e.sort(dynamicSort("-stamp"));
      e.forEach(function (item, value){

        console.log(item);
          var toAppend = '<div class="col-sm-6 item" id="storyitem"> <div class="row boxarticle"> <div class="col-md-12 col-lg-5 imagebox"><a href="read.html?'+item.storyid+'"><img class="img-fluid" id="'+item.storyid+'" src="loadingimages.svg" /></a></div> <div class="col rightbox"><a id="storytitle" class="titlelink boxtitle" href="read.html?'+item.storyid+'">'+item.title+'</a> <div class="author" style="margin-top: 10px;"><i class="fa fa-user-o float-left" aria-hidden="true" style="margin: 3px;"></i> <a href="author.html?'+item.storyid+'" style="color:black;"><h5 class="float-left name storyauthor" id="storyauthor">'+item.author+'</h5></a> <p id="storydate" class="name mydatelist"> '+item.stamp+'</p> </div> <p id="storydesc" class="description boxdesc">'+item.desc+'</p><a class="badge badge-dark text-white" id="storycategory">'+item.category+'</a> <a class="badge badge-success text-white" id="tipped">'+item.tip+' AR</a></div> </div> </div>';
          $('#storylist').append(toAppend);

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

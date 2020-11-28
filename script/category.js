
var urlcategory = window.location.search;
urlcategory = urlcategory.substring(1);

$('#cattitle').append(urlcategory+'.');

//Start Story.js
let alltx = [];
let donetx = [];
var txnow = 0;

async function runningData() {
    await showLoading();
    let a = await getTransactions();
    console.log(a);
    let b = await getFilterTransactions();
    let c = await filterTransactions(b,a);
    alltx = c;
    txnow = alltx.length;
    $('#loadinglist').empty();
    let d = await checkAndShowData();
    $('#lodmr').show();
}

runningData();

//GET TRANSACTIONS
async function getTransactions() {
    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( first:100000 block: {min: 1} sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "Reave-Type", values: ["Tags-Story"] }, { name: "App-Version", values: ["3.0"] }, { name: "Reave-Category", values: ["'+urlcategory+'"] } ] ) { edges { node { id quantity {ar winston} owner {address} tags {name value}} } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });
        var egr = (graphql.transactions).edges;
        let o = [];
        for (const key in egr) {
            if (egr.hasOwnProperty(key)) {
                const nt = egr[key];
                //FILTER FEE 0.1
                var i = ((nt.node).quantity).winston;
                if ( i === '100000000000') {                  
                    o.push(nt.node);
                }
            }
        }
        return o;
    } catch (error) {
        return [];
    }
}

//GET FILTER TRANSACTION
async function getFilterTransactions() {
    return [];
}
//FILTER TRANSACTION
let yu = [];
async function filterTransactions(a , b) {
    yu = b;
    for (const key in a) {
        if (a.hasOwnProperty(key)) {
            const le = a[key];
            const index = yu.findIndex(x => x.id === le);
            if (index !== undefined && index > -1){
                yu.splice(index, 1);
            }
        }
    }
    return yu;
}

//FILTER DONE TRANSACTION
let du = [];
async function filterAfter(a , b) {
    du = b;
    for (const key in a) {
        if (a.hasOwnProperty(key)) {
            const le = a[key];
            const index = du.findIndex(x => x.id === le);
            if (index !== undefined && index > -1){
                du.splice(index, 1);
            }
        }
    }
    return du;
}


//CHECK AND SHOW DATA
async function checkAndShowData(r) {
    if (r === 'more' && alltx.length !== 0) {
        console.log(alltx.length);
        await showLoading();
        
    }
    
    if (alltx.length !== 0) {
        let w = alltx;
        var pg = 0;
        for (const q in w) {
            if (w.hasOwnProperty(q)) {
                
                const r = w[q];
                donetx.push(r.id);
                var csd = await checkStoryDeleted((r.owner).address , r.id);
                
                if (csd === false) {
                    pg += 1;
                    txnow -= 1;
                    $('#loadinglist').empty();
                    var m = await showData(r);
                    showCover(r.id);
                    showTipped((r.owner).address , r.id);
                    changeAuthorUsername((r.owner).address, r.id);
                }else{
                    txnow -= 1;
                    $('#loadinglist').empty();
                }

                if (pg === 6 || txnow === 0) {
                    alltx = await filterAfter(donetx,alltx);
                    break;
                }

                
            }
        }
    }
    
    console.log(alltx);
}

//CHECK UF STORY DELETED
async function checkStoryDeleted(p, i) {
    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( owners:["'+p+'"] block: {min: 1} sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "Reave-Type", values: ["Content-Story"] }, { name: "Reave-From-Tx", values: ["'+i+'"] }, { name: "Reave-Status", values: ["Deleted"] } ] ) { edges { node { id } } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });

        var result = (graphql.transactions).edges;
        var res = result.length;
        if (res !== 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

//SHOWING DATA AFTER CHECK DELETED
async function showData(a) {
    var title = ((a.tags)[4]).value;
    var category = ((a.tags)[5]).value;
    var stamp = ((a.tags)[7]).value;
    var id = a.id;
    var owner = (a.owner).address;
    var colorcat = await colorize(category);
    var time = stamp.substring(0, 10);
    var lastime = moment.unix(time).format("MMM Do YY");

    var htm = '<div class="main-i"><a href="read.html?'+id+'"><img class="img-fluid" src="blank.png" alt="no image" id="image'+id+'"/></a> <a href="category.html?'+category+'"><h3 style="background-color:'+colorcat+';">'+category.toUpperCase()+'</h3></a><span class="share"></span> <h2><a href="read.html?'+id+'">'+title+'</a></h2> <h5>by <a href="author.html?'+owner+'" class="authorlink" id="'+id+owner+'"> loading ...</a><span id="iconverified'+id+owner+'"></span><span style="margin-left: 15px;"> &#128338; </span><span>'+lastime+'</span><span class="love-btn">&#128176;</span><span id="tipamount'+id+'"> loading ...</span></h5></div>';

    $('#storylist').append(htm);
}

//SHOW IMAGE COVER STORY
async function showCover(s) {
    try {
        const d = await arweave.transactions.get(s);
        const dt = d.get('data', { decode: true, string: true });
        $("#image"+s).attr("src", dt);
    } catch (error) {       
    }   
}

//SHOW IMAGE COVER STORY
async function showTipped(o, t) {
    try {
        var val = await getIncentiveTx(t, o);
        var ls = Number(val) * 0.1;
        document.getElementById("tipamount"+t).innerText = ls;
    } catch (error) {  
        document.getElementById("tipamount"+t).innerText = '0.1';
    }   
}

//GET COLOR FROM CATEGORY
async function colorize(c) {
    var col = '';
    if (c === 'art') {
        col = '#8a2be2';
    } else if(c === 'blockchain'){
        col = '#d92a73';
    } else if(c === 'books'){
        col = '#246ead';
    } else if(c === 'cryptocurrency'){
        col = '#434343';
    } else if(c === 'conference'){
        col = '#0caa35';
    } else if(c === 'financial'){
        col = '#5454fc';
    } else if(c === 'history'){
        col = '#d3d30d';
    } else if(c === 'health'){
        col = '#40e0d0';
    } else if(c === 'investment'){
        col = '#ee82ee';
    } else if(c === 'ico'){
        col = '#ff6347';
    } else if(c === 'music'){
        col = '#708090';
    } else if(c === 'news'){
        col = '#a0522d';
    } else if(c === 'sport'){
        col = '#ff0000';
    } else if(c === 'science'){
        col = '#a20965';
    } else if(c === 'technology'){
        col = '#ffa530';
    } 
    
    else if(c === 'film'){
        col = '#d92a73';
    } else if(c === 'gaming'){
        col = '#246ead';
    } else if(c === 'humor'){
        col = '#434343';
    } else if(c === 'tv'){
        col = '#0caa35';
    } else if(c === 'food'){
        col = '#5454fc';
    } else if(c === 'style'){
        col = '#d3d30d';
    } else if(c === 'travel'){
        col = '#40e0d0';
    } else if(c === 'fitness'){
        col = '#ee82ee';
    } else if(c === 'business'){
        col = '#ff6347';
    } else if(c === 'design'){
        col = '#708090';
    } else if(c === 'economy'){
        col = '#a0522d';
    } else if(c === 'media'){
        col = '#ff0000';
    } else if(c === 'startup'){
        col = '#a20965';
    } else if(c === 'job'){
        col = '#ffa530';
    }

    else if(c === 'productivity'){
        col = '#d92a73';
    } else if(c === 'money'){
        col = '#246ead';
    } else if(c === 'politic'){
        col = '#434343';
    } else if(c === 'election'){
        col = '#0caa35';
    } else if(c === 'crime'){
        col = '#5454fc';
    } else if(c === 'science'){
        col = '#d3d30d';
    } else if(c === 'ai'){
        col = '#40e0d0';
    } else if(c === 'family'){
        col = '#ee82ee';
    } else if(c === 'education'){
        col = '#ff6347';
    } else if(c === 'history'){
        col = '#708090';
    } else if(c === 'religion'){
        col = '#a0522d';
    } else if(c === 'world'){
        col = '#ff0000';
    } else if(c === 'security'){
        col = '#a20965';
    } 

    return col;
}


//GET INCENTIVE TX
async function getIncentiveTx(t, o) {
    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( block: {min: 1} recipients:["'+o+'"] sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "Reave-Type", values: ["Incentive"] }, { name: "Reave-Url", values: ["'+t+'"] } ] ) { edges { node { id quantity { winston ar } } } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });

        var itx = (graphql.transactions).edges;
        var hit = 0;
        var count = itx.length;
        if (count > 0) {

            for (const key in itx) {
                if (itx.hasOwnProperty(key)) {
                    const e = itx[key];
                    var qt = ((e.node).quantity).winston;
                    if (qt === '100000000000') {
                        hit += 1;
                    }
                    count -= 1;
                    if (count === 0) {
                        console.log(hit);
                        return hit;
                        
                    }
                }
            }
        } else {
            return '0';
        }   
    } catch (error) {
        return '0';
    }
}

//CHANGE ADDRESS TO USERNAME
async function changeAuthorUsername(aut, id) {
    
    try {

    const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( first:1 block: {min: 1} owners:["'+aut+'"] recipients:["XeZdK2OK6ocyRxl9Cp9GujgKzg9X79p24Zn9sQOCUxc"] sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "Reave-Type", values: ["Profile"] }] ) { edges { node { id quantity { winston ar } tags {name value}} } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });

    var y = (graphql.transactions).edges;

    if (y.length > 0) {
        
        var sw = ((((y[0]).node).tags)[3]).value;
        
        document.getElementById(id+aut).innerText = (sw.slice(0,15));

    }else {
        document.getElementById(id+aut).innerText = (aut).slice(0,15);
    }

    const h = await checkVerified(aut);
        var vr = '<img src="svg/verified.svg" class="verifiedsvg" title="verified author">';
        if (h === true) {
            document.getElementById('iconverified'+id+aut).innerHTML = vr;
        }
                
    } catch (e) {
        document.getElementById(id+aut).innerText = (aut).slice(0,15);
    }      

}


//CHECK VERIFIED ACCOUNT
async function checkVerified(e){
    try {
    
        const graphql = await fetch('https://arweave.dev/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
            body: JSON.stringify({ 'query': 'query { transactions( first:1 block: {min: 1} owners:["'+e+'"] recipients:["XeZdK2OK6ocyRxl9Cp9GujgKzg9X79p24Zn9sQOCUxc"] sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "Reave-Type", values: ["Verified"] }] ) { edges { node { id quantity { winston ar }} } } }'}),
            })
            .then(res => res.json())
            .then(res => {
                return res.data;
            });
    
        var x = (graphql.transactions).edges;

        if (x.length !== 0) {
            var qt = ((x.node).quantity).winston;
            if (qt === '1000000000000') {
                return true;
            } else {
                return false;
            }
        }else{
            return false;
        }

    } catch (error) {
        return false;
    }
}

//APPEND LOADING
async function showLoading() {
    var z = '<div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div>';

    $('#loadinglist').append(z);
}
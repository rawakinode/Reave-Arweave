
//GET FILTER TRANSACTIONS
async function getFilterTransactions() {
    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( owners:["OesddStCpX7gW3ZWxO93GnU7wRYjAQIJUA8c7KkID2M"] block: {min: 1} sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "App-Version", values: ["2.1"] }, { name: "Reave-Type", values: ["Filter"] } ] ) { edges { node { id } } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });

        var egr = (graphql.transactions).edges;
        let o = [];
        for (const key in egr) {
            if (egr.hasOwnProperty(key)) {
                const element = egr[key];
                o.push((element.node).id);
                
            }
        }

        return o;

    } catch (error) {
        return false;
    }
}

//GET TRANSACTIONS
async function getTransactions() {

    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( block: {min: 1} sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "App-Version", values: ["2.1"] }, { name: "Reave-Type", values: ["Tags-Story"] } ] ) { edges { node { id } } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });

        var egr = (graphql.transactions).edges;
        let o = [];
        for (const key in egr) {
            if (egr.hasOwnProperty(key)) {
                const element = egr[key];
                o.push((element.node).id);
                
            }
        }

        return o;
    } catch (error) {
        return false;
    }
}

//FILTER TRANSACTION
async function filterTransactions(a , b) {
    var ft = b.filter(
        function(e) {
            return this.indexOf(e) < 0;
        },a
    );
    return ft;  
}



//PROCCESS TRANSACTION
let c ;
async function processTransactions() {
    await showLoading();
    let a = await getFilterTransactions();
    let b = await getTransactions();
    c = await filterTransactions(a,b);
    console.log(c);
    let d = await getTransactionData(true);
    
    
}

processTransactions();

//GET TRANSACTION DATA
var countTx = 0 ;
async function getTransactionData(sts) {

    var qw = 0 + countTx;
    var qe = countTx + 6;
    var ca = c.slice(qw, qe);
    var nums = ca.length;
    let jsem = [];
    console.log(ca);
    let authorjson = []; 

    if (ca.length !== 0) {
        
        if (sts !== true) {
            await showLoading();
        }
    }

    ca.forEach(async function(item, index) {
        console.log(item);
        try {
            countTx += 1;
            const d = await arweave.transactions.get(item);
            const dcod = d.get('data', { decode: true, string: true });
            var n = dcod.lastIndexOf('sdata:image/jpeg;base64');
            var result = dcod.substring(n + 1);
            result = result.substring(0, result.length - 32)

            var author = await arweave.wallets.ownerToAddress(d.owner);
            console.log(author);
            var aa = getTag(d, 'Reave-Title');
            console.log(aa);
            var bb = getTag(d, 'Reave-Category');
            var cl = await colorize(bb);
            var dd = getTag(d, 'Reave-Stamp');
            var dda = dd.substring(0, 10);
            var ddb = moment.unix(dda).format("MMM Do YY");

            var ajs = '{"id":"'+item+'", "author":"'+author+'"}';
            var ajp = JSON.parse(ajs);
            authorjson.push(ajp);
            console.log(authorjson); 

            var json = '{"a":"'+item+'","b":"'+result+'","c":"'+bb+'","d":"'+aa+'","f":"'+author+'","g":"'+dd+'","h":"'+ddb+'","i":"'+cl+'"}';
            var jsor = JSON.parse(json);
            jsem.push(jsor);
            
            nums -= 1;
            if (nums === 0) {
                const r = await appendJSON(jsem);
                $('#loadinglist').empty();
                const x = await changeAuthorUsername(authorjson);
                
                console.log('NUMS NULL');
                $('#lodmr').show();
                 
            }
            
        } catch (error) {
            nums -= 1;
            countTx += 1;
            console.log(error);
        }
    });

    return nums;
}

//GET TAG DATA
function getTag(tx, name) {
    let tags = tx.get('tags');
    for(let i = 0; i < tags.length; i++) {
        try {
            if(tags[i].get('name', { decode: true, string: true }) == name)
            return tags[i].get('value', { decode: true, string: true })
        } catch (e) {

        }
    }
    return false;
}

//APPEND JSON
async function appendJSON(j){
    let i = j.sort(orderBy("-g"));
    for (const key in i) {
        if (i.hasOwnProperty(key)) {
            const element = i[key];
            console.log(element);

            var htm = '<div class="main-i"><a href="read.html?'+element.a+'"><img class="img-fluid" src="'+element.b+'" /></a> <a href="category.html?'+element.c+'"><h3 style="background-color:'+element.i+';">'+element.c.toUpperCase()+'</h3></a><span class="share"></span> <h2><a href="read.html?'+element.a+'">'+element.d+'</a></h2> <h5>by <a href="author.html?'+element.f+'" class="authorlink" id="'+element.a+'"> loading ...</a><span id="iconverified'+element.a+'"></span><span style="margin-left: 15px;"> &#128338; </span><span>'+element.h+'</span><span class="love-btn">&#128176;</span><span id="tipamount'+element.a+'"> loading ...</span></h5></div>';

            $('#storylist').append(htm);

        }
    }
}

//SORT JSON
function orderBy(m) {
    var n = 1;
    if(m[0] === "-") {
        n = -1;
        m = m.substr(1);
    }
    return function (o,p) {
        var q = (o[m] < p[m]) ? -1 : (o[m] > p[m]) ? 1 : 0;
        return q * n;
    }
}

//APPEND LOADING
async function showLoading() {
    var z = '<div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div> <div class="main-i"> <div class="lod-cover loading"></div> <div class="lod-category loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> <div class="lod-title loading"></div> </div>';

    $('#loadinglist').append(z);
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

    return col;
}

//CHANGE ADDRESS TO USERNAME
async function changeAuthorUsername(a) {
    
    a.forEach(async function(i) {
            try {
                const contx = await arweave.arql({
                    op: "and",
                    expr1: {
                    op: "equals",
                        expr1: "from",
                        expr2: i.author
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
                    console.log(profileTxData);
                    let profileTxDatare = profileTxData.split('hcseu83h387svlnv8');
                    
                    document.getElementById(i.id).innerText = (profileTxDatare[0]).slice(0,12);

                    const h = await checkVerified(i.author);
                    var vr = '<img src="svg/verified.svg" class="verifiedsvg" title="verified author">';
                    if (h === false) {
                        document.getElementById('iconverified'+i.id).innerHTML = vr;
                    }
                    
                    const f = await getIncentiveTx(i.id , i.author);
                    var ls = Number(f) * 0.1;
                    document.getElementById('tipamount'+i.id).innerText = ls+' AR';
        
                }else {
                    document.getElementById(i.id).innerText = (i.author).slice(0,12);
                }
        } catch (e) {
            document.getElementById(i.id).innerText = (i.author).slice(0,12);
        }      
    });
}

//CHECK VERIFIED ACCOUNT
async function checkVerified(e){
    try {
        const contx = await arweave.arql({
            op: "and",
            expr1: {
                op: "equals",
                    expr1: "from",
                    expr2: i.author
                },
            expr2: {
                op: "and",
                expr1: {
                    op: "equals",
                        expr1: "to",
                        expr2: "OesddStCpX7gW3ZWxO93GnU7wRYjAQIJUA8c7KkID2M"
                    },
                expr2: {
                    op:"equals",
                    expr1:"Reave-Type",
                    expr2: "Verified"

                }

            }
        })

        if (contx.length !== 0) {
            return true;
        }else{
            return false;
        }
    } catch (error) {
        return false;
    }
}

//GET INCENTIVE TX
async function getIncentiveTx(t, o) {
    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( block: {min: 1} recipients:["'+o+'"] sort: HEIGHT_DESC tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "App-Version", values: ["2.1"] }, { name: "Reave-Type", values: ["Incentive"] }, { name: "Reave-Url", values: ["'+t+'"] } ] ) { edges { node { id quantity { winston ar } } } } }'}),
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
var url = window.location.search;
url = url.substring(1);

var version = '2.1';
var aa ;
var bb ;
var ddb ;
var u ;

getAll();

async function getAll() {
    u = await getAuthorFromUrl();
    
    if (u !== false) {
        var e = await getTxFromAuthorAndTxid(u);
        if (e !== false) {
            console.log(e);
            var ut = await changeAuthorUsername(u);
            var inc = await getIncentiveTx(url, u);
            var ver = await checkVerified(u);
            var dis ;
            if (ver === true) {
                dis = 'inline-block';
            }else{
                dis = 'inline-block';
            }
            var ls = Number(inc) * 0.1;

            const i = await arweave.transactions.get(e);
            const s = i.get('data', { decode: true, string: true });
            console.log(s);
            //CHANGE META
            $('title').html(aa+' - Reave');

            var t = '<div class="cont-title">'+aa+'</div>';
            var at = '<div class="cont-attr">By <span><a href="author.html?'+u+'" class="authlink">'+ut+' </a><img src="svg/verified.svg" class="verifiedsvg" title="verified author" style="display:'+dis+'"></span> <span class="titik" style="margin-left:12px;">.</span> <span> &#128338; '+ddb+'</span> <span class="titik">.</span> <span id="tip">&#128176; '+ls+' AR</span><div class="socialicon"><img title="Share to Facebook" onclick="shareFb()" class="svgicon" src="svg/facebook.svg"><img title="Share to Twitter" onclick="shareTw()" class="svgicon" src="svg/twitter.svg"><img title="Share to Linkedin" onclick="shareIn()" class="svgicon" src="svg/linkedin.svg"><img title="Share to Mail" onclick="shareEm()" class="svgicon" src="svg/letter.svg"></div></div>';
            var c = '<div class="cont-main">'+(JSON.parse(s))[1]+'</div>';
            var d = '<div class="buttoncontent"><button class="buttontip" id="tipbut" onclick="sendTips()">&#128176; Tip 0.1 AR</button><button class="buttontip">&#128172; Show comments</button><button id="alerts" class="buttontip" hidden></button></div>';
            $('#loding').hide();
            $('#contentplace').append(t+at+c+d);
        }
    }else{
        $('#loding').hide();
        var er = '<div style="text-align:center;margin-top:20px;"><img src="svg/error.svg" style="width: fit-content;"><p>Story Not Found :(</p></div>';
        $('#contentplace').append(er);
    }
}

async function getTxFromAuthorAndTxid(u) {
    try {
        const graphql = await fetch('https://arweave.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
        body: JSON.stringify({ 'query': 'query { transactions( owners:["'+u+'"] tags: [ { name: "App-Name", values: ["Reave-Apps"] }, { name: "Reave-Type", values: ["Content-Story"] }, { name: "Reave-From-Tx", values: ["'+url+'"] } ] ) { edges { node { id } } } }'}),
        })
        .then(res => res.json())
        .then(res => {
            return res.data;
        });
        
        var egr = (graphql.transactions).edges;
        console.log(egr);
        return ((egr[0]).node).id;
    } catch (error) {
        return false;
    }
}

async function getAuthorFromUrl() {
    try {
        const d = await arweave.transactions.get(url);
        var author = await arweave.wallets.ownerToAddress(d.owner);
        aa = getTag(d, 'Reave-Title');
        bb = getTag(d, 'Reave-Category');
        var dd = getTag(d, 'Reave-Stamp');
        var dda = dd.substring(0, 10);
        ddb = moment.unix(dda).format("MMM Do YY");
        return author;
    } catch (error) {
        return false;
    }
}


//CHANGE ADDRESS TO USERNAME
async function changeAuthorUsername(a) {

    try {
        const contx = await arweave.arql({
            op: "and",
            expr1: {
            op: "equals",
                expr1: "from",
                expr2: a
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

            return profileTxDatare[0];
            
        }else {
            return a;
        }
    } catch (e) {
        return a;
    }      
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

//SEND TIPS
async function sendTips() {
    var r = await checkLog();
    if (r !== true) {
        alert('Please login first!');
    } else {
        sendTipsQuery();
    }
}

//LOGIN CHECK
async function checkLog() {
    var importJwk = localStorage.getItem('reaveSessionLogin');
    try {
        if (JSON.parse(importJwk)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

//SEND TIPS PART 2
async function sendTipsQuery() {
    document.getElementById('tipbut').innerText = 'Sending tip ...';
    document.getElementById("tipbut").disabled = true;
    document.getElementById("alerts").style.display = 'none';

    var time = Date.now();
    
    var importJwk = JSON.parse(localStorage.getItem('reaveSessionLogin'));
    console.log(importJwk);
    try {
        let transaction = await arweave.createTransaction({
            target: u,
            quantity: arweave.ar.arToWinston('0.1')
        }, importJwk);

        transaction.addTag('App-Name', 'Reave-Apps')
        transaction.addTag('App-Version', version)
        transaction.addTag('Reave-Type', 'Incentive')
        transaction.addTag('Reave-Url', url)
        transaction.addTag('Reave-Stamp', time.toString())

        await arweave.transactions.sign(transaction, importJwk);
        await arweave.transactions.post(transaction);
        console.log(transaction);

        document.getElementById("tipbut").disabled = false;
        document.getElementById('tipbut').innerHTML = '&#128176; Tip 0.1 AR';
        document.getElementById("alerts").style.display = 'inline-block';
        document.getElementById("alerts").innerText = "Success";
        document.getElementById("alerts").style.backgroundColor = "#0cff3b";
        
        
    } catch (error) {
        console.log(error);
        document.getElementById("tipbut").disabled = false;
        document.getElementById('tipbut').innerHTML = '&#128176; Tip 0.1 AR';
        document.getElementById("alerts").style.display = 'inline-block';
        document.getElementById("alerts").innerText = "Failed";
        document.getElementById("alerts").style.backgroundColor = "#ff5454";
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
            
            if ((x.quantity).winston === '1000000000000') {
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

//Share
function shareFb() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=https://reave.me/read.html?'+url, '_blank');
}

function shareTw() {
    window.open('https://twitter.com/intent/tweet?url=https://reave.me/read.html?'+url, '_blank');
}

function shareIn() {
    window.open('https://www.linkedin.com/shareArticle?mini=true&url=https://reave.me/read.html?'+url, '_blank');
}

function shareEm() {
    window.open('mailto:info@example.com?&subject=&body=https://reave.me/read.html?'+url, '_blank');
}

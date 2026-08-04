import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore";
const configs = [
    {
        "apiKey": "AIzaSyBJA5v78O_yZsw9Vkx7qZcdqo_Ek2Cg0nc",
        "authDomain": "jss-1-d8b98.firebaseapp.com",
        "projectId": "jss-1-d8b98",
        "storageBucket": "jss-1-d8b98.appspot.com",
        "messagingSenderId": "985767701555",
        "appId": "1:985767701555:web:4cbe7a5739b4f4288f0746",
        "measurementId": "G-KWGP4XGZS7"
    },
    {
        "apiKey": "AIzaSyAcW8SrGRjpae3yX41mengldQSkJZNSyyI",
        "authDomain": "jss-2-45bfb.firebaseapp.com",
        "projectId": "jss-2-45bfb",
        "storageBucket": "jss-2-45bfb.appspot.com",
        "messagingSenderId": "297181603876",
        "appId": "1:297181603876:web:deda0db38dfd99e56ad0b1",
        "measurementId": "G-HGF1RZF6G7"
    },
    {
        "apiKey": "AIzaSyBRrmYnGDXYcuhR9hxjUNHjTTAoaFU-iTU",
        "authDomain": "jss-3-9f56a.firebaseapp.com",
        "projectId": "jss-3-9f56a",
        "storageBucket": "jss-3-9f56a.appspot.com",
        "messagingSenderId": "485860840332",
        "appId": "1:485860840332:web:03eff5287d1c11e965bca9"
    },
    {
        "apiKey": "AIzaSyDAFU7YC7-F6Z5f7U_c4CaZfvMX2kWOvGY",
        "authDomain": "sss-1-c4e20.firebaseapp.com",
        "projectId": "sss-1-c4e20",
        "storageBucket": "sss-1-c4e20.appspot.com",
        "messagingSenderId": "583010609084",
        "appId": "1:583010609084:web:2301c411508b8bc1286db9"
    },
    {
        "apiKey": "AIzaSyBi2pDZDR1UYgE_0BokzSxfEUu6pdFJavE",
        "authDomain": "sss-2-6559e.firebaseapp.com",
        "projectId": "sss-2-6559e",
        "storageBucket": "sss-2-6559e.appspot.com",
        "messagingSenderId": "1080184329339",
        "appId": "1:1080184329339:web:afd1b3b963ff9e8b89fede"
    },
    {
        "apiKey": "AIzaSyCg54BF3m0TDPV3slZ0ctWf3s9x1dpaDDs",
        "authDomain": "sss-3-57cf1.firebaseapp.com",
        "projectId": "sss-3-57cf1",
        "storageBucket": "sss-3-57cf1.appspot.com",
        "messagingSenderId": "213082789734",
        "appId": "1:213082789734:web:0fdba98e8ffc2ac65b1aa7"
    },
    {    
        "apiKey": "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
        "authDomain": "fir-pro-152a1.firebaseapp.com",
        "projectId": "fir-pro-152a1",
        "storageBucket": "fir-pro-152a1.appspot.com",
        "messagingSenderId": "158660765747",
        "appId": "1:158660765747:web:bd2b4358cc5fc9067ddb46"
    },    
]
const classes = [
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3"
];
function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore(app);
}
let app = initializeApp(configs[6]); //FirebasePro config
let db = getFirestore(app);

const now = new Date();
const ssn = (now.getMonth() > 9 ? now.getFullYear()+1 : now.getFullYear()).toString();

const main = document.querySelector("main");
const tableDiv = document.querySelector('div.table');
const loader = document.createElement('svg');
loader.classList.add('loader');
loader.innerHTML = '<use href="#loader"></use>';
tableDiv.appendChild(loader);
// get EOT and subject collections for both junior and senior secondary
const EOT = await getDoc(doc(db, "EOT", ssn));
const jrsub = await getDoc(doc(db, "reserved", "2aOQTzkCdD24EX8Yy518"));
const srsub = await getDoc(doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq"));

loader.remove();
console.log('okay');
//get classroom
let names, abbr, abbr_unmutated, cls, promotion = [], term;
const table = document.createElement('table');
document.querySelector('menu#class-form').addEventListener('click', async e => {
    if(e.target.tagName === 'LI'){
        e.target.closest('button').querySelector('span').textContent = e.target.textContent;
        e.target.closest('button').blur();
        cls = e.target.dataset.val;
        names = [], abbr = [], abbr_unmutated = [], promotion = [];
        //reset table
        table.innerHTML = '';
        tableDiv.appendChild(loader);
        //collect class name
        if('012'.includes(cls)) {//junior class
            abbr = Object.keys(jrsub.data()).sort();
            abbr_unmutated = Object.keys(jrsub.data()).sort();
        }else if('345'.includes(cls)) {//senior class
            abbr = Object.keys(srsub.data()).sort();
            abbr_unmutated = Object.keys(srsub.data()).sort();
        }
        abbr.push('AVE', 'STAT');
        const th = abbr.unshift('#','NAME', 'ARM'); //mutates array & returns new length of same array
        // tfoot_td.setAttribute('colspan', th);
        const thead = document.createElement('thead');
        const theadRow = document.createElement('tr');
        for (let i = 0; i < th; i++) {
            theadRow.insertAdjacentHTML('beforeend', `<th>${abbr[i]}</th>`);
        }
        thead.appendChild(theadRow);
        //change configuration
        chooseConfig(Number(cls));
        //fetch from collection "students"
        let IDs = [];
        const q1 = query(collection(db, 'session', ssn, 'students'), where("arm", "!=", 'ENTRANCE'));  //and where("days_present","array-contains","null")
        const studentSnap = await getDocs(q1);
        // console.log(studentSnap.docs.length);
        let students = studentSnap.docs.map(n => {return {'id': '_' + n.id, 'data': n.data()}}).sort((a, b) => a.data.last_name.localeCompare(b.data.last_name)).sort((c, d) => c.data.arm.localeCompare(d.data.arm)); //prefixed id with _, because ids may start with a Number
        term = ["first","second","third"].indexOf(EOT.data().this_term.toLowerCase());

        // populate tbody with student name and total score for each subject
        const benchmark = abbr_unmutated.length;
        const tbody = document.createElement('tbody');
        students.forEach(({id, data}, i) => {
            let tds = `<td>${i+1}</td><td>${data.last_name + ' ' + data.first_name}</td><td>${data.arm.toUpperCase()[0]}</td>`;
            const obj = data?.record;
            if (!obj) return;
            if(!('MTH' in obj)) return console.log('No mathematics.');
            const numOfTerms = Object.keys(obj['MTH']).length; //MTH because everyone offers it;
            
            let rt = 0, offered = 0;
            let scoreEntries = Object.entries(obj).sort();
            let f = 0;  //rt: running total
            if (obj) {
                let core = {MTH:0, ENG:0, CIV:0};
                // {MTH:0, ENG:0, {'345'.includes(cls) ? };
                for (const [k, v] of scoreEntries) {
                    let idx = abbr_unmutated.indexOf(k);
                    // console.log(idx);
                    let slice = idx - f;
                    if (slice) {
                        for (let j = 0; j < slice; j++) tds += "<td></td>";
                    }
                    const ck = Object.values(v);

                    if('345'.includes(cls)){
                        if(k in core || k in {LIT:0, GOV:0, PHY:0, CHE:0, ACCT:0, COMM:0}) core[k] = (ck.flat().reduce((x,y) => x + y, 0) / ck.length).toFixed(1)
                    }else if('012'.includes(cls)){
                        core[k] = (Object.values(v).flat().reduce((x,y) => x + y, 0) / ck.length).toFixed(1);
                    }
                    let s = (v[0]?.reduce((a,c) => a + c) || 0) + (v[1]?.reduce((a,c) => a + c) || 0) + v[2]?.reduce((a,c) => a + c) || 0;
                    if(s != 0) offered++;
                    rt += s;
                    tds += `<td>${parseFloat(s.toFixed(1))}</td>`;
                    f = idx + 1;
                }

                promotion = [...promotion, [id, core]]; //still needs to remove all symbols in replaceAll, and also on the 4th line below, from here
            }
            for (f; f < benchmark + 1; f++) {
                f < benchmark ? tds += '<td></td>' : tds += `<td>${(rt/(offered * numOfTerms)).toFixed(1)}</td>`;
            }
            tbody.insertAdjacentHTML('beforeend', `<tr data-id="${id}">${tds}</tr>`);
            // if(data.admission_no === 'DCA/21/1045') console.log(rt, offered, numOfTerms);
        });
        table.append(thead, tbody);
        isPromoted();
        loader.remove();
        tableDiv.appendChild(table);
    }
});
//copy btn
document.querySelector('button#copy-btn').addEventListener('click', e => {
    if(e.target.closest('button')){
        if(tableDiv.contains(table)){
            navigator.clipboard.writeText(document.querySelector('table').innerText)
            // navigator.clipboard.write(table)
            .then(value => {
                e.target.closest('button').querySelector('[href]').setAttribute('href', '#check');
                setTimeout(() => e.target.closest('button').querySelector('[href]').setAttribute('href', '#copy'), 3000);
            })
            .catch(err => console.log("Clipboard error:", err))
        }
    }
})
function isPromoted(){
    let prom=0,prob=0,nprm=0;
    if(term == 2) {
        if('012'.includes(cls)){//JSS class
            promotion.forEach((o,ox) => {
                const cell = table.querySelector(`tbody tr[data-id="${o[0]}"]`);
                let ol = Object.values(o[1]);
                let rol = (ol.reduce((v,w) => v + Number(w), 0)) / ol.length;
                if(rol <= 49.4){
                    cell.insertAdjacentHTML('beforeend', '<td class="not_promoted">Not promoted</td>'), nprm++;
                }else if(rol >= 49.5 && rol <= 54.5){
                    cell.insertAdjacentHTML('beforeend', '<td class="probation">Probation</td>'), prob++;
                }else{
                    cell.insertAdjacentHTML('beforeend', '<td class="promoted">Promoted</td>'), prom++;
                }
            });
        }
        if('345'.includes(cls)){//SSS class
            promotion.forEach((p2,px) => {
                const cell = table.querySelector(`tbody tr[data-id="${p2[0]}"]`);
                // const nb = names[px]['nb'];
                // if(nb !== null){
                //     cell.insertAdjacentHTML('beforeend', `<td>${nb}.</td>`);
                //     if(nb.toLowerCase() === 'promoted') prom++;
                //     if(nb.toLowerCase() === 'probation') prob++
                //     if(nb.toLowerCase() === 'repeated') nprm++;
                // }else{
                    const {MTH, ENG, ...others} = p2[1];
                    if(MTH >= 50 && ENG >= 50 && Object.values(others).some(n => n >= 50)){
                        cell.insertAdjacentHTML('beforeend', '<td class="promoted">Promoted</td>'), prom++;
                    }else if((MTH >= 50 || ENG >= 50) && Object.values(p2[1]).filter(n => n >= 50).length >= 2){
                        cell.insertAdjacentHTML('beforeend', '<td class="probation">Probation</td>'), prob++;
                    }else if(Object.values(p2[1]).every(n => n < 50) || (MTH < 50 && ENG < 50)){
                        cell.insertAdjacentHTML('beforeend', '<td class="not_promoted">Not promoted</td>'), nprm++;
                    }
                // }
            })
        }
    }
    //insert no. of promoted, probated or repeated
    document.querySelector('li#promoted').querySelector('strong').textContent = prom;
    document.querySelector('li#not-promoted').querySelector('strong').textContent = nprm;
    document.querySelector('li#probation').querySelector('strong').textContent = prob;
    // calculate position according to positionArray
    // positionArray.sort((a, b) => a - b).reverse();
    // const totalColumn = document.querySelector('th#total').cellIndex + 1; //plus 1, i.e. because cellIndex is zero-based

    // for (let i = 0; i < names.length; i++) {
    //     // console.log(positionArray[i], document.querySelector(`tbody tr:nth-child(${i+1}) td:nth-child(${totalColumn})`).innerText)
    //     const pos = positionArray.indexOf(document.querySelector(`tbody tr:nth-child(${i+1}) td:nth-child(${totalColumn})`).innerText);
    //     document.querySelector(`tbody tr:nth-child(${i+1})`).insertAdjacentHTML('beforeend', `
    //         <td>${pos+1}</td>
    //     `)
    // }
}

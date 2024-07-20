//REMEMBER TO WEBPACK IMPORTS: THEY ARE CURRENTLY USING "GSTATIC"
import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
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
const ss = JSON.parse(sessionStorage.snapshotId);   //id & data
const fname = ss.data.fullName;
const masterOfForm = Object.entries(ss.data.masterOfForm)[0];
const masterClass = masterOfForm[0];
const masterArm = masterOfForm[1];

document.querySelector("header").innerHTML = `<span class='flashing'></span>${fname} &mdash; ${masterClass} ${masterArm}`;

let app = initializeApp(configs[6]); //SSS 2 config
let db = getFirestore(app);

// get EOT and subject collections for both junior and senior secondary
const EOT = await getDoc(doc(db,"reserved","EOT"));
const jrsub = await getDoc(doc(db, "reserved", "2aOQTzkCdD24EX8Yy518"));
const srsub = await getDoc(doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq"));
// console.log(jrsub.data());
let abbr, abbr_unmutated;
if (masterClass.startsWith("JSS")) {
    abbr = Object.keys(jrsub.data()).sort();
    abbr_unmutated = Object.keys(jrsub.data()).sort();
} else if (masterClass.startsWith("SSS")) {
    abbr = Object.keys(srsub.data()).sort();
    abbr_unmutated = Object.keys(srsub.data()).sort();
}

// reset app and query the students of the masterOfForm's arm
chooseConfig(classes.indexOf(masterClass));
let IDs = [], names = [];
const q1 = query(collection(db, "students"), where("arm", "==", masterArm), orderBy("last_name"));  //and where("days_present","array-contains","null")
const studentSnap = await getDocs(q1);
studentSnap.docs.forEach(s => {
    IDs.push(s.id);
    names.push(`${s.data().last_name} ${s.data().first_name} ${s.data()?.other_name}`)
});
// console.log(IDs);
//get scores with the provided IDs
let scoresSnap = [];
const p1 = IDs.map(async id => {
    await getDoc(doc(db, "scores", id)).then(snap => scoresSnap.push(snap.data()));
});
await Promise.all(p1);
// console.log(scoresSnap.length, scoresSnap[0]);

window.addEventListener('load', (e) => {
    document.querySelector('main').classList.add('opq');
});
const table = document.querySelector('table');
const thead_row = table.querySelector('thead > tr');
const tbody = table.querySelector('tbody');
const tfoot_td = table.querySelector('tfoot td');

//populate table header with the [abbr] of the subjects
const th = abbr.unshift('#','NAME'); //mutates array & returns new length of same array
tfoot_td.setAttribute('colspan', th);
for (let i = 0; i < th; i++) {
    thead_row.insertAdjacentHTML('beforeend', `
    <th>${abbr[i]}</th>
    `);
}
document.querySelector("header > span").classList.remove("flashing");
let term = ["First","Second","Third"].indexOf(EOT.data().this_term);

// populate tbody with student name and total score for each subject
names.forEach((n, i) => {
    let tds = `<td>${i+1}</td><td>${n}</td>`;
    const obj = scoresSnap[i];
    if (obj) {
        let f = 0;
        for (const [k, v] of Object.entries(obj).sort()) {
            let idx = abbr_unmutated.indexOf(k);
            // console.log(idx);
            let slice = idx - f;
            if (slice) {
                for (let j = 0; j < slice; j++) tds += "<td></td>";
            }
            let s = v[term].reduce((a,c) => a + c);
            tds += `<td>${s}</td>`;
            f = idx + 1;
        }
    }
    // console.log(tds)
    tbody.insertAdjacentHTML('beforeend', `
        <tr id="${IDs[i]}">${tds}</tr>
    `)
});

// compute total and average for each subject and store in td string
console.log(scoresSnap.length);
let aveStr = '', totStr = '';
abbr.forEach((ab,ix) => {
    if (!([0,1].includes(ix))) {
        let td = [...document.querySelectorAll(`tbody tr > td:nth-child(${ix+1})`)];
        let m = td.map(x => Number(x.innerText)).filter(y => Boolean(y));
        // console.log(m);
        let tc = m.reduce((a,c) => a + c, 0);
        totStr += `<td>${tc.toFixed(1)}</td>`;
        aveStr += `<td>${(tc/m.length).toFixed(1)}</td>`;
    } else if (ix == 1) {
        totStr += '<td></td><td>Total</td>';
        aveStr += '<td></td><td>Average</td>';
    }
});

// insert total and average in tfoot tr
function insertFoot(a, t) {
    for (const i of arguments) {
        // console.log(i)
        document.querySelector("tfoot").insertAdjacentHTML("afterbegin", `
            <tr>${i}</tr>
        `)
    }
}
insertFoot(totStr, aveStr);
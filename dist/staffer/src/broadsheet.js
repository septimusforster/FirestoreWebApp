import { initializeApp, deleteApp } from "firebase/app";
import { collection, collectionGroup, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

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

let app = initializeApp(configs[6]); //FirebasePro config
let db = getFirestore(app);

// calculate session
const MONTH = new Date().getMonth();
const session = MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session
// get EOT and subject collections for both junior and senior secondary
let term;
const worker = new Worker(new URL('dist/staffer/src/worker_bundle.js', location.origin));
worker.postMessage(session);
worker.onmessage = ({data}) => {
    // const EOT = data;   //worker.js
    term = ["First","Second","Third"].indexOf(data?.this_term);
    console.log(data.this_term, term);
};
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
} else {
    //for recruits or entrance students
    abbr = ['BSC', 'BIO', 'CCA', 'COM', 'CRS', 'ICT', 'PHE', 'ENG', 'MTH'].sort();
    abbr_unmutated = ['BSC', 'BIO', 'CCA', 'COM', 'CRS', 'ICT', 'PHE', 'ENG', 'MTH'].sort();
}

// reset app and query the students of the masterOfForm's arm
const school = 'DCA';
chooseConfig(configs[7].indexOf(masterClass));
let IDs = [], names = [];
const q1 = query(collection(db, 'session', session, 'students'), where("arm", "==", masterArm), orderBy("last_name"));  //and where("days_present","array-contains","null")
const studentSnap = await getDocs(q1);
studentSnap.docs.forEach(s => {
    if (['demo'].includes(masterClass.toLowerCase()) || s.data()?.admission_no.toUpperCase().includes(school)) {
        IDs.push(s.id);
        names.push(`${s.data().last_name} ${s.data().first_name} ${s.data()?.other_name}`)
    }
});
//get scores with the provided IDs
let scoresSnap = [];
const p1 = IDs.map(async id => {
    await getDoc(doc(db, 'session', session, 'students', id, "scores", 'records')).then(snap => scoresSnap.push(snap.data()));
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
abbr.push('AVE');   //last column
const th = abbr.unshift('#','NAME'); //mutates array & returns new length of same array
tfoot_td.setAttribute('colspan', th);
for (let i = 0; i < th; i++) {
    thead_row.insertAdjacentHTML('beforeend', `
    <th>${abbr[i]}</th>
    `);
}
document.querySelector("header > span").classList.remove("flashing");

// populate tbody with student name and total score for each subject
const benchmark = abbr_unmutated.length;
names.forEach((n, i) => {
    let tds = `<td>${i+1}</td><td>${n}</td>`;
    const obj = scoresSnap[i];
    let rt = 0;
    let scoreEntries = Object.entries(obj).sort();
    let f = 0;  //rt: running total
    if (obj) {
        for (const [k, v] of scoreEntries) {
            let idx = abbr_unmutated.indexOf(k);
            let slice = idx - f;
            if (slice) {
                for (let j = 0; j < slice; j++) tds += "<td></td>";
            }
            let s = v[term]?.reduce((a,c) => a + c) || 0;
            rt += s;
            tds += `<td>${parseFloat(s.toFixed(1))}</td>`;
            f = idx + 1;
        }
    }
    for (f; f < benchmark + 1; f++) {
        f < benchmark ? tds += '<td></td>' : tds += `<td>${(rt/scoreEntries.length).toFixed(1)}</td>`;
    }
    tbody.insertAdjacentHTML('beforeend', `
        <tr id="${IDs[i]}">${tds}</tr>
    `)
});

// compute total and average for each subject and store in td string
let aveStr = '', totStr = '';
abbr.forEach((ab,ix) => {
    if (!([0,1].includes(ix))) {
        let td = [...document.querySelectorAll(`tbody tr > td:nth-child(${ix+1})`)];
        let m = td.map(x => Number(x.innerText)).filter(y => Boolean(y));
        // console.log(m);
        let tc = m.reduce((a,c) => a + c, 0);
        totStr += `<td>${tc.toFixed(1)}</td>`;
        aveStr += `<td>${(tc/(m.length || 0.001)).toFixed(1)}</td>`;    //0.001 is to prevent 0 (tc) being divided by 0 (m.length), which give NaN
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

let positionArray = [];
function studentTotal () {
    names.forEach((n, i) => {
        let x = [...document.querySelectorAll(`tbody tr:nth-child(${i+1}) td:not(td:last-child)`)];
        let y = x.map(f => Number(f.innerText));
        y.splice(0,2);
        let z = y.reduce((a,c) => a + c, 0);

        const wrapperDiv = document.createElement('DIV');
        const childDiv = document.createElement('DIV');
        const txt = document.createTextNode(z.toFixed());
        positionArray.push(Number(z.toFixed()));
        childDiv.classList.add('snum');
        childDiv.append(txt);
        wrapperDiv.append(childDiv)

        document.querySelector(`tbody tr:nth-child(${i+1}) td:nth-child(2)`).appendChild(wrapperDiv);
    });
}
studentTotal();

// calculate position according to positionArray
positionArray.sort((a, b) => a - b).reverse();

let computedPos = false;
const newLabel = document.createElement("LABEL");
const newInput = document.createElement("INPUT");
const labelTxt = document.createTextNode("Hide/Reveal Position");
newLabel.htmlFor = "position";
newInput.type = "checkbox";
newInput.name = "position";
newInput.id = "position";
newInput.addEventListener("change", (e) => {
    const chkState = e.target.checked;
    if (!computedPos) {
        // compute pos and insert in DOM
        let s = [...document.querySelectorAll(".snum")];
        for (let i = 0; i < names.length; i++) {
            const pos = positionArray.indexOf(Number(s[i].innerText));
            document.querySelector(`tbody tr:nth-child(${i+1}) td:nth-child(2) > div`).insertAdjacentHTML('beforeend', `
                <div class="ps show">${pos+1}</div>
            `)
        }
        computedPos = true;
    }
    document.querySelectorAll("div.ps").forEach(ps => ps.classList.toggle("show", chkState));
});
newLabel.append(newInput, labelTxt);
document.querySelector("header").appendChild(newLabel);

//for setting promotion status
const dialogs = document.querySelectorAll("dialog");
const promoTabBody = document.querySelector("table#promo-tab tbody");
const promoForm = document.querySelector("form#promo-form");

let computedProm = false;
let newBtn = document.createElement("button");
newBtn.type = "button";
newBtn.textContent = "Promotion Settings";
newBtn.id = "promo-btn";
newBtn.addEventListener("click", (e) => {
    if (!computedProm) {
        //get tbody tr IDs and names and insert into the promoTab tbody rows cells having newly created radio buttons
        const rows = [...document.querySelectorAll('tbody tr')];
        rows.forEach((tr, ix) => {
            const id = tr.id;
            const name = tr.children[1].firstChild.textContent;
            promoTabBody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${ix+1}</td>
                    <td>${name}</td>
                    <td><input type="radio" name="${id}" value="Promoted"/></td>
                    <td><input type="radio" name="${id}" value="Probation"/></td>
                    <td><input type="radio" name="${id}" value="Advised to repeat"/></td>
                    <td><input type="radio" name="${id}" value="Not promoted"/></td>
                </tr>
            `);
        });
        computedProm = true;
    }
    dialogs[0].showModal();
});
document.querySelector("header").appendChild(newBtn);

//promotion status form submission
promoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';

    let data = [];
    const fd = new FormData(promoForm);
    for (const [k, v] of fd.entries()) {
        data.push({id: k, pr: v});
    }
    const p = data.map(async ({id, pr}) => {
        await updateDoc(doc(db, "students", id), {promo_status: pr});
    });
    await Promise.all(p);
    window.alert('Promotion Settings applied successfully.');
    e.submitter.disabled = false;
    e.submitter.style.cursor = 'pointer';
    closeBtn.click();
});

const closeBtn = document.querySelector("input#close");
closeBtn.addEventListener('click', () => closeBtn.closest('dialog').close());
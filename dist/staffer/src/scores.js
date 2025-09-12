import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, setDoc, getFirestore, orderBy, query, where, increment, updateDoc } from "firebase/firestore";
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

// initialize firebase app
var app = initializeApp(configs[6])
var db;
function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
db = getFirestore()

let eotDates, term;
// calculate session
const MONTH = new Date().getMonth();
const session = MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session
console.log(session);
async function eot() {
    const eotRef = doc(db, 'EOT', session);
    await getDoc(eotRef).then(async (res) => {
        // store dates in eotDates
        const formBarH3 = document.querySelector('div#formBar > h3');
        formBarH3.insertAdjacentHTML('afterend', `<span>Working on: <b>${res.data().this_term} Term</b></span>`);
        eotDates = res.data();
        term = ['First','Second','Third'].indexOf(res.data().this_term);
    });
}
eot();

let permissions = async function () {
    const data = await getDoc(doc(db, 'EOT', session));
    const p = data.get('perm');
    const perm = p.toString(2).padStart(8,0).split(''); //padStart ensures it is 8-bit long for all switches
    return perm;
}
let permission = await permissions();

const ss = JSON.parse(sessionStorage.getItem('snapshotId'));

let clsIndex, armIndex, subIndex;
const armDatalist = document.querySelector('datalist#arm');
const subDatalist = document.querySelector('datalist#subject');
const classDatalist = document.querySelector('datalist#class');
// establish classrooms taught
const classes = ss.data.classroomsTaught.sort();
classes.push('Demo'); //appended Demo class
classes.forEach(cls => {
    classDatalist.insertAdjacentHTML('beforeend', `
        <option value="${cls}"></option>
    `)
});
let abbr = {};
// establish subjects taught
const subjects = ss.data.subjectsTaught;
subjects.forEach((sbs, idx) => {
    let obj = Object.entries(sbs);
    subDatalist.insertAdjacentHTML('afterbegin', `
        <option data-id="${idx}" id="${obj[0][0]}" value="${obj[0][0]}">${obj[0][1]}</option>
    `)
    abbr[obj[0][0]] = obj[0][1];
})

// Arm yourselves
const armRef = doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu");
if(!sessionStorage.hasOwnProperty('arm')) {
    await getDoc(armRef).then(doc => sessionStorage.setItem('arm', JSON.stringify(doc.data())))
    console.log('From server')
}
const armArray = JSON.parse(sessionStorage.getItem('arm')).arms.sort();
armArray.forEach((arm, ind) => {
    armDatalist.insertAdjacentHTML('beforeend', `
        <option data-id="${ind}" id="${arm}" value="${arm}"></option>
    `)
})
const subjectForm = document.forms.subjectForm;
subjectForm.addEventListener('change', (e) => {
    if (e.target.value) {
        if (e.target.name === 'class') {
            clsIndex = configs[7].indexOf(e.target.value);
            chooseConfig(clsIndex);
        } else if (e.target.name === 'arm') {
            armIndex = Number(armDatalist.options.namedItem(e.target.value).dataset.id);
        } else if (e.target.name === 'subject') {
            subIndex = Number(subDatalist.options.namedItem(e.target.value).dataset.id);
        }
    }
})
const dialogGreen = document.querySelector('dialog#green');
let sub;
const tbody = document.querySelector('tbody');
subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    dialogGreen.querySelector('.submit__icon').classList.add('running');
    dialogGreen.showModal();
    // const formData = new FormData(subjectForm);
    const cls = subjectForm.class.value;
    const arm = subjectForm.arm.value;
    sub = subjectForm.subject.value;
   
    // fetch student IDs and concatenation of their names
    const q = query(collection(db, 'session', session, "students"), where("arm", "==", arm));
    const personDoc = await getDocs(q);
    if (personDoc.empty) {
        dialogGreen.querySelector('.submit__icon').classList.remove('running');
        dialogGreen.close();
        window.alert("No student found.");
        return;
    }

    let kvArray = [];
    personDoc.docs.forEach(doc => {
        if (doc.data().hasOwnProperty("offered") && doc.data().offered.hasOwnProperty(sub)) {
            kvArray.push([
                /*doc.data()?.id || */doc.id,
                `${doc.data().last_name} ${doc.data().first_name} ${doc.data().other_name}`,
            ]);
        }
    })
    
    sessionStorage.setItem([clsIndex.toString() + armIndex], JSON.stringify(kvArray))
    // console.log(kvArray.length)
    
    if (!kvArray.length) {
        dialogGreen.querySelector('.submit__icon').classList.remove('running');
        dialogGreen.close();
        window.alert("No student offers the selected subject.");
        e.submitter.disabled = false;
        return;
    };

    let scores = [];    
    const promises = kvArray.map(async arrVal => {
        //USE THE TERM-DEFINER TO PICK THE RIGHT SET OF SCORES TO BE EDITED
        await getDoc(doc(db, 'session', session, 'students', arrVal[0], "scores", 'records')).then((doc) => scores.push(doc?.get(sub) || null));
    })
    await Promise.all(promises);
    // clear tbody for new arrivals
    tbody.innerHTML = '';
    // create scoresheet of names and scores

    if (scores.length) {
        kvArray.forEach(([id, nm], ind) => {
            let table_data = '';
            try {
                for (let h = 0; h < permission.length; h++) {
                    permission[h] == 1 ? table_data += `<td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?" placeholder="${scores[ind][term]?.[h] == undefined ? '' : scores[ind][term]?.[h]}"/></td>` : table_data += `<td>${scores[ind][term]?.[h] == undefined ? '' : scores[ind][term][h]}</td>`;
                }
            } catch (error) {
                for (let h = 0; h < permission.length; h++) {
                    permission[h] == 1 ? table_data += `<td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?" placeholder=""/></td>` : table_data += `<td></td>`;
                }
            }
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="${id}">
                    <td>${ind+1}</td>
                    <td>${nm}</td>
                    ${table_data}
                </tr>
            `);
        });
    }

    sessionStorage.setItem('scores', JSON.stringify(scores))
    document.querySelector('.sub__title').textContent = `${abbr[sub]} ~ ${cls} ~ ${arm}`;
    
    dialogGreen.querySelector('.submit__icon').classList.remove('running');
    dialogGreen.close();
    e.submitter.disabled = false;
});

const dialogPurple = document.querySelector('dialog#purple');
const dialogPurpleBtn = dialogPurple.querySelector('button');

dialogPurpleBtn.addEventListener('click', (e) => {
    e.target.parentElement.close();
    dialogPurple.querySelector('.submit__icon').classList.remove('running');
    dialogPurple.querySelector('.submit__icon').classList.remove('borderless');
})

const scoreForm = document.forms.scoreForm;
scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    dialogPurple.querySelector('.submit__icon').classList.add('running');
    dialogPurple.showModal();
    // const formData = new FormData(scoreForm);
    let tr = document.body.querySelectorAll('tbody tr');
    let container = [];

    if (!tr.length) {
        dialogPurpleBtn.click();
        window.alert("There is nothing to save.");
        e.submitter.disabled = false;
        return;
    }

    tr.forEach(row => {
        const inputs = row.querySelectorAll('input');
        let bool = [...inputs].some(inp => inp.type == "text" && inp.value);
        if (!bool) return;
        const tds = row.querySelectorAll('td:not(:nth-of-type(1),:nth-of-type(2))');
        let cells = [...tds].map(x => Number(x.firstChild?.value || x.firstChild?.placeholder || x.innerText) || null);
        container.push([row.id, cells]);
    });

    const promises = container.map(async cn => {
        const docRef = doc(db, 'session', session, 'students', cn[0], "scores", 'records');
        await setDoc(docRef, {
            [sub]: {[term]: cn[1]}
        }, { merge: true })
    })
    await Promise.allSettled(promises);

    dialogPurple.querySelector('.submit__icon').classList.add('borderless');
    dialogPurpleBtn.innerHTML = 'Changes Saved  &checkmark;';
    dialogPurpleBtn.style.display = 'block';
    e.submitter.disabled = false;
})
/*
const promise1 = new Promise((resolve, reject) => {
    setTimeout(resolve, 3000, 'classList.add: fulfilled')
})
const promise2 = new Promise((resolve, reject) => {
    setTimeout(reject, 6000, 'classList.add: rejected')
})
Promise.allSettled([promise1, promise2])
    .then(results => {
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log(result.value)
            } else {
                console.log(result.reason)
            }
        })
    })
*/
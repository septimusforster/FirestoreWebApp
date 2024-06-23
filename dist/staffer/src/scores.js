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
async function eot() {
    const eotRef = doc(db, "reserved", "EOT");
    await getDoc(eotRef).then((res) => {
        // store dates in eotDates
        const formBarH3 = document.querySelector('div#formBar > h3');
        formBarH3.insertAdjacentHTML('afterend', `<span>Working on: <b>${res.data().this_term} Term</b></span>`);
        eotDates = res.data();
        term = ['First','Second','Third'].indexOf(res.data().this_term);
    })
}
eot();
const ss = JSON.parse(sessionStorage.getItem('snapshotId'));

let clsIndex, armIndex, subIndex;
const armDatalist = document.querySelector('datalist#arm');
const subDatalist = document.querySelector('datalist#subject');
const classDatalist = document.querySelector('datalist#class');
// establish classrooms taught
const classes = ss.data.classroomsTaught.sort();
classes.forEach(cls => {
    classDatalist.insertAdjacentHTML('beforeend', `
        <option value="${cls}"></option>
    `)
})
let abbr = {};
// establish subjects taught
const subjects = ss.data.subjectsTaught;
subjects.forEach((sbs, idx) => {
    let obj = Object.entries(sbs);
    subDatalist.insertAdjacentHTML('beforeend', `
        <option data-id="${idx}" id="${obj[0][0]}" value="${obj[0][0]}">${obj[0][1]}</option>
    `)
    abbr[obj[0][0]] = obj[0][1];
})

// Arm yourselves
const armRef = doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu");
if(!sessionStorage.hasOwnProperty('arm')) {
    await getDoc(armRef).then(doc => sessionStorage.setItem('arm', JSON.stringify(doc.data().arms)))
    console.log('From server')
}
const armArray = JSON.parse(sessionStorage.getItem('arm')).sort();
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
    let dt = new Date(eotDates[cls]).setHours(24);

    if (dt < Date.now()) {
        e.submitter.disabled = false;
        dialogGreen.querySelector('.submit__icon').classList.remove('running');
        dialogGreen.close();
        window.alert("Oops! The date for entry of records is closed.");
        return;
    };
    
    // fetch student IDs and concatenation of their names
    const q = query(collection(db, "students"), where("arm", "==", arm), orderBy("last_name"));
    const personDoc = await getDocs(q);
    if (personDoc.empty) {
        dialogGreen.querySelector('.submit__icon').classList.remove('running');
        dialogGreen.close();
        window.alert("No dice!");
        return;
    }

    let kvArray = [];
    personDoc.docs.forEach(doc => {
        if (doc.data().hasOwnProperty("offered") && doc.data().offered.hasOwnProperty(sub)) {
            kvArray.push([
                doc.data().id,
                `${doc.data().last_name} ${doc.data().first_name} ${doc.data().other_name}`,
            ])
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
        await getDoc(doc(db, "scores", arrVal[0])).then((doc) => scores.push(doc.data()));
    })
    await Promise.all(promises);
    // clear tbody for new arrivals
    tbody.innerHTML = '';
    // create scoresheet of names and scores
    let sn = 1;
    kvArray.forEach(([id, nm], ind) => {
        if (scores[ind] && scores[ind][sub]) {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="${id}">
                    <td>${sn}</td>
                    <td>${nm}</td>
                    <td>${scores[ind][sub][term][0] == null ? '' : scores[ind][sub][term][0]}</td>
                    <input type="hidden" name="${id}" value="${scores[ind][sub][term][0] == null ? '' : scores[ind][sub][term][0]}"/>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?" placeholder="${scores[ind][sub][term][1] == null ? '' : scores[ind][sub][term][1]}"/></td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?" placeholder="${scores[ind][sub][term][2] == null ? '' : scores[ind][sub][term][2]}"/></td>
                    <input type="hidden" name="${id}" value="${scores[ind][sub][term][3] == null ? '' : scores[ind][sub][term][3]}"/>
                    <td>${scores[ind][sub][term][3] == null ? '' : scores[ind][sub][term][3]}</td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?" placeholder="${scores[ind][sub][term][4] == null ? '' : scores[ind][sub][term][4]}"/></td>
                </tr>
            `)
        } else {
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="${id}">
                    <td>${sn}</td>
                    <td>${nm}</td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?"/></td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?"/></td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?"/></td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?"/></td>
                    <td><input type="text" name="${id}" pattern="[0-9]{1,2}(\.[0-9]{0,1})?"/></td>
                </tr>
            `)
        }
        sn++;
    })
    // sessionStorage.setItem('scores', JSON.stringify(scores))
    document.querySelector('.sub__title').textContent = `${abbr[sub]} ~ ${cls} ~ ${arm}`;
    dialogGreen.querySelector('.submit__icon').classList.remove('running');
    dialogGreen.close();
    e.submitter.disabled = false;
})

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
    const formData = new FormData(scoreForm);
    let tr = document.body.querySelectorAll('tbody tr');
    let container = [];
        
    if (!tr.length) {
        dialogPurpleBtn.click();
        window.alert("There is nothing to save.");
        e.submitter.disabled = false;
        return;
    }

    tr.forEach(row => {
        let bool = false; //must be set to 0
        const inputs = row.querySelectorAll('td > input');
        inputs.forEach(inp => {
            if (inp.type == 'text' && inp.value) {
                return bool = true;
            }
        });
        if (!bool) return;
        let cells = formData.getAll(row.id).map(x => x == '' ? null : Number(x));
        container.push([row.id, cells]);
    })  
    const promises = container.map(async cn => {
        const docRef = doc(db, "scores", cn[0]);
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
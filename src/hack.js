import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, getDocs, doc, updateDoc, query, where, orderBy, setDoc } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};

const badge = document.querySelector('aside:nth-child(1)');
const arrwBtn = document.querySelector('.arrw_r');
arrwBtn.disabled = true;

// initialize firebase app
var app = initializeApp(configs[6])
// init services
var db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}

//load subject parameters
const subIDs = {
    jjid: '2aOQTzkCdD24EX8Yy518',
    ssid: 'eWfgh8PXIEid5xMVPkoq'
}
let subjects = JSON.parse(sessionStorage.getItem('sbj'));
if (!subjects) {
    subjects = [];
    for await (const [k, v] of Object.entries(subIDs)) {
        const snap = await getDoc(doc(db, 'reserved', v));
        subjects.push(snap.data());
    }
    sessionStorage.setItem('sbj', JSON.stringify(subjects));
}
//insert subjects
const subElem = document.querySelector('select#nsub');
subjects.forEach(item => {
    for (const [k, v] of Object.entries(item))
        subElem.insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`);
});
arrwBtn.disabled = false;
badge.classList.add('off');

const MONTH = new Date().getMonth();
let session = MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());
var students, scores;
let currentClass;
//form events
const forms = document.forms;
//get students
forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    forms[0].querySelector('.gp.fst').classList.add('on');
    const ncls = document.querySelector('select#ncls').value;
    
    try {
        if (currentClass === ncls) {
            return;
        }
        currentClass = ncls;
        chooseConfig(configs[7].indexOf(ncls));
        const snap = await getDocs(query(collection(db, 'session', session, 'students'), orderBy('last_name')));
        students = [], scores = [];
        
        snap.docs.forEach(d => {
            students.push({id: d.id, name: `${d.get('last_name')} ${d.get('first_name')} ${d.get('other_name')}`});
        });
        
        const prom = students.map(async ({id}) => {
            const snap1 = await getDoc(doc(db, 'session', session, 'students', id, 'scores', 'records'));
            if (snap1.exists) scores.push(snap1.data());
        });
        await Promise.allSettled(prom);
    } catch (err) {
        console.log(err.message);
    } finally {
        e.submitter.disabled = false;
        forms[0].querySelector('.gp.fst').classList.remove('on');
        forms[1].classList.add('on');
    }
});
//listeners for TERM and SUBJECT form elems
const aside2 = document.querySelector('aside:nth-child(2)');
const mylist = document.getElementById('mylist');
let data = [], subject, term, currentSubject;
[...document.querySelectorAll('select#nsub, select#ntrm')].forEach((slt, idx, arr) => {
    slt.addEventListener('change', (e) => {
        if (scores && arr.every(mbr => mbr.value !== '')) {
            aside2.classList.toggle('on', true);
            //extract and display names
            subject = arr[0].value, term = Number(arr[1].value);

            data = [];  //reset data
            for (let i = 0; i < students.length; i++) {
                let abbrArray = scores[i]?.[subject]?.[term];
                if (!abbrArray || abbrArray.every(el => el !== 0)) continue;
                let element = abbrArray.map(v => v === 0 ? null : v)
                data.push([students[i].id, students[i].name, element]);
            }
            //populate ol list
            if (!data.length) {
                mylist.innerHTML = '<code><i>None found.</i></code>';
                return;
            }
            data.forEach(d => {
                mylist.insertAdjacentHTML('beforeend', `
                    <li><small>${d[0]}</small><br><b>${d[1]}</b></li>
                `);
            });
            //activate Run Function
        }
    });
});
//form listener to submit null for zeros
const loader = document.querySelector('.loader');
forms[1].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    if (loader.className.includes('opq')) loader.classList.remove('opq');
    let progress = 0;
    progress += 30;
    loader.style.width = progress + '%';

    if (data.length) {
        try {
            // for (const x of data) {
            //     console.log(x)
            // }
            for await (const x of data) {
                await setDoc(doc(db, 'session', session, 'students', x[0], 'scores', 'records'), {
                    [subject]: {
                        [term]: x[2]
                    }
                }, {merge: true})
            }
            progress += 70;
            loader.style.width = progress + '%';
        } catch (err) {
            console.log(err.nessage);
        } finally {
            loader.classList.add('opq');
            e.submitter.disabled = false;
            console.log("Completed.");
        }
    } else {
        loader.classList.add('opq');
        e.submitter.disabled = false;
        alert ("No data available.");
    }
});
//toggle aside2
document.querySelectorAll('.stn.mq').forEach(stn => {
    stn.addEventListener('click', (e) => {
        aside2.classList.toggle('on');
    });
});
import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, getCountFromServer, collection, startAfter, getDoc, getDocs, updateDoc, doc, query, where, orderBy, setDoc, limit, runTransaction, deleteField } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};

const badge = document.querySelector('aside:nth-child(1)');
const arrwBtn = document.querySelector('.arrw_r');
arrwBtn.disabled = true;

// initialize firebase app
// var app = initializeApp(configs[6])
var app = initializeApp(configs[9].appsettings);
// init services
var db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
const classroom = ['JS1','JS2','JS3','SS1','SS2','SS3'], clx = 5;
// const offered = {
//     AGR: "Agricultural Science",
//     BSC: "Basic Science",
//     BTEC: "Basic Technology",
//     BUS: "Business Studies",
//     CCA: "Cultural and Creative Arts",
//     CIV: "Civic Education",
//     CRS: "Christian Religious Studies",
//     ENG: "English Language",
//     FRE: "French",
//     HAU: "Hausa Language",
//     HECO: "Home Economics",
//     HIS: "History",
//     ICT: "Computer Studies",
//     IGB: "Igbo Language",
//     MTH: "Mathematics",
//     MUS: "Music",
//     PHE: "Physical and Health Education",
//     SOS: "Social Studies",
//     YOR: "Yoruba",
//     ACCT: "Financial Accounting",
//     BIO: "Biology",
//     CCP: "Catering Craft Practice",
//     CHE: "Chemistry",
//     COM: "Commmerce",
//     ECO: "Economics",
//     FDN: "Foods and Nutrition",
//     FMAT: "Further Mathematics",
//     FSH: "Fisheries",
//     GEO: "Geography",
//     GOV: "Government",
//     LIT: "Literature",
//     MKT: "Marketing",
//     PHY: "Physics",
//     TD: "Technical Drawing",
//     TOU: "Tourism",
//     VIS: "Visual Arts",
// };
/*
let products = [];
const snped = await getDocs(query(collection(db, 'patients2025')));
// snped.docs.forEach(d => products.push({[d.id]: d.data()}));
const prom = snped.docs.map(async m => {
    const newDocs = await getDocs(query(collection(db, 'patients2025',m.id,'record')));
    products.push([...newDocs.docs].map(n => {
        return {[m.id]: n.data()}
    }))
})
await Promise.all(prom).then((res, rej) => {
    console.log(products)
})
*/

chooseConfig(clx); //projects

let lastSnapshot, cursorFetch;
const count = await getCountFromServer(query(collection(db, 'session/2026/students'), where('arm', '!=', 'ENTRANCE')));
console.log("Total Number of Students:", count.data().count);

let fetches = 0;
const myBtn = document.createElement('button');
myBtn.className = 'fbtn';
myBtn.setAttribute('style', 'width:fit-content;position:fixed;right:2rem;top:2rem;');
myBtn.textContent = `Fetch ${classroom[clx]} collection`;
/*
myBtn.addEventListener('click', async (e) => {
    console.time(`Collecting ${classroom[clx]}`);
    if(lastSnapshot){
        cursorFetch = await getDocs(query(collection(db, 'session/2024/students'), where('arm', '!=', 'ENTRANCE'), limit(30), startAfter(lastSnapshot)));
    }else{
        cursorFetch = await getDocs(query(collection(db, 'session/2024/students'), where('arm', '!=', 'ENTRANCE'), limit(30)));
    }
    lastSnapshot = cursorFetch.docs.at(-1);
    fetches++;
    console.log("Times fetched:", fetches);
    console.timeEnd(`Collecting ${classroom[clx]}`)

    console.log(cursorFetch.docs.length)

    const prom = [...cursorFetch.docs].map(async m => {
        try{
            await runTransaction(db, async (transaction) => {
                const d = await transaction.get(doc(db, 'session/2024/students',m.id,'records','scores'))
                const record = d.data();
                if(record) await transaction.update(doc(db, 'session/2024/students',m.id), {record})
            })
        }catch (err) {
            console.log(err);
        }
        // const snapped = await getDoc(doc(db, 'session/2025/students',m.id,'scores','records'));
        // snapshots.push({[m.id]: snapped.data()})
    })
    await Promise.all(prom).then((resolve, reject) => {
        console.log(resolve.length, 'done.');
    })
});
document.body.appendChild(myBtn);
*/

const pre = document.querySelector('pre');
let snapshots = [];
const now = Date.now();

myBtn.addEventListener('click', async (e) => {
    console.time(`${classroom[clx]}`);
    if(lastSnapshot){
        cursorFetch = await getDocs(query(collection(db, 'session/2026/students'), where('arm', '!=', 'ENTRANCE'), limit(30), startAfter(lastSnapshot)));
    }else{
        cursorFetch = await getDocs(query(collection(db, 'session/2026/students'), where('arm', '!=', 'ENTRANCE'), limit(30)));
    }
    lastSnapshot = cursorFetch.docs.at(-1);
    fetches++;
    console.log("Times fetched:", fetches, "\n", "Data:", cursorFetch.docs.length);
    console.timeEnd(`${classroom[clx]}`)
    let students = '';
    
    cursorFetch.docs.forEach(d => {
        const { admission_no, admission_year, arm, dob, first_name, last_name, other_name, gender, record=null, id, password } = d.data();
        let sbjs = {};
        if(record){
            // for(const sb of Object.keys(record).sort()) sbjs[sb] = {0:[],1:[],2:[]};
            for(const sb in record) sbjs[sb] = record[sb];
            students += JSON.stringify({stid:admission_no,enrolled:admission_year,arm, dob,fname:first_name,lname:last_name,oname:other_name,gender,_id:id,sbjs,pwd:password,createdAt:{"$$date":1756885851668},updatedAt:{"$$date":now}}) + "\n";
        }
    });
    pre.innerText += students;
});
document.body.appendChild(myBtn);

/*
recruitment HACK/
chooseConfig(8);
console.time('getDocs')
const snap = await getDocs(query(collection(db, 'students'), where('offered.ICT', '==', 'Computer Studies (sec)')));
// ids = ids.filter(f => f !== false);
console.timeEnd('getDocs');
console.log(snap.docs.length)
if(snap.docs.length){
    console.time('updateDocs');
    // for (const d of Object.values(snap.docs)){
    // await setDoc(doc(db, 'session', '2025', 'students',x.id),x.data(),{merge: true});
    const prom = Object.values(snap.docs).map(async d => {
        await setDoc(doc(db, 'session', '2025', 'students', d.id),d.data(), {merge:true})
    });
    await Promise.allSettled(prom);
    console.timeEnd('updateDocs');
}
// let ids = [];
// const snapshot = snap.docs.forEach((d,x) => {
//     Object.values(d.data().offered)[0] == 'Igbo' ? ids.push(d.id) : false;
// });
// if(ids.length){
//     for await (const id of ids){
//         await updateDoc(doc(db, 'students', id),{
//             offered: {IGB: 'Igbo Language'}
//         })
//     }
//     console.log('done')
// }
*/
/*
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
        // let numb = idx === 2 ? parseInt(e.target.value) : null;
        // if (Number.isInteger(numb)) {
            if (scores && arr.every(mbr => mbr.value !== '')) {
                aside2.classList.toggle('on', true);
                //extract and display names
                subject = arr[0].value, term = Number(arr[1].value);
                data = [];  //reset data
                for (let i = 0; i < students.length; i++) {
                    let abbrArray = scores[i]?.[subject]?.[term];
                    // if (!abbrArray || abbrArray.every(el => el >= 4 || el === null)) continue;
                    // let element = abbrArray.map(v => v < 4 ? null : v)
                    if (!abbrArray || abbrArray.every(el => el !== 0)) continue;
                    let element = abbrArray.map(v => v === 0 ? null : v)
                    data.push([students[i].id, students[i].name, element]);
                    // if (!abbrArray) continue;
                    // abbrArray.splice(-2, 2, null, null);
                    // data.push([students[i].id, students[i].name, abbrArray]);
                }
                document.querySelector('.ahd > strong').innerHTML = data.length;
                //populate ol list
                mylist.innerHTML = '';
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
        // }
    });
});
//form listener to submit null for zeros
const loader = document.querySelector('.loader');
forms[1].addEventListener('submit', async (e) => {
    e.preventDefault();
    // console.log(data);

    e.submitter.disabled = true;
    if (loader.className.includes('opq')) loader.classList.remove('opq');
    let progress = 0;
    progress += 30;
    loader.style.width = progress + '%';

    if (data.length) {
        try {
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
*/
import { initializeApp, deleteApp } from "firebase/app";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, doc, getDoc, query, where, updateDoc, getDocs, setDoc, deleteField, runTransaction } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

//declare all const and var
const classArray = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"];

// initialize firebase app
var app = initializeApp(configs[6]);
// init services
var db = getFirestore(app);
let eot, term;
// calculate session
const MONTH = new Date().getMonth();
const session = MONTH >= 8 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session

const eotRef = doc(db, 'EOT', session);
await getDoc(eotRef).then((res) => eot = res.data());
term = ["First", "Second", "Third"].indexOf(eot.this_term);

function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore();
}
const bodyDiv = document.querySelector('.body div')
const table = document.querySelector('table');
const spanClass = document.querySelector('header span');
const spanArm = document.querySelector('header span:last-child');
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#load-icon').classList.add('running');
});

const tbody = document.querySelector('tbody');
const ss = JSON.parse(sessionStorage.getItem('snapshotId'));
const jnrSubs = {
    AGR: "Agricultural Science",
    BSC: "Basic Science",
    BTEC: "Basic Technology",
    BUS: "Business Studies",
    CCA: "Cultural and Creative Arts",
    CIV: "Civic Education",
    CRS: "Christian Religious Studies",
    ENG: "English Language",
    FRE: "French Language",
    HAU: "Hausa Language",
    HECO: "Home Economics",
    HIS: "History",
    ICT: "Computer Studies",
    IGB: "Igbo Language",
    MTH: "Mathematics",
    MUS: "Music",
    PHE: "Physical and Health Education",
    SOS: "Social Studies",
    YOR: "Yoruba"
};
const snrSubs = {
    ACCT: "Financial Accounting",
    AGR: "Agricultural Science",
    BIO: "Biology",
    CCP: "Catering Craft Practice",
    CHE: "Chemistry",
    CIV: "Civic Education",
    COM: "Commmerce",
    CRS: "Christian Religious Studies",
    ECO: "Economics",
    ENG: "English Language",
    "F&N": "Foods and Nutrition",
    FMAT: "Further Mathematics",
    FRE: "French Language",
    FSH: "Fisheries",
    GEO: "Geography",
    GOV: "Government",
    ICT: "Computer Studies",
    LIT: "Literature-in-English",
    MKT: "Marketing",
    MTH: "Mathematics",
    PHY: "Physics",
    TD: "Technical Drawing",
    TOU: "Tourism",
    VIS: "Visual Arts",
};
const SUBJ = Object.keys(ss.data.masterOfForm)[0].startsWith('JSS') ? jnrSubs : snrSubs;
const master_of_form = Object.entries(ss.data.masterOfForm);

let snapDocs = [];
for (const [k, v] of master_of_form) {
    spanClass.textContent = k;
    spanArm.textContent = v;
    chooseConfig(classArray.indexOf(k))
    const q = query(collection(db, 'session', session, 'students'), where("arm", "==", v));
    const snapDoc = await getDocs(q);
    if (snapDoc.empty) {
        window.alert('This class is empty.');
    } else {
        // snapDoc.docs.sort()
        let sorted = snapDoc.docs.sort((a,b) => a.data().last_name.localeCompare(b.data().last_name));
        sorted.forEach(docData => {
            if (docData.data().admission_no.startsWith('DCA')) {
                snapDocs.push({id: docData.id, dd: docData.data()});
            }
        });
        let scores = [], score = [];
        const prom = snapDocs.map(async ({ id }) => {
            await getDoc(doc(db, 'session', session, 'students', id, 'scores', 'records')).then((res) => {
                if (!res.exists()) return;
                score.push(res.data());
            });
        });
        await Promise.allSettled(prom);
        score.forEach((data, ix) => {
            let st = Object.values(data);
            let ph = 0;
            for (const dt of st) {
                if (!dt?.[term]) continue;
                ph += dt[term].reduce((acc, cur) => acc + cur)
            }
            scores.push((ph/st.length).toFixed());
        });

        document.querySelector("input[type='submit']").style.display = 'initial';
        //provide all scores and student docs for broadsheet
        let all_scores = scores, all_students = Object.values(snapDocs);
        console.log(all_scores.length, all_students.length);

        // sessionStorage.setItem('all_scores', all_scores);
        // sessionStorage.setItem('all_students', all_students);
        
        snapDocs.forEach((sd, ix) => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${ix+1}</td>
                    <td>${sd.dd.last_name +' '+ sd.dd.first_name +' '+ sd.dd.other_name}</td>
                    <td><input type="text" name="${sd.id}" class="${sd.id}" autocomplete="off" placeholder="${sd.dd.admission_no}"/></td>
                    <td>${sd.dd.gender}</td>
                    <td>${sd.dd.email}</td>
                    <td>${sd.dd.password}</td>
                    <td><input type="number" name="${sd.id}" class="${sd.id}" min="0" max="99" pattern="[0-9]{1,2}" placeholder="${sd.dd.days_present?.[term] || 0}"/></td>
                    <td><input type="text" name="${sd.id}" class="${sd.id}" autocomplete="off" placeholder="${sd.dd.comment?.[term] || ''}"/></td>
                    <input type="hidden" value="[${sd.dd.days_present || "0,0,0"}]">
                    <td>${scores[ix]}</td>
                </tr>
            `)
            // i++;
        });
    }
    bodyDiv.style.display = 'none';
    document.querySelector('#load-icon').classList.remove('running');
    table.style.display = 'block';
}
const formRegister = document.forms.formRegister;
formRegister.addEventListener('change', (e) => {
    let inputs = document.getElementsByClassName(e.target.name);
    for (const a of inputs) {
        if (a.value == '') a.value = a.placeholder;
    }
    const hidden = e.target.parentElement.parentElement.children[8];    //children[8] is hidden <input>
    hidden.setAttribute("name", e.target.name);
    if (e.target.type == "number") {
        let x = JSON.parse(hidden.getAttribute("value"));
        x.splice(term, 1, Number(e.target.value));
        // console.log(x);
        hidden.value = JSON.stringify(x);
    }
})
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.opacity = '.5';
    const formData = new FormData(formRegister);
    let inputs = {};
    
    for (const pair of formData.entries()) {
        if (!pair[1]) continue;
        const arr = formData.getAll(pair[0]);
        let dp = Number(arr[1]);
        let data = {
            days_present: JSON.parse(arr[3]),
            comment: {
                [term]: arr[2]
            }
        };
        inputs[pair[0]] = data;
    }
    // console.log(inputs);
    const entries = Object.entries(inputs);
    console.log("Entries:", entries);

    const promises = entries.map(async cb => {
        await setDoc(doc(db, 'session', session, 'students', cb[0]), cb[1], { merge: true });
    })
    await Promise.allSettled(promises);
    // location.reload();

    window.alert("Success!");
    e.submitter.disabled = false;
    e.submitter.style.opacity = '1';
});

//change of subjects
const COSpopWrap = document.querySelector('#sbj_chg>.pop_wrp');
const thead = COSpopWrap.querySelector('.thead');
const popTbody = COSpopWrap.querySelector('.tbody');
const selectAll = COSpopWrap.querySelector('select#all');
//insert thead sbj
let count = 0;
thead.querySelectorAll('i').forEach(i => i.remove());
for(const k in SUBJ){
    thead.insertAdjacentHTML('beforeend', `<i>${k}</i>`);
    count++;
    selectAll.insertAdjacentHTML('beforeend', `<option value="${count}">${count}</option>`);
}
snapDocs.forEach((snp, snx) => {
    const iTags = Object.keys(SUBJ).reduce((a,c) => snp.dd?.record && c in snp.dd?.record ? a + '<i class="i"></i>' : a + '<i></i>' ,'');
    popTbody.insertAdjacentHTML('beforeend', `
        <div class="tr">
            <b>${snx+1}</b>
            <span>${snp.dd.last_name} ${snp.dd.first_name}</span><span>${snp.dd.admission_no}</span>${iTags}
        </div>
    `);
});
let tbodyChildren = [...popTbody.children];
//popTbody handler
popTbody.addEventListener('click', (e) => {
    if(e.target.localName === 'i'){
        e.target.classList.toggle('i');
    }
});
//select#all handler
selectAll.onchange = (e) => {
    tbodyChildren.forEach(chd => chd.querySelectorAll('i')[e.target.selectedIndex-1].classList.add('i'));
}
COSpopWrap.querySelector('input#entire').onchange = (e) => {
    tbodyChildren.forEach(chd => chd.querySelectorAll('i').forEach(i => i.classList.toggle('i', e.target.checked)));
}
//change of subject btn
let CHANGE_OF_SUBJECT = [];
const cosBtn = COSpopWrap.querySelector('button#cos_btn');
cosBtn.addEventListener('click', async (e) => {
    //get term too
    cosBtn.disabled = true;
    COSpopWrap.setAttribute('inert','');

    snapDocs.forEach((snp, snx) => {
        const u = tbodyChildren[snx].querySelectorAll('i');
        const v = Object.keys(SUBJ).filter((ff, fx) => {
            if(snp.dd?.record){
                if(u[fx].className.includes('i') && !(ff in snp.dd?.record)){
                    return ff;
                }
            }else if(u[fx].className.includes('i')){
                return ff;
            }
        });
        if(v.length) {
            let obj = {};
            for(const o of v) obj[o] = {[term]: Array(8).fill(null)}
            CHANGE_OF_SUBJECT.push({[snp.id]: obj});
        }
        // CHANGE_OF_SUBJECT = CHANGE_OF_SUBJECT.
    });
    // console.log(CHANGE_OF_SUBJECT);
    const prom = CHANGE_OF_SUBJECT.map(async obj => {
        await setDoc(doc(db, 'session', session, 'students', Object.keys(obj)[0]), {
            'record':Object.values(obj)[0]
        },{merge:true})
    });
    await Promise.allSettled(prom).then(res => {
        cosBtn.disabled = false;
        COSpopWrap.removeAttribute('inert');
        
        const rejections = [...res].filter(({status}) => status === 'rejected').length;
        console.log('Rejections:', rejections);

        if(rejections > 0){
            notify(`Error saving ${rejections} of ${CHANGE_OF_SUBJECT.length} subjects.`, true);
            return;
        }
        cosBtn.classList.add('saved');
        cosBtn.querySelector('span').innerText = 'SAVED';
        const sid = setTimeout(()=>{
            cosBtn.classList.remove('saved');
            cosBtn.querySelector('span').innerText = 'SAVE';
            clearTimeout(sid);
        }, 5000);
    });
});
const notf = COSpopWrap.querySelector('.notf');
function notify(msg, err=false){
    notf.innerHTML = msg;
    notf.classList.add(err ? 'err' : 'on');
    const id = setTimeout(() => {
        notf.classList.remove(err ? 'err' : 'on');
        clearTimeout(id);
    }, 7000);
}
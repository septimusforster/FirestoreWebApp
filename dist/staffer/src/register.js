import { initializeApp, deleteApp } from "firebase/app";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, doc, getDoc, query, where, updateDoc, getDocs, setDoc } from "firebase/firestore";
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
const session = MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session
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
const master_of_form = Object.entries(ss.data.masterOfForm);
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
        let scores = [], score = [];
        const prom = snapDoc.docs.map(async sd => {
            await getDoc(doc(db, 'session', session, 'students', sd.id, 'scores', 'records')).then((res) => {
                if (!res.exists()) return score.push('0');
                score.push(res.data());
            });
        });
        await Promise.allSettled(prom);

        score.forEach(data => {
            let st = Object.values(data);
            let ph = 0;
            for (const dt of st) {
                ph += dt[term].reduce((acc, cur) => acc + cur)
            }
            scores.push((ph/st.length).toFixed());
        });

        document.querySelector("input[type='submit']").style.display = 'initial';
        //provide all scores and student docs for broadsheet
        let all_scores = scores, all_students = snapDoc;
        sessionStorage.setItem('all_scores', all_scores);
        sessionStorage.setItem('all_students', all_students);
        
        snapDoc.docs.forEach((sd, ix) => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${ix+1}</td>
                    <td>${sd.data().last_name +' '+ sd.data().first_name +' '+ sd.data().other_name}</td>
                    <td><input type="text" name="${sd.id}" class="${sd.id}" autocomplete="off" placeholder="${sd.data().admission_no}"/></td>
                    <td>${sd.data().gender}</td>
                    <td>${sd.data().email}</td>
                    <td>${sd.data().password}</td>
                    <td><input type="number" name="${sd.id}" class="${sd.id}" min="0" max="99" pattern="[0-9]{1,2}" placeholder="${sd.data().days_present?.[term] || 0}"/></td>
                    <td><input type="text" name="${sd.id}" class="${sd.id}" autocomplete="off" placeholder="${sd.data().comment?.[term] || ''}"/></td>
                    <input type="hidden" value="[${sd.data().days_present || "0,0,0"}]">
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
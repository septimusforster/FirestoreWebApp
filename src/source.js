import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import  configs from "./JSON/configurations.json" assert {type: 'json'};

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

let clsIndex, armIndex, subIndex;
const armDatalist = document.querySelector('datalist#arm');
const subDatalist = document.querySelector('datalist#subject');

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
    if (e.target.name === 'class') {
        clsIndex = configs[7].indexOf(e.target.value);
        chooseConfig(clsIndex);
    } else if (e.target.name === 'arm') {
        armIndex = Number(armDatalist.options.namedItem(e.target.value).dataset.id);
    } else if (e.target.name === 'subject') {
        subIndex = Number(subDatalist.options.namedItem(e.target.value).dataset.id);
    }
})
const tbody = document.querySelector('tbody');
subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // const formData = new FormData(subjectForm);
    const cls = subjectForm.class.value;
    const arm = subjectForm.arm.value;
    const sub = subjectForm.subject.value;

    // fetch student IDs and concatenation of the their names
    const q = query(collection(db, "students"), where("arm", "==", arm), orderBy("last_name"));
    const personDoc = await getDocs(q);
    if (personDoc.empty) return window.alert("No dice!")
    let pha = []; //PlaceHolder Array
    // personDoc.forEach(doc => {
    //     let n = `${doc.data().last_name} ${doc.data().first_name} ${doc.data().other_name}`;
    //     pha = [...[doc.id, n]];
    // })
    const kvArray = personDoc.docs.map(doc => ([doc.data().id, `${doc.data().last_name} ${doc.data().first_name} ${doc.data().other_name}`]))
    // store pha in session storage
    sessionStorage.setItem([clsIndex.toString() + armIndex], JSON.stringify(kvArray))
    // sessionStorage.setItem('myStudent', JSON.stringify(pha))
    // get scores
    let scores = [];
    const promises = kvArray.map(async arrVal => {
        await getDoc(doc(db, "scores", arrVal[0])).then((doc) => {
            if (doc.exists) {
                scores.push(doc.data());
            }
        });
    })
    await Promise.all(promises);
    // console.log('scores', scores.length);
    // clear tbody for new arrivals
    tbody.innerHTML = '';
    // create scoresheet of names and scores
    kvArray.forEach(([id, nm], ind) => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${ind+1}</td>
                <td>${nm}</td>
                <td><input type="text" name="${id}" pattern="[0-9]" placeholder="${scores[ind]?.[sub][0]}" autocomplete="off"/></td>
                <td><input type="text" name="${id}" pattern="[0-9]" placeholder="${scores[ind]?.[sub][1]}" autocomplete="off"/></td>
                <td><input type="text" name="${id}" pattern="[0-9]" placeholder="${scores[ind]?.[sub][2]}" autocomplete="off"/></td>
                <td><input type="text" name="${id}" pattern="[0-9]" placeholder="${scores[ind]?.[sub][3]}" autocomplete="off"/></td>
            </tr>
        `)
    })
    // sessionStorage.setItem('scores', JSON.stringify(scores))

    document.querySelector('.sub__title').textContent = `${sub} ~ ${cls} ~ ${arm}`;
    // console.log(subjectForm.rd.checked)
})
import { initializeApp, deleteApp } from "firebase/app";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, doc, addDoc, getDoc, deleteDoc, query, where, onSnapshot, updateDoc, arrayUnion, getDocFromServer, arrayRemove, getDocs } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};



//declare all const and var
const classArray = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"];

// initialize firebase app
var app = initializeApp(configs[0]);
// init services
var db;

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
})

const tbody = document.querySelector('tbody');
const ss = JSON.parse(sessionStorage.getItem('snapshotId'));
const master_of_form = Object.entries(ss.data.masterOfForm);
for (const [k, v] of master_of_form) {
    spanClass.textContent = k;
    spanArm.textContent = v;
    chooseConfig(classArray.indexOf(k))
    const q = query(collection(db, "students"), where("arm", "==", v));
    const snapDoc = await getDocs(q);
    if (snapDoc.empty) {
        window.alert('This class is empty.');
    } else {
        let i = 1;
        snapDoc.forEach((doc) => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${i}</td>
                    <td>${doc.data().last_name +' '+ doc.data().first_name +' '+ doc.data().other_name}</td>
                    <td><input type="text" name="${doc.id}" class="${doc.id}" autocomplete="off" placeholder="${doc.data().admission_no}"/></td>
                    <td>${doc.data().gender}</td>
                    <td>${doc.data().email}</td>
                    <td>${doc.data().password}</td>
                    <td><input type="number" name="${doc.id}" class="${doc.id}" min="0" max="99" pattern="[0-9]{1,2}" placeholder="${doc.data().days_present || 0}"/></td>
                    <td><input type="text" name="${doc.id}" class="${doc.id}" autocomplete="off" placeholder="${doc.data().comment || ''}"/></td>
                </tr>
            `)
            i++;
        })
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
})
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.opacity = '.5';
    const formData = new FormData(formRegister);
    let inputs = {};
    
    for (const pair of formData.entries()) {
        if (!pair[1]) continue;
        inputs[pair[0]] = formData.getAll(pair[0]);
    }
    const entries = Object.entries(inputs);
    // console.log("Entries:", entries);
    
    const promises = entries.map(async cb => {
        await updateDoc(doc(db, "students", cb[0]), {
            admission_no: cb[1][0],
            days_present: Number(cb[1][1]),
            comment: cb[1][2],
        })
    })
    await Promise.allSettled(promises);
    location.reload();
    /*
    window.alert("Success!");
    e.submitter.disabled = false;
    e.submitter.style.opacity = '1';
    */
})
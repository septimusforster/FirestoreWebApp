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
        console.log('snapdoc is empty')
    } else {
        let i = 1;
        snapDoc.forEach((doc) => {
            tbody.insertAdjacentHTML('beforeend', `
                <tr>
                    <td>${i}</td>
                    <td>${doc.data().last_name +' '+ doc.data().first_name +' '+ doc.data().other_name}</td>
                    <td>${doc.data().admission_no}</td>
                    <td>${doc.data().gender}</td>
                    <td>${doc.data().email}</td>
                    <td>${doc.data().password}</td>
                    <td><input type="number" name="dp" min="0" max="99" pattern="[0-9]{1,2}"/></td>
                    <td><input type="text" name="comm" id="${doc.id}"/></td>
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
formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formRegister);
    const dp = formData.getAll('dp');
    const comm = formData.getAll('comm');

    console.log(dp)
    console.log(comm)
})
import { initializeApp, deleteApp } from "firebase/app";
import {
    getFirestore, arrayUnion, arrayRemove, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, deleteField, doc, query, where, limit, updateDoc
} from "firebase/firestore";
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

// initial firebase app
var app = initializeApp(configs[6])
var db;

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}

db = getFirestore()

// declare refs
const jnrRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
const snrRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");

const subDatalist = document.querySelector('datalist#subject');

if (sessionStorage.getItem("subs") === null) {
    await getDoc(jnrRef)
    .then( async doc => {
        let docSnap = doc.data();
        await getDoc(snrRef)
        .then(docb => {
            docSnap = { ...docSnap, ...docb.data()}
            sessionStorage.setItem('subs', JSON.stringify(docSnap))
            loadSubs();
            console.log('From server')
        })
    })
} else {
    // load subjects
    loadSubs();
}
function loadSubs() {
    const subArray = Object.entries(JSON.parse(sessionStorage.getItem('subs')));
    subArray.forEach(e => {
        subDatalist.insertAdjacentHTML('beforeend', `<option value='${e[0]}'>${e[1]}</option>`)
    })
}


const submitBtn = document.querySelector("button[type='submit']");
// submitBtn.addEventListener('click', (e) => {

// })

let pdfFormVar;
const pdfForm = document.forms.pdfForm;
pdfForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(pdfForm);
    pdfFormVar = Array.from(formData.values())
})

const quizForm = document.forms.quizForm;
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(quizForm);
   console.log(Array.from(formData.values()))
})

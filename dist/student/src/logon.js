import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, and, or } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

// initial firebase app
var app = initializeApp(configs[0])
var db, JSSubjectRef, SSSubjectRef;

const selectElt = document.querySelector('select#classroom');
selectElt.addEventListener('change', (e) => {
    deleteApp(app);
    let optIndex = e.target.selectedIndex - 1;
    app = initializeApp(configs[optIndex]);
    // init services
    db = getFirestore()
    // collection refs
    JSSubjectRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
    SSSubjectRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");
})


const classroom = document.querySelector('#classroom');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const notice = document.querySelector('dialog#notice');
const loginForm = document.forms.login;

// document.forms.login.removeAttribute('data-disabled')

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disable = true;
    e.submitter.style.cursor = 'not-allowed';
    const classroomCollectionRef = collection(db, classroom.value);
    const q = query(classroomCollectionRef, and(or(where("email", "==", email.value), where("admission_no", "==", email.value)), where("password", "==", password.value)))
    const querySnapshot = await getDocs(q);
    // console.log(querySnapshot);
    if(querySnapshot.empty) {
        notice.querySelector('output').textContent = "The username/password is incorrect.";
        notice.classList.add('active');
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    } else {
        querySnapshot.docs.forEach(async doc => {
            // let ue = doc.data().upload_enabled;
            let photo_src = doc.data().photo_src;
            let offered = doc.data().offered;
            let snapshot = {
                'id': doc.id,
                'first_name': doc.data().first_name,
                'last_name': doc.data().last_name,
                'other_name': doc.data().other_name,
                'gender': doc.data().gender,
                'admission_no': doc.data().admission_no,
                'arm': doc.data().arm,
                'class': classroom.value,
                'em': doc.data().email || doc.data().admission_no,
                'pwd': doc.data().password,
                photo_src,
                offered,
            }
            if(photo_src && offered) {
                sessionStorage.setItem('snapshot', JSON.stringify(snapshot));
                return location.href = '../dist/index.html';
            } else if (offered) {
                sessionStorage.setItem('snapshot', JSON.stringify(snapshot));
                return location.href = '../dist/temp.html?of=1&ps=0';
            } else if (photo_src) {
                const reservedSnapshot = classroom.value.startsWith('JSS') ? await getDoc(JSSubjectRef) : await getDoc(SSSubjectRef);
                snapshot = {...snapshot, 'reservedPayload': reservedSnapshot.data().js_sub || reservedSnapshot.data().ss_sub,}
                sessionStorage.setItem('snapshot', JSON.stringify(snapshot));
                return location.href = '../dist/temp.html?of=0&ps=1';
            } else {
                const reservedSnapshot = classroom.value.startsWith('JSS') ? await getDoc(JSSubjectRef) : await getDoc(SSSubjectRef);
                snapshot = {...snapshot, 'reservedPayload': reservedSnapshot.data().js_sub || reservedSnapshot.data().ss_sub,}
                sessionStorage.setItem('snapshot', JSON.stringify(snapshot));
                return location.href = '../dist/temp.html';
            }
        });
    }
})

/*
const mainRef = collection(db, "fileCollection");
addDoc(collection(mainRef, "AGR", "JSS 1"),{
*/

// const mainRef = collection(db, "demo");
// addDoc(collection(mainRef, "AGR", "subjectId"),{
//     name: 'Konan Perry',
//     type: 'Note'
// })
// .then(() => {
//     console.log("Sent.")
// })

/*
const note = query(collectionGroup(db, "subjectId"), where("type", "==", "Note"));
const querySnapshot1 = await getDocs(note);
querySnapshot1.docChanges().forEach((change) => {
    if(change.type === "added") {
        console.log("Document added.")
    }
    if (change.type === "modified") {
        console.log("Document modified.")
    }
    if (change.type === "removed") {
        console.log("Document removed.")
    } else {
        console.log("No document has changed since.")
    }
    console.log(change);
})
*/

// querySnapshot1.forEach((doc) => {
//     console.log(doc.id)
// })
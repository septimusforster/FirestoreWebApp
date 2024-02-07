import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, and, or } from "firebase/firestore";

const firebaseConfig = {    
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
/*
const firebaseConfig = {
    apiKey: "AIzaSyCT92x3HE8nUsYsKgQ2eJZU7DHQ83mTgwE",
    authDomain: "dca-mobile-26810.firebaseapp.com",
    projectId: "dca-mobile-26810",
    storageBucket: "dca-mobile-26810.appspot.com",
    messagingSenderId: "843119620986",
    appId: "1:843119620986:web:e1a4f469626cbd4f241cc3"
};
*/
// initialize firebase app
initializeApp(firebaseConfig)
// init services
const db = getFirestore()
// collection refs
const JSSubjectRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
const SSSubjectRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");


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
            let ue = doc.data().upload_enabled;
            if(ue === 2) {
                let snapshot = {
                    'snapshotId': doc.id,
                    'first_name': doc.data().first_name,
                    'last_name': doc.data().last_name,
                    'other_name': doc.data().other_name,
                    'gender': doc.data().gender,
                    'admission_no': doc.data().admission_no,
                    'arm': doc.data().arm,
                    'class': classroom.value,
                    'em': doc.data().email || doc.data().admission_no,
                    'pwd': doc.data().password,
                    ue,
                }
                sessionStorage.setItem('snapshot', JSON.stringify(snapshot));
                return location.href = '../dist/index.html';
            } else {
                const reservedSnapshot = classroom.value.startsWith('JSS') ? await getDoc(JSSubjectRef) : await getDoc(SSSubjectRef);
                let snapshot = {
                    'id': doc.id,
                    'class': classroom.value,
                    'reservedPayload': reservedSnapshot.data().js_sub || reservedSnapshot.data().ss_sub,
                }
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
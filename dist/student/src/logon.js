import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, query, where, and, or } from "firebase/firestore";
const firebaseConfig = {    
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
// initialize firebase app
initializeApp(firebaseConfig)
// init services
const db = getFirestore()
// collection refs

const classroom = document.querySelector('#classroom');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const loginForm = document.forms.login;
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.warn('Messaging in-coming...');
    const classroomCollectionRef = collection(db, classroom.value);
    const q = query(classroomCollectionRef, and(or(where("email", "==", email.value), where("admission_no", "==", email.value)), where("password", "==", password.value)))
    const querySnapshot = await getDocs(q);
    // console.log(querySnapshot);
    if(querySnapshot.empty) {
        // dialogNotice.querySelector('output').innerHTML = "The username/password is incorrect.";
        // dialogNotice.showModal();
        // e.submitter.disabled = false;
        // e.submitter.style.cursor = 'pointer';
        console.log('snapshotId does not exist.');
    } else {
        querySnapshot.docs.forEach(doc => console.log('snapshotId', doc.id));
        // querySnapshot.docs.forEach(doc => sessionStorage.setItem('snapshotId', doc.id));
        // location.href = 'index.html';
    }
})
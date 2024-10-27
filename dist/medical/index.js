import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";  //"firebase/app";
import { getFirestore, collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or, serverTimestamp, orderBy, limit, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";   //"firebase/firestore";
// import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

const cfg = {
    apiKey: "AIzaSyCnGk02gQeUZ9nJeOBxHMk3jlC2_pG_jZo",
    authDomain: "flutterspace-d2385.firebaseapp.com",
    projectId: "flutterspace-d2385",
    storageBucket: "flutterspace-d2385.appspot.com",
    messagingSenderId: "979544012314",
    appId: "1:979544012314:web:c2eef86fccbae61f17c3a3",
    measurementId: "G-5E3NVV96HY"
};

var app = initializeApp(cfg);
var db = getFirestore(app);

const notice = document.querySelector('.notice');
//form submission
document.forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.classList.add('clk');

    const fd = new FormData(e.target);
    const q = query(collection(db, 'staff'), and(where('uname', '==', fd.get('uname')), where('upass', '==', fd.get('upass'))));
    const snapdocs = await getDocs(q);
    if (snapdocs.empty) {
        notice.textContent = 'Error logging in.';
        e.submitter.parentElement.classList.add('err');
        const id = setTimeout(() => {
            e.submitter.parentElement.classList.remove('err');
            e.submitter.classList.remove('clk');
            e.submitter.disabled = false;
        }, 3000);
    } else {
        sessionStorage.setItem('data', JSON.stringify(snapdocs.docs[0].data()));
        location.assign('public/home.html');
    }
});

//for sign up
    /*
    let data = {
        user: 'Nurse Ladi',
        createdAt: Date.now(),
        lastModified: serverTimestamp()
    }
    for (const [k, v] of fd.entries()) {
        data[k] = v;
    }
    await addDoc(collection(db, 'staff'), data);
    notice.textContent = 'User created successfully.';
    const id = setTimeout(() => {
        document.forms[0].reset();
        e.submitter.disabled = false;
        e.submitter.classList.remove('clk');
        e.submitter.parentElement.classList.remove('err');
    }, 3000);
    e.submitter.parentElement.classList.add('err');
    */
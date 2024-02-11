import { initializeApp } from "firebase/app"
import {
    getFirestore, collection, getDoc, setDoc, addDoc, deleteDoc, deleteField, doc, query, where, limit, updateDoc
} from "firebase/firestore"

const firebaseConfig = {
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46",
    // appId: "1:158660765747:web:77fed76bf03f32d97ddb46"
};

// initialize firebase app
initializeApp(firebaseConfig)
// init services
const db = getFirestore()
// collection ref
const jnrRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
const snrRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");

// const JSSubjectRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
// const armRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");
let i;
//Loop twice and store docs in sessionStorage
for(i = 0; i < 2; i++) {
    switch (i) {
        case 0:
            if(sessionStorage.hasOwnProperty('jnr_sub')) {
                continue;
            }
            await getDoc(jnrRef).then(doc => sessionStorage.setItem('jnr_sub', JSON.stringify(doc.data())))
            console.log('From server')
            break;
        case 1:
            if(sessionStorage.hasOwnProperty('snr_sub')) {
                continue;
            }
            await getDoc(snrRef).then(doc => sessionStorage.setItem('snr_sub', JSON.stringify(doc.data())))
            console.log('From server')
            break;/*
        case 3:
            const armSnap = await getDoc(armRef);
            armSnap.docs.forEach(doc => {
                sessionStorage.setItem('arm', JSON.stringify(doc.data().arm))
            })*/
    }
}
const snrObj = JSON.parse(sessionStorage.getItem('snr_sub'));
const jnrObj = JSON.parse(sessionStorage.getItem('jnr_sub'));

const uls = document.querySelectorAll('.aside__content ul');
const viewChanges = document.querySelector('#view-changes');

let jnrArray = Object.values(jnrObj);
let snrArray = Object.values(snrObj);
viewChanges.addEventListener('click', (e) => {
    sessionStorage.removeItem('jnr_sub')
    sessionStorage.removeItem('snr_sub')
    location.reload();
})

jnrArray.forEach((sub, i) => {
    uls[0].insertAdjacentHTML('beforeend', `<li>${i + 1 + " - " + sub}</li>`)
})
snrArray.forEach((sub, i) => {
    uls[1].insertAdjacentHTML('beforeend', `<li>${i + 1 + " - " + sub}</li>`)
})


const juniorForm = document.forms.juniorForm;
juniorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    let obj = new Object();
    if (e.submitter.id === 'submit') {
        const formData = new FormData(juniorForm);
        let abbr = formData.getAll('abbr');
        let txt = formData.getAll('txt');
    
        abbr.forEach((a, i) => obj[a.toUpperCase()] = txt[i]);
        await setDoc(jnrRef, obj, {merge: true})
        window.alert('Subject upload successful');
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    } else {
        const formData = new FormData(juniorForm);
        let abbr = formData.getAll('abbr');

        abbr.forEach((a) => obj[a.toUpperCase()] = deleteField())
        await updateDoc(jnrRef, obj)
        window.alert('Subject delete successful');
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    }  
})

const seniorForm = document.forms.seniorForm;
seniorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    let obj = new Object();
    if (e.submitter.id === 'submit') {
        const formData = new FormData(seniorForm);
        let abbr = formData.getAll('abbr');
        let txt = formData.getAll('txt');
    
        abbr.forEach((a, i) => obj[a.toUpperCase()] = txt[i]);
        await setDoc(snrRef, obj, {merge: true})
        window.alert('Subject upload successful');
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    } else {
        const formData = new FormData(seniorForm);
        let abbr = formData.getAll('abbr');

        abbr.forEach((a) => obj[a.toUpperCase()] = deleteField())
        await updateDoc(snrRef, obj)
        window.alert('Subject delete successful');
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    }
})

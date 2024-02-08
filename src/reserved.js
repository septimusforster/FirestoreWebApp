import { initializeApp } from "firebase/app"
import {
    getFirestore, collection, getDoc, addDoc, deleteDoc, doc, query, where, limit
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
const JSSubjectRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
const SSSubjectRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");
// const armRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");
let i;
//Loop twice and store docs in sessionStorage
for(i = 0; i < 2; i++) {
    switch (i) {
        case 0:
            if(sessionStorage.hasOwnProperty('jnr_sub')) {
                continue;
            }
            await getDoc(JSSubjectRef).then(doc => sessionStorage.setItem('jnr_sub', JSON.stringify(doc.data().js_sub)))
            console.log('From server')
            break;
        case 1:
            if(sessionStorage.hasOwnProperty('snr_sub')) {
                continue;
            }
            await getDoc(SSSubjectRef).then(doc => sessionStorage.setItem('snr_sub', JSON.stringify(doc.data().ss_sub)))
            console.log('From server')
            break;/*
        case 3:
            const armSnap = await getDoc(armRef);
            armSnap.docs.forEach(doc => {
                sessionStorage.setItem('arm', JSON.stringify(doc.data().arm))
            })*/
    }
}
const snrArray = JSON.parse(sessionStorage.getItem('snr_sub')).sort();
const jnrArray = JSON.parse(sessionStorage.getItem('jnr_sub')).sort();

const uls = document.querySelectorAll('.aside__content ul');

jnrArray.forEach((sub, i) => {
    uls[0].insertAdjacentHTML('beforeend', `<li>${i + 1 + " - " + sub}</li>`)
})
snrArray.forEach((sub, i) => {
    uls[1].insertAdjacentHTML('beforeend', `<li>${i + 1 + " - " + sub}</li>`)
})

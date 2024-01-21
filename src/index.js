import { initializeApp } from "firebase/app"
import {
    getFirestore, collection, getDocs, addDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp
} from "firebase/firestore"
import pk from "../src/JSON/upass.json" assert {type: 'json'};
// let j1k, j2k, j3k, s1k;/*, s2k, s3k;*/
const {j1, j2, j3, s1, s2, s3, demo} = pk;
let classrooms = {
    "JSS 1": j1,
    "JSS 2": j2,
    "JSS 3": j3,
    "SSS 1": s1,
    "SSS 2": s2,
    "SSS 3": s3,
    "demo": demo
}
const firebaseConfig = {
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
var myIframe = document.getElementById('myIframe');
// initialize firebase app
initializeApp(firebaseConfig)

// init services
const db = getFirestore()

// collection ref
var colRef = '';
const hiddenElems = document.querySelectorAll("input[type='hidden'");
function setIframeAttr(para1) {
    //there are two hidden elems: the second one holds upass value
    myIframe.setAttribute('data-class-arm', para1);
    hiddenElems[0].value = para1;
    //queries
    const q = query(colRef, where("arm", "==", myIframe.getAttribute('data-class-arm')), orderBy("first_name"))
    // a.classList.toggle
    onSnapshot(q, (snapshot) => {
        if (!snapshot.docs) {
            console.log("Snapshot empty.");
            return
        }
        const students = [];
        snapshot.docs.forEach((doc) => {
            students.push({ ...doc.data(), id: doc.id })
        })
        //clear <ol> list
        myIframe.contentDocument.querySelector('ol').innerHTML = '';
        students.forEach(student => {
            myIframe.contentDocument.querySelector('ol').insertAdjacentHTML('beforeend',`
                <div>
                    <li onclick="deleteStudent('${student.id}',this.firstElementChild.textContent)">
                        <span>${student.first_name} ${student.last_name} ${student.other_name}</span>
                    </li>
                </div>
            `);
        })
    })
}
const leftNavAnchors = document.querySelectorAll('.left-nav a');
leftNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        anchors.forEach((link) => link.classList.remove('active-left-nav'))
        a.classList.add('active-left-nav');
        setIframeAttr(e.target.textContent);
    })
})
var numInClass = 0;
function setColRef(para1="JSS 1") {
    let data = [];
    colRef = collection(db, para1);
    //get and count documents in chosen collection
    getDocs(colRef)
        .then((snapshot) => {
            numInClass = snapshot.size;
            // console.log(numInClass, ": this is numInClass.")
            snapshot.docs.forEach(doc => {
                data.push(doc.data().email)
            })
            for (const k of classrooms[para1]) {
                if(!data.includes(k)) {
                    hiddenElems[1].value = k;
                    return;
                }
            }
        })
};
const topNavAnchors = document.querySelectorAll('.top-nav a');
topNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        document.querySelector('.dropdown-menu').style.pointerEvents='none';
        myIframe.contentDocument.querySelector('ol').innerHTML = '';
        myIframe.contentDocument.querySelector('h3').textContent = e.target.textContent;
        setColRef(e.target.textContent);
    })
})
setColRef();
const fm_createStudent = document.forms.createStudent;
fm_createStudent.addEventListener('submit', (e) => {
    e.preventDefault();    
    let i, studentDoc = {}; 
    for(i = 0; i < e.target.length - 1; i++){
        studentDoc[e.srcElement[i].name] = e.srcElement[i].value;
    }
    addDoc(colRef, {...studentDoc, createdAt: serverTimestamp()})
    .then(() => {
        numInClass++;
        // console.log('numberinclass: ', numInClass);
        fm_createStudent.reset()
        hiddenElems[1].value = classrooms[myIframe.contentDocument.querySelector('h3').textContent][numInClass];
    })
})
//delete doc
const yesBtn = document.querySelector('dialog button');
const msgDialog = document.querySelectorAll('dialog');
yesBtn.onclick = function() {
    msgDialog[0].close();
    let col = myIframe.contentDocument.querySelector('h3').textContent;
    const docRef = doc(db, col, yesBtn.value);
    deleteDoc(docRef)
        .then(() => {
            msgDialog[1].querySelector('p').textContent = "Deletion Complete.";
            msgDialog[1].showModal();
        })
}
/*
//code to resolve
document.querySelector('#myIframe').contentDocument.querySelector('ol li:first-child span').id
document.querySelector('#myIframe').contentDocument.querySelector('ol li:nth-of-type(1) span').id
*/
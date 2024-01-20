import { initializeApp } from "firebase/app"
import {
    getFirestore, collection, getDocs, addDoc, onSnapshot, query, where, orderBy, serverTimestamp
} from "firebase/firestore"
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
// var colRef = collection(db, "JSS 1")
var colRef = '';
// get collection data
// getDocs(colRef)
//   .then((snapshot) => {
//     snapshot.docs.forEach((doc) => {
//         students.push({ ...doc.data(), id: doc.id })
//     })
//     students.forEach(student => {
//         ol.insertAdjacentHTML('beforeend',`<li>${student.name.first} ${student.name.last} ${student.name.others}</li>`)
//     })
//   })
//   .catch(err => {
//     console.log(err.message)
//   })
function setIframeAttr(para1) {
    const hiddenElems = document.querySelectorAll("input[type='hidden'");
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
            myIframe.contentDocument.querySelector('ol').insertAdjacentHTML('beforeend',`<li>${student.first_name} ${student.last_name} ${student.other_name}</li>`);
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
function setColRef(para1="JSS 1") {
    colRef = collection(db, para1);
};
const topNavAnchors = document.querySelectorAll('.top-nav a');
topNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        myIframe.contentDocument.querySelector('ol').innerHTML = '';
        myIframe.contentDocument.querySelector('h3').textContent = e.target.textContent;
        setColRef(e.target.textContent);
        document.querySelector('.dropdown-menu').style.pointerEvents='none';
    })
})
setColRef("JSS 1");
const fm_createStudent = document.forms.createStudent;
fm_createStudent.addEventListener('submit', (e) => {
    e.preventDefault();    
    let i, studentDoc = {}; 
    for(i = 0; i < e.target.length - 1; i++){
        studentDoc[e.srcElement[i].name] = e.srcElement[i].value;
    }
    addDoc(colRef, {...studentDoc, createdAt: serverTimestamp()})
    .then(() => {
        fm_createStudent.reset()
    })
})


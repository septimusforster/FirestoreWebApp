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
const colRef = collection(db, "JSS 1")

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
    myIframe.setAttribute('data-class-arm', para1);
    //queries
    
    const q = query(colRef, where("arm", "==", myIframe.getAttribute('data-class-arm')), orderBy("first_name"))
    // a.classList.toggle
    onSnapshot(q, (snapshot) => {
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
        // anchors.forEach(() => a.classList.remove('active-left-nav'))
        setIframeAttr(e.target.textContent);
    })
})
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


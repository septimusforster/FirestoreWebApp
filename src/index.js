import { initializeApp } from "firebase/app"
import {
    getFirestore, collection, getDoc, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp
} from "firebase/firestore"
import pk from "../src/JSON/upass.json" assert {type: 'json'};
// let j1k, j2k, j3k, s1k;/*, s2k, s3k;*/
const {j1, j2, j3, s1, s2, s3, demo} = pk;
let classrooms = {"JSS 1": j1,"JSS 2": j2,"JSS 3": j3,"SSS 1": s1,"SSS 2": s2,"SSS 3": s3,"demo": demo}
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
                data.push(doc.data().password)
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
        let col = myIframe.contentDocument.querySelector('h3').textContent;
        // numInClass++;
        fm_createStudent.reset()
        setColRef(col)
        document.querySelector('.side-panel').scroll({top:0,left:0,behavior:"smooth"});
        // hiddenElems[1].value = classrooms[myIframe.contentDocument.querySelector('h3').textContent][numInClass];
    })
})
//edit doc
const sidePanelBtns = document.querySelectorAll('.side-panel-toggle');
sidePanelBtns[2].addEventListener('click', (e) => {
    fields = {};
        const getSingleDoc = async (collectionName, documentId) => {
            try {
                const docRef = doc(db, collectionName, documentId);
                const docSnapshot = await getDoc(docRef);
        
                if (docSnapshot.exists()) {
                    const documentData = docSnapshot.data();
                    return documentData;
                } else {
                    console.log(`Document with ID ${documentId} does not exist in collection ${collectionName}.`);
                    return null;
                }
            } catch (error) {
                console.error("Error getting document:", error);
                return null;
            }
        };
        const collectionName = myIframe.contentDocument.querySelector('h3').textContent;
        const documentId = sidePanelBtns[2].value;
        getSingleDoc(collectionName, documentId)
            .then((documentData) => {
                if (documentData) {
                    document.querySelectorAll('dialog')[2].innerHTML += document.forms.createStudent.outerHTML;
                    var inputElems = document.querySelectorAll('dialog')[2].querySelectorAll(".input-group input");
                    for( var i of inputElems ){
                        if(i.type == 'submit') continue;
                        i.value = documentData[i.name];
                    }
                    if(documentData.gender == "M") {
                        document.querySelectorAll('dialog')[2].querySelector("select").selectedIndex = 0;
                    } else {
                        document.querySelectorAll('dialog')[2].querySelector("select").selectedIndex = 1
                    }
                    document.querySelectorAll('dialog')[2].querySelectorAll("input[type='hidden']")[1].value = documentData.password;
                    document.forms.createStudent.querySelector('textarea').value = documentData.home_address;
                    document.querySelectorAll('dialog')[2].lastElementChild.querySelector("input[type='submit']").value = 'Submit';
                    collectDataForUpdate();
                } else {
                    console.log("Document not found.");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
            const dlog = document.querySelectorAll('dialog')[2];
            dlog.showModal();
});
var fields = {};
function collectDataForUpdate() {
    document.querySelectorAll('dialog')[2].querySelector('form').addEventListener('change', (e) => {
        e.preventDefault();
        fields[e.target.name] = e.target.value;
    })
    // const submitBtn = document.querySelectorAll('dialog')[2].querySelector("input[type='submit']");
    document.querySelectorAll('dialog')[2].querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const collectionName = myIframe.contentDocument.querySelector('h3').textContent;
        const documentId = sidePanelBtns[2].value;
        const docRef = doc(db, collectionName, documentId);
        updateDoc(docRef, fields)
            .then(() => {
                window.alert("Update successful.")
                resetEditForm();
            })
    })
}
//clear form after data submission
function resetEditForm() {
    fields = {};
    document.querySelectorAll('dialog')[2].close();
    document.querySelectorAll('dialog')[2].lastElementChild.remove();
}
//delete doc
const yesBtn = document.querySelector('dialog button');
yesBtn.onclick = function() {
    const msgDialog = document.querySelectorAll('dialog');
    msgDialog[0].close();
    let col = myIframe.contentDocument.querySelector('h3').textContent;
    const docRef = doc(db, col, document.querySelectorAll('.side-panel-toggle')[1].value);
    deleteDoc(docRef)
    .then(() => {
        msgDialog[1].querySelector('p').textContent = "Deletion Complete.";
            msgDialog[1].showModal();
            setColRef(col);
        })
}
/*
//code to resolve
document.querySelector('#myIframe').contentDocument.querySelector('ol li:first-child span').id
document.querySelector('#myIframe').contentDocument.querySelector('ol li:nth-of-type(1) span').id
*/
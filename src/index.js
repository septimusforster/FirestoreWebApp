import { initializeApp, deleteApp } from "firebase/app"
import {
    getFirestore, collection, getCountFromServer, getDoc, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp, setDoc, getDocsFromCache
} from "firebase/firestore"
import pk from "../src/JSON/upass.json" assert {type: 'json'};
import  configs from "./JSON/configurations.json" assert {type: 'json'};
// let j1k, j2k, j3k, s1k;/*, s2k, s3k;*/
const {j1, j2, j3, s1, s2, s3, demo} = pk;
let classrooms = {
    "JSS 1": j1.toReversed(),
    "JSS 2": j2.toReversed(),
    "JSS 3": j3.toReversed(),
    "SSS 1": s1.toReversed(),
    "SSS 2": s2.toReversed(),
    "SSS 3": s3.toReversed(),
    "demo": demo.toReversed()
}

var myIframe = document.getElementById('myIframe');
// initialize firebase app
var app = initializeApp(configs[6])
// init services
var db;
db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
// collection ref
var colRef = '';
const armRef = doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu");
// store user ID from url or sessionStorage snapshot
let url = new URL(location.href);
let params = new URLSearchParams(url.search);
let uid = params.get('uid') || JSON.parse(sessionStorage.snapshot).id;
let eotData, term = 0, size = 0;
const eotRef = doc(db, "reserved", "EOT");
await getDoc(eotRef).then(async (res) => { // load EOT
    eotData = res.data();
    term = ["First","Second","Third"].indexOf(eotData.this_term);
});

if(!sessionStorage.hasOwnProperty('arm')) { // Load arms
    await getDoc(armRef).then(doc => sessionStorage.setItem('arm', JSON.stringify(doc.data().arms)));
    console.log('From server')
}
const armArray = JSON.parse(sessionStorage.getItem('arm')).sort();
const leftNav = document.querySelector('.left-nav');
armArray.forEach(arm => {
    leftNav.insertAdjacentHTML('beforeend', `
    <a href="#">${arm}</a>
    `)
}) // EOF
const hiddenElems = document.querySelectorAll("input[type='hidden'");
async function setIframeAttr(para1) {
    //there are two hidden elems: the second one holds upass value
    myIframe.setAttribute('data-class-arm', para1);
    hiddenElems[0].value = para1;
    if (sessionStorage.hasOwnProperty('preview')) sessionStorage.removeItem('preview')
    let data = [], marked = 0;
    console.log(term)
    const q = query(colRef, where("arm", "==", myIframe.getAttribute('data-class-arm')), orderBy("first_name"))
    await getDocs(q).then(docs => {
        docs.docs.forEach(obj => {
            data.push(obj.data())
        });
        data.forEach(({days_present}) => { // extract days_present from docs.data()
            // console.log(days_present)
            days_present?.[term] ? marked++ : false;
        });
        size = marked;
        console.log(marked);
        sessionStorage.setItem('preview', JSON.stringify(data));
        // console.log('Done.')
    })
    myIframe.contentDocument.querySelector('tbody').innerHTML = '';
    data.forEach((student, index) => {
        myIframe.contentDocument.querySelector('tbody').insertAdjacentHTML('beforeend',`
            <tr onclick="deleteStudent('${student.id}',this.children[3].textContent, this)">
                <td>${index + 1}</td>
                <td>${student.id}</td>
                <td>${student.admission_no}</td>
                <td>${student.last_name} ${student.first_name} ${student.other_name}</td>
                <td>${student.password}</td>
            </tr>
        `);
    })
    myIframe.contentDocument.querySelector('table').style.display = 'block';
    // })
}

const leftNavAnchors = document.querySelectorAll('.left-nav a');
leftNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        anchors.forEach((link) => link.classList.remove('active-left-nav'))
        a.classList.add('active-left-nav');
        setIframeAttr(e.target.textContent);
    })
})
async function setColRef(arg) {
    let data = [];
    colRef = collection(db, "students");
    //GET LAST DOCUMENT FROM SERVER
    const q = query(colRef, /*where('password', '==', 'undefined'),*/ orderBy("createdAt", "desc"), limit(1));
    const snapDoc = await getDocs(q);
    if (snapDoc.empty) {
        hiddenElems[1].value = classrooms[arg][0];
    } else {
        snapDoc.docs.forEach(doc => {
            const lastPasswordIndex = classrooms[arg].indexOf(doc.data().password);
            const newPassword = classrooms[arg][lastPasswordIndex - 1];
            hiddenElems[1].value = newPassword;
        })
    }
};
let num;
const topNavAnchors = document.querySelectorAll('.top-nav a');
topNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        document.querySelector('.dropdown-menu').style.pointerEvents='none';
        myIframe.contentDocument.querySelector('.content div:first-child').innerHTML = '';
        myIframe.contentDocument.querySelector('table').style.display = 'none';
        myIframe.contentDocument.querySelector('h3').textContent = e.target.textContent;
        num = Object.keys(classrooms).indexOf(e.target.textContent);
        chooseConfig(num);
        setColRef(e.target.textContent);
    })
})
// setColRef();
const fm_createStudent = document.forms.createStudent;
fm_createStudent.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    let i, studentDoc = {}; 
    for(i = 0; i < e.target.length - 1; i++){
        studentDoc[e.target[i].name] = e.target[i].value;
    }
    addDoc(colRef, {...studentDoc, photo_src: "", createdAt: serverTimestamp()})
    .then(async (data) => {
        const operation = 'Create';
        const action = {
            person: studentDoc.last_name.concat(' ', studentDoc.first_name, ' ', studentDoc.other_name),
            id: data.id,
        }
        let col = myIframe.contentDocument.querySelector('h3').textContent;
        // numInClass++;
        await updateDoc(doc(db, "students", data.id), {id: data.id})
        await logger(operation, action, uid)
        fm_createStudent.reset()
        document.querySelectorAll('dialog')[1].querySelector('.msg'). textContent = "Student Created.";
        document.querySelectorAll('dialog')[1].showModal();
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
        setColRef(col)
        document.querySelector('.side-panel').scroll({top:0,left:0,behavior:"smooth"});
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
        // const collectionName = myIframe.contentDocument.querySelector('h3').textContent;
        const documentId = sidePanelBtns[2].value;
        getSingleDoc("students", documentId)
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
    document.querySelectorAll('dialog')[2].querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const operation = 'Change';
        const collectionName = "students";
        const documentId = sidePanelBtns[2].value;
        const docRef = doc(db, collectionName, documentId);
        updateDoc(docRef, fields)
            .then(async () => {
                await logger(operation, fields, uid)
                window.alert("Update successful.");
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
    const ri = parseInt(document.querySelector('iframe').contentDocument.querySelector('.rowIndex__hidden').textContent);
    const operation = 'destroy';
    const action = document.querySelector('dialog p.msg').textContent;
    const targetID = document.querySelectorAll('.side-panel-toggle')[1].value;
    const msgDialog = document.querySelectorAll('dialog');
    msgDialog[0].close();
    let col = "students";
    const docRef = doc(db, col, targetID);
    deleteDoc(docRef)
    .then( async () => {
        await logger(operation, action, uid);
        msgDialog[1].querySelector('p').textContent = "Deletion Complete.";
            msgDialog[1].showModal();
            document.querySelector('iframe').contentDocument.querySelectorAll('tr')[ri].style.visibility = 'collapse';
            // setColRef(col);
        })
}
async function logger(operation, action, uid) {
    // first init FirebasePro configuration
    chooseConfig(6)
    const logRef = collection(db, "log");
    await addDoc(logRef, {
        operation,
        action,
        uid,
        timestamp: serverTimestamp()
    })
    // re-init class configuration
    chooseConfig(num)
}
const printBtn = document.querySelectorAll('.side-panel-toggle')[3];
printBtn.onclick = async function () {
    const row = Number(myIframe.contentDocument.querySelector('table tr.active td:first-child').textContent);
    const preview = JSON.parse(sessionStorage.getItem('preview'));
    let cls = myIframe.contentDocument.querySelector('h3#students').textContent;
    let arm = preview[row - 1].arm;

    chooseConfig(6);
    let formMaster = "masterOfForm." + cls;
    
    const q = query(collection(db, "staffCollection"), where(formMaster, "==", arm));
    const snapped = await getDocs(q);
    if (snapped.empty) return window.alert("This class has no form master. You can appoint one on the Reserved page.");
    snapped.docs.forEach(snap => {
        formMaster = snap.get('fullName');
        // console.log(snap.id)
    })
    sessionStorage.setItem('student', JSON.stringify({...preview[row - 1], cls, size, formMaster}));
    window.open('result.html', '_blank');
    // location.href = 'result.html#topical';
}
const photoBtn = document.querySelectorAll('.side-panel-toggle')[4];
photoBtn.onclick = function () {
    const preview = JSON.parse(sessionStorage.getItem('preview'));
    let cls = myIframe.contentDocument.querySelector('h3#students').textContent;
    let arm = preview[0].arm;
    location.href = `photos.html?cls=${cls}&arm=${arm}`;
}

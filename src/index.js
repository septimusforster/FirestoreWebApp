import { initializeApp, deleteApp } from "firebase/app"
import {
    getFirestore, collection, getCountFromServer, getDoc, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp
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

if(!sessionStorage.hasOwnProperty('arm')) { // Load arms
    await getDoc(armRef).then(doc => sessionStorage.setItem('arm', JSON.stringify(doc.data().arms)))
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
// const preview = JSON.parse(sessionStorage.getItem('preview'))
async function setIframeAttr(para1) {
    //there are two hidden elems: the second one holds upass value
    myIframe.setAttribute('data-class-arm', para1);
    hiddenElems[0].value = para1;
    if (sessionStorage.hasOwnProperty('preview')) sessionStorage.removeItem('preview')
    let data = [];
    const q = query(colRef, where("arm", "==", myIframe.getAttribute('data-class-arm')), orderBy("first_name"))
    await getDocs(q).then(docs => {
        docs.docs.forEach(obj => {
            data.push(obj.data())
        })
        sessionStorage.setItem('preview', JSON.stringify(data))
        // console.log('Done.')
    })
    myIframe.contentDocument.querySelector('tbody').innerHTML = '';
    data.forEach((student, index) => {
        myIframe.contentDocument.querySelector('tbody').insertAdjacentHTML('beforeend',`
            <tr onclick="deleteStudent('${student.id}',this.lastElementChild.textContent, this)">
                <td>${index + 1}</td>
                <td>${student.admission_no}</td>
                <td>${student.last_name} ${student.first_name} ${student.other_name}</td>
            </tr>
        `);
    })
    myIframe.contentDocument.querySelector('table').style.display = 'block';
    // })
}
/*
function addDataIDB() {
    let idb, armStore, data = [];
    const reqOpen = window.indexedDB.open('SSS 3', 1);
    reqOpen.onupgradeneeded = async (event) => {
        idb = event.target.result;
        if ( !idb.objectStoreNames.contains('Perfection') ) {
            //create arm store if does not exist
            armStore = idb.createObjectStore('Perfection', {keyPath: 'id'})
            const q = query(colRef, where("arm", "==", myIframe.getAttribute('data-class-arm')), orderBy("first_name"), limit(5))
            await getDocs(q).then(docs => {
                //run indexedDB function to add data to IDB
                console.log('metadata from cache?: ', docs.metadata.fromCache)
                docs.forEach(doc => {
                    data.push(doc.data());
                })
            })
        }
    }
    reqOpen.onsuccess = (event) => {
        idb = event.target.result;
        // making a transaction
        let tx = idb.transaction('Perfection', 'readwrite');
        let arm = tx.objectStore('Perfection');
        console.log(data)
        data.forEach(obj => {
            arm.add(obj)
        })
        tx.oncomplete = (event) => {
            console.log('complete tx: ', event)
        }
        tx.onerror = (err) => {
            console.warn('tx:', err)
        }
        // req.onsuccess = (event) => {
        //     console.log('Added successfully.')
        // }
        // req.onerror = (err) => {
        //     console.warn('Failed to add data.')
        // }
    }
    // idb.onerror = (err) => {
    //     console.log('idb error:', err);
    // }
    reqOpen.onerror = (event) => {
        console.error('req error:', event.target.errorCode);
    }
}
function makeTX (armName, mode) {
    let tx = idb.transaction(armName, mode);
    tx.onerror = (err) => {
        console.warn('tx:', err)
    }
    return tx;
}*/
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
    //get and count documents in chosen collection
/*    const snapshot = await getCountFromServer(colRef);
    const numOfDocs = snapshot.data().count;
    // hiddenElems[1].value = classrooms[para1][numOfDocs];
    console.log(numOfDocs) */
        // .then((snapshot) => {
        //     numInClass = snapshot.size;
        //     // console.log(numInClass, ": this is numInClass.")
        //     snapshot.docs.forEach(doc => {
        //         data.push(doc.data().password)
        //     })
            // for (const k of classrooms[para1]) {
            //     if(!data.includes(k)) {
            //         hiddenElems[1].value = k;
            //         return;
            //     }
            // }
        //})
};
const topNavAnchors = document.querySelectorAll('.top-nav a');
topNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        document.querySelector('.dropdown-menu').style.pointerEvents='none';
        myIframe.contentDocument.querySelector('.content div:first-child').innerHTML = '';
        myIframe.contentDocument.querySelector('table').style.display = 'none';
        myIframe.contentDocument.querySelector('h3').textContent = e.target.textContent;
        const num = Object.keys(classrooms).indexOf(e.target.textContent);
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
    .then(() => {
        let col = myIframe.contentDocument.querySelector('h3').textContent;
        // numInClass++;
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
    document.querySelectorAll('dialog')[2].querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const collectionName = myIframe.contentDocument.querySelector('h3').textContent;
        const documentId = sidePanelBtns[2].value;
        const docRef = doc(db, collectionName, documentId);
        updateDoc(docRef, fields)
            .then(() => {
                window.alert("Update successful.")
                resetEditForm();
                //
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
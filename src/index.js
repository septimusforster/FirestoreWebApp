import { initializeApp, deleteApp } from "firebase/app"
import {
    getFirestore, collection, getCountFromServer, getDoc, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp, setDoc, getDocsFromCache,
    writeBatch
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
var db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
const ss = JSON.parse(sessionStorage.snapshot);

let eotData, term = 0, size = 0, toggleState;
// calculate session
const MONTH = new Date().getMonth();
let session = MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session
// var colRef = collection(db, 'session', session, 'students');
let refrs = {
    arm: doc(db, "reserved", "6Za7vGAeWbnkvCIuVNlu"),
    jrSubs: doc(db, "reserved", "2aOQTzkCdD24EX8Yy518"),
    srSubs: doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq")
}
// store user ID from url or sessionStorage snapshot
/*
let url = new URL(location.href);
let params = new URLSearchParams(url.search);
let uid = params.get('uid') || ss.id;
*/
const eotRef = doc(db, 'EOT', session);
const leftNav = document.querySelector('.left-nav');
let menu;
window.addEventListener('click', (e) => {
    if (menu) {
        menu.classList.remove('shw');
        menu = null;
    }
}, true);
await getDoc(eotRef).then(async (res) => { // load EOT
    eotData = res.data();
    term = ["First","Second","Third"].indexOf(eotData.this_term);
    //chk gmode
    const cities = ['ZAGREB', 'COPENHAGEN', 'PRAGUE', 'MOSCOW', 'SOBIBOR', 'WARSAW', 'TELAVIV'];
    const c = Math.floor(Math.random() * cities.length);
    const city = cities[c];
    const user = ss.data.fullName.toLowerCase();
    let adminmode = false, adminSetup = document.querySelector('#admin-setup'), sslnk = document.querySelector('.sslnk');
    //session link: ssl
    adminSetup.classList.add('opq');
    sslnk.addEventListener('click', (e) => {
        menu = e.target.nextElementSibling;
        e.target.nextElementSibling.classList.add('shw');
    });
    sslnk.nextElementSibling.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
            sslnk.textContent = session = li.textContent;
            console.log('clicked');
            myIframe.contentDocument.querySelector('#preview ul').innerHTML = '';
            myIframe.contentDocument.querySelector('tbody').innerHTML = '';
        });
    });
    if (user !== 'guest user') {
        //create gmode and eventListener
        adminmode = true;
        adminSetup.insertAdjacentHTML('afterbegin', `
            <div class="gmode">
                <div>Guest Mode</div>
                <div>
                    <input type="checkbox" name="chkmode" id="chkmode">
                    <label for="chkmode" id="lblmode" class="lblmode"></label>
                </div>
            </div>
        `);
        adminSetup.insertAdjacentHTML('beforeend', `
            <div id="caap">
                <span>C.A. Permissions</span>
                <svg id="caap-lnk" width="1.5em" height="1.5em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 7H16C18.7614 7 21 9.23858 21 12C21 14.7614 18.7614 17 16 17H14M10 7H8C5.23858 7 3 9.23858 3 12C3 14.7614 5.23858 17 8 17H10M8 12H16" stroke="#777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        `);
        document.querySelector('header > button.logout').insertAdjacentHTML('beforebegin', `
            <button type="button" class="link" onclick="location.href='./reserved.html'">Reserved</button>
            <button type="button" class="link" onclick="location.href='award.html'">Award</button>
            <button type="button" class="link" onclick="location.href='hack.html'">Fix</button>
        `);
        const chkmode = document.querySelector('#chkmode');
        if ('guestmode' in eotData) {
            Object.values(eotData.guestmode)[0] === 1 ? chkmode.checked = true : chkmode.checked = false;
        }
        //chkmode listener
        document.querySelector('#chkmode').addEventListener('change', async (e) => {
            e.target.classList.add('disabled');
            // console.log(city);
            toggleState = e.target.checked;
            console.log('@start:', toggleState);
            gmodeToggler(e.target);
            
            if (!adminmode) {
                alert('Sorry! You do not have this privilege.');
                e.target.checked = false;
                e.target.classList.remove('disabled');
                return;
            }
            let reply = window.prompt('First enter your password.');
            if (reply !== ss.data.password) {   // Object.keys(eotData.guestmode)[0]
                alert("The password is incorrect.");
                console.log('@if:', toggleState);
            } else {
                chkmode.classList.add('disabled');
                console.log('MAIN TOGGLE STATE:', toggleState);
                chooseConfig(6);
                const batch = writeBatch(db);
                if (toggleState) {
                    batch.set(doc(db, 'EOT', session), {guestmode: {mahogany: 0}}, { merge: true });
                    batch.set(doc(db, 'staffCollection', 'aR6h4JTAI0vCAz12XCk6'), { code: city }, {merge: true});
                } else {
                    batch.set(doc(db, 'EOT', session), {guestmode: {mahogany: 1}}, { merge: true });
                    batch.set(doc(db, 'staffCollection', 'aR6h4JTAI0vCAz12XCk6'), { code: 'USADEY' }, { merge: true });
                }
                await batch.commit();

                console.log('@else:', toggleState);
                toggleState ? chkmode.checked = false : chkmode.checked = true;
                chkmode.classList.remove('disabled');
            }
        });
    }
});
function gmodeToggler(target) {
    if (target.checked) {
        toggleState = false;
    } else {
        toggleState = true;
    }
    target.checked = toggleState;
}

if(!sessionStorage.hasOwnProperty('arm')) { // Load arms
    let ssmaps = Object.keys(refrs);
    const proms = ssmaps.map(async k => {
        await getDoc(refrs[k]).then(doc => sessionStorage.setItem(k, JSON.stringify(doc.data())));
    });
    await Promise.all(proms).then(() => {
        preload();
        console.log('From server');
    });
} else {
    preload();
}
function preload() {
    const armArray = JSON.parse(sessionStorage.getItem('arm')).arms.sort();
    armArray.forEach(arm => {
        leftNav.insertAdjacentHTML('beforeend', `<a href="#">${arm}</a>`);
        document.querySelector('select#arm').insertAdjacentHTML('beforeend', `<option value="${arm}">${arm}</option>`);
    }); // EOF
    document.querySelectorAll('header #classroomBtn, header > .promoBtn, header > .promoBtn + button').forEach(btn => btn.removeAttribute('style'));
}

const DCA = 'DCA';
let data;
async function setIframeAttr(para1) {
    //there are two hidden elems: the second one holds upass value
    myIframe.setAttribute('data-class-arm', para1);
    // hiddenElems[0].value = para1;
    if (sessionStorage.hasOwnProperty('preview')) sessionStorage.removeItem('preview');
    data = [];
    // console.log(term)
    const armRef = collection(db, 'session', session, 'students');
    const q = query(armRef, where("arm", "==", para1), orderBy("first_name"));   //startAfter() to be included
    await getDocs(q).then(docs => {
        docs.docs.forEach(obj => {
            // if (obj.data()?.admission_no.toUpperCase().includes(DCA)) data.push(obj.data());
            if (['recruit'].includes(obj.data().arm.toLowerCase())) {
                data.push({id: obj.id, ...obj.data()});
            } else {
                data.push(obj.data());
            }
        });
        size = data.filter(({admission_no}) => admission_no.toUpperCase().startsWith(DCA));
        console.log("size:", size.length)
        // console.log(marked);
        sessionStorage.setItem('preview', JSON.stringify(size));
        // console.log('Done.')
    });
    myIframe.contentDocument.querySelector('tbody').innerHTML = '';
    data.forEach((student, index) => {
        myIframe.contentDocument.querySelector('tbody').insertAdjacentHTML('beforeend',`
            <tr onclick="deleteStudent('${student.id}',this.children[3].textContent, this)">
                <td>${index + 1}</td>
                <td>${student.id}</td>
                <td>${student.admission_no || student.phone}</td>
                <td>${student.last_name} ${student.first_name} ${student.other_name}</td>
                <td>${student.password || 'n/a'}</td>
            </tr>
        `);
    })
    myIframe.contentDocument.querySelector('table').style.display = 'block';
}
let clsTarget, num;
const topNavAnchors = document.querySelectorAll('.top-nav a');
topNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', (e) => {
        document.querySelector('.dropdown-menu').style.pointerEvents='none';
        myIframe.contentDocument.querySelector('.content div:first-child').innerHTML = '';
        myIframe.contentDocument.querySelector('table').style.display = 'none';
        myIframe.contentDocument.querySelector('h3').textContent = clsTarget = e.target.textContent;
        num = Number(a.dataset.href);
        if (e.target.textContent.toLowerCase() === 'demo') {
            chooseConfig(8);
        } else {
            let idx = configs[7].indexOf(e.target.textContent), keySub;
            chooseConfig(idx);
            idx < 3 ? keySub = Object.entries(JSON.parse(sessionStorage.jrSubs)) : keySub = Object.entries(JSON.parse(sessionStorage.srSubs));
            const formWrapper = document.querySelector('form#addSub').firstElementChild;
            formWrapper.innerHTML = '';
            for (const [a, b] of keySub) {
                formWrapper.insertAdjacentHTML('beforeend', `
                    <input type="checkbox" name="${a}" id="${a}" value="${b}">
                    <label for="${a}">${b}</label>
                `);
            }
        }
    });
});
const leftNavAnchors = document.querySelectorAll('.left-nav a');
leftNavAnchors.forEach((a, i, anchors) => {
    a.addEventListener('click', async (e) => {
        anchors.forEach((link) => link.classList.remove('active-left-nav'))
        a.classList.add('active-left-nav');
        await setIframeAttr(e.target.textContent);
    })
});

function randomKey() {
    //generate random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const passwordLength = 7;
    var password = '';
    for (let i = 0; i < passwordLength; i++) {
        let randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
};

const fm_createStudent = document.forms.createStudent;
fm_createStudent.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    let i, studentDoc = {};
    for(i = 0; i < e.target.length - 1; i++){
        studentDoc[e.target[i].name] = e.target[i].value;
    }
    studentDoc['password'] = randomKey();
    const stdRef = collection(db, 'session', session, 'students');
    addDoc(stdRef, {...studentDoc, comment: {}, days_present: [], photo_src: "", createdAt: serverTimestamp()})
    .then(async (data) => {
        await updateDoc(doc(db, 'session', session, 'students', data.id), {id: data.id})
        fm_createStudent.reset()
        document.querySelectorAll('dialog')[1].querySelector('.msg'). textContent = "Student Created.";
        document.querySelectorAll('dialog')[1].showModal();
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
        document.querySelector('.side-panel').scroll({top:0,left:0,behavior:"smooth"});
    });
});
//edit doc
const sidePanelBtns = document.querySelectorAll('.side-panel-toggle');
sidePanelBtns[2].addEventListener('click', (e) => {
    fields = {};
    const getSingleDoc = async (collectionName, documentId) => {
        try {
            const docRef = doc(db, 'session', session, collectionName, documentId);
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
                // document.querySelectorAll('dialog')[2].innerHTML = document.forms.createStudent.outerHTML;
                const editForm = document.querySelectorAll('dialog')[2];
                if (editForm.querySelector('form')) editForm.querySelector('form').remove(); //remove form
                editForm.insertAdjacentHTML('beforeend', document.forms.createStudent.outerHTML);
                var inputElems = document.querySelectorAll('dialog')[2].querySelectorAll(".input-group input");
                for( var i of inputElems ){
                    if(i.type == 'submit') continue;
                    i.value = documentData[i.name];
                }
                const activeLeftNav = [...document.querySelectorAll('.left-nav a')].find(a => a.classList.contains('active-left-nav'));
                const armIdx = [...document.querySelectorAll('.left-nav a')].findIndex(a => a.textContent.toLowerCase() == activeLeftNav.textContent.toLowerCase());
                editForm.querySelector('select#arm').selectedIndex = armIdx;

                documentData.gender == "M" ? editForm.querySelector("select#gender").selectedIndex = 0 : editForm.querySelector("select#gender").selectedIndex = 1;
                document.forms.createStudent.querySelector('textarea').value = documentData.home_address;
                editForm.lastElementChild.querySelector("input[type='submit']").value = 'Submit';
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
        e.submitter.disabled = true;
        e.submitter.style.cursor = 'not-allowed';
        const collectionName = "students";
        const documentId = sidePanelBtns[2].value;

        const docRef = doc(db, 'session', session, collectionName, documentId);
        updateDoc(docRef, fields)
            .then(async () => {
                window.alert("Update successful.");
                resetEditForm();
                e.submitter.disabled = false;
                e.submitter.style.cursor = 'pointer';
            });
    });
}
//clear form after data submission
function resetEditForm() {
    fields = {};
    document.querySelectorAll('dialog')[2].close();
    // document.querySelectorAll('dialog')[2].lastElementChild.remove();
}
//delete doc
const yesBtn = document.querySelector('dialog button');
yesBtn.onclick = function() {
    const ri = parseInt(document.querySelector('iframe').contentDocument.querySelector('.rowIndex__hidden').textContent);
    // const operation = 'destroy';
    // const action = document.querySelector('dialog p.msg').textContent;
    const targetID = document.querySelectorAll('.side-panel-toggle')[1].value;
    console.log(targetID);
    const msgDialog = document.querySelectorAll('dialog');
    msgDialog[0].close();

    const docRef = doc(db, 'session', session, 'students', targetID);
    deleteDoc(docRef)
    .then( async () => {
        msgDialog[1].querySelector('p').textContent = "Deletion Complete.";
            msgDialog[1].showModal();
            document.querySelector('iframe').contentDocument.querySelectorAll('tr')[ri].style.visibility = 'collapse';
        });
}
const printBtn = document.querySelectorAll('.side-panel-toggle')[3];
printBtn.onclick = async function () {
    printBtn.disabled = true;
    const row = Number(myIframe.contentDocument.querySelector('table tr.active td:first-child').textContent);
    const preview = JSON.parse(sessionStorage.getItem('preview'));
    let cls = myIframe.contentDocument.querySelector('h3#students').textContent;
    const r = row - (data.length - size.length) - 1;
    let arm = preview[r].arm;

    chooseConfig(6);
    let formMaster = '@septimusforster';
    
    if (arm !== "ENTRANCE") {
        const q = query(collection(db, "staffCollection"), where("masterOfForm."+cls, "==", arm));
        const snapped = await getDocs(q);
        printBtn.disabled = false;
        if (snapped.empty) return window.alert("This class has no form master. You can appoint one on the Reserved page.");
        snapped.docs.forEach(snap => {
            formMaster = snap.get('fullName');
            // console.log(snap.id)
        });
    }
    sessionStorage.setItem('student', JSON.stringify({...preview[r], cls, size: size.length, formMaster, session}));
    window.open('result.html', '_blank');
}
const photoBtn = document.querySelectorAll('.side-panel-toggle')[4];
photoBtn.onclick = function () {
    const preview = JSON.parse(sessionStorage.getItem('preview'));
    let cls = myIframe.contentDocument.querySelector('h3#students').textContent;
    let arm = preview[0].arm;
    location.href = `photos.html?cls=${cls}&arm=${arm}`;
}
// new codes
const perm_dialog = document.querySelector('dialog#perm');
const caap = document.querySelector('#caap');
const uncaap = document.querySelector('dialog#perm > form > div:last-of-type > button');
const perm_form = document.querySelector('form#ca-perm');
const perm_switches = perm_form.querySelectorAll("input[type='checkbox'");
const selectBtn = document.querySelector('select#yrs');

selectBtn.addEventListener('change', async (e) => {
    if (e.target.selectedIndex === 0) return;
    selectBtn.classList.add('chg');
    const ssRef = doc(db, 'EOT', selectBtn.value);
    const snapped = await getDoc(ssRef);
    if (!(snapped.exists()) || snapped.get('perm') == undefined) {
        alert("This session's data cannot be found/permission missing.");
        selectBtn.classList.remove('chg');
    } else {
        const p = snapped.get('perm');
        const perm = p.toString(2).padStart(8,0).split(''); //padStart ensures it is 8-bit long for all switches
        perm.forEach((pm, ix) => pm == '1' ? perm_switches[ix].checked = true : perm_switches[ix].checked = false);
        selectBtn.classList.remove('chg');
    }
});
//check if caap exists
if (caap) {
    caap.onclick = function () {
        try {
            chooseConfig(6)
        } catch(err) {
            console.log("Configuration already set.");
        }
        perm_dialog.showModal()
    }
    uncaap.onclick = function () {
        perm_dialog.close();
        if (!clsTarget) return;
        try {
            chooseConfig(configs[7].indexOf(clsTarget));
        } catch (err) {
            console.log("Configuration is already set.");
        }
    }
    perm_form.addEventListener('submit', async (e) => {
        e.submitter.disabled = true;
        e.preventDefault();
        selectBtn.classList.add('chg', 'clr');
        const sw = [...perm_switches].map(s => s.checked ? 1 : 0).join('');
        const fbData = parseInt(sw, 2);
        const ssn = selectBtn.value;
        const permRef = doc(db, 'EOT', ssn);
        await updateDoc(permRef, {perm: fbData}).then(() => {
            selectBtn.classList.remove('chg', 'clr');
            selectBtn.classList.add('tck');
            const toid = setTimeout(() => {
                selectBtn.classList.remove('tck');
                clearTimeout(toid);
                e.submitter.disabled = false;
            }, 5000);
        });
    });
}
//logout handler
document.querySelector('header > button.logout').addEventListener('click', () => {
    sessionStorage.removeItem('snapshot');
    window.location.replace('./login-cat.html');
});
//promotion button
document.querySelector('header > button.promoBtn').addEventListener('click', () => {
    sessionStorage.removeItem('preview');
    window.location.href = 'promo_tab.html';
});
//add student subjects
const addDialog = document.querySelector('dialog#addSubs');
let myid;
sidePanelBtns[5].onclick = () => {
    myid = sidePanelBtns[2].value;
    if (myid) {
        addDialog.showModal();
    }
}
const addSubForm = document.querySelector('form#addSub');
addSubForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true, e.submitter.nextElementSibling.disabled = true;
    e.submitter.style.cursor = 'not-allowed';

    let data = {};
    addSubForm.querySelectorAll('input').forEach(inp => {
        if (inp.checked == true) {
            data[inp.name] = inp.value;
        }
    });
    await updateDoc(doc(db, 'session', session, 'students', myid), {offered: data});
    alert("Subject updated.");
    e.submitter.disabled = false, e.submitter.nextElementSibling.disabled = false;
    e.submitter.style.cursor = 'pointer';
});
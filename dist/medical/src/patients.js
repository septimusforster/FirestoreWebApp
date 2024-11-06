import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or, serverTimestamp, orderBy, limit, runTransaction } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

let cfg = configs[9].appsettings;

var app = initializeApp(cfg);
var db = getFirestore(app);

function resetConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]?.appsettings || configs[projNum]);
    db = getFirestore(app);
}
//set page title
const title = document.head.querySelector('title');
const parentTitle = parent.document.head.querySelector('title');
const APP = {
    init() {
        parent.document.head.replaceChild(title, parentTitle);
    }
}
//parent window width
const section2 = document.querySelector('main > section:nth-child(2)').clientWidth;
const pw = parent.document.body.clientWidth;
const mid = (pw - section2) / 2 + 'px';

//active jsmenu
let activeMenu;
document.addEventListener('DOMContentLoaded', APP.init);

document.addEventListener('click', (e) => {
    if (activeMenu) {
        const b = activeMenu.classList.toggle('focus');
        b ? '' : activeMenu = null;
    }
})
//all dialog boxes
const dialog = document.querySelectorAll('dialog');
dialog.forEach(dg => dg.style.left = mid);

//close any parent dialog
const xDials = document.querySelectorAll('.x_dial');
xDials.forEach(btn => {
    btn.addEventListener('click', () => {
        setBackdrop(false);
        btn.closest('dialog').close();
    });
});

const jsMenuBtns = document.querySelectorAll('.jsmenu');
jsMenuBtns.forEach(btn => {
    btn.addEventListener('click', () => activeMenu = btn);
});

//listen for input:search focus
const search_form = document.querySelector('form.search');
const search_input = document.querySelector('input#search');
search_input.addEventListener('focus', (e) => {
    search_form.classList.add('focused');
});
//event to close search suggestions
const button_ex = document.querySelector('.search_opt button.ex');
[search_form.querySelector('button.times'),button_ex].forEach(btn => {
    btn.addEventListener('click', () => {
        search_form.classList.remove('focused');
    });
});

//Add New button
const addNewBtn = document.querySelector('.add.nw');
addNewBtn.onclick = function () {
    setBackdrop(true);
    dialog[0].showModal();  //show 'add new patient' dialog
}
//Add New Record button
const addNewRecordBtn = document.querySelector('.nw_rcd');
addNewRecordBtn.onclick = function () {
    setBackdrop(true);
    dialog[1].showModal();  //show Add New Record dialog
    // this.parentElement.previousElementSibling.classList.remove('focus');
};
//View medical records button
const viewBtns = document.querySelectorAll('button.view');
viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setBackdrop(true);
        dialog[2].showModal();
    });
});
//FUNCTIONS:
const yr = String(new Date(Date.now()).getUTCFullYear() + 1);   //current academic year
//to set backdrop
function setBackdrop (b) {
    const pbody = parent.document.body.querySelector('.backdrop');
    pbody.classList.toggle('bkdrp', b);
}

//add patient
dialog[0].querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.classList.add('clk');

    const fd = new FormData(e.target);
    const nVal = fd.get('anum').replaceAll(' ','').toUpperCase();
    const cVal = configs[7].indexOf(fd.get('cls'));

    //check if patient exists
    const q1 = query(collection(db, `patients${yr}`), where('regNo', '==', nVal), limit(1));
    await getDocs(q1).then(async res => {
        if (res.empty) {
            //register new student
            resetConfig(cVal);
            const q2 = query(collection(db, 'session', yr, 'students'), where('admission_no', '==', nVal), limit(1));
            const patient = await getDocs(q2);
            if (!patient.empty) {
                const d = patient.docs[0].data();
                const lname = d.last_name.toUpperCase();
                const fname = d.first_name.toUpperCase();
                const oname = d.other_name.toUpperCase();
                const date = Date.now();
                let data = {
                    'name': [lname, fname, oname],
                    'initials': `${lname[0]+fname[0]}`,
                    'regNo': d.admission_no,
                    'gender': d.gender,
                    'cls': fd.get('cls'),
                    'arm': d.arm,
                    'fphone': d.father_phone,
                    'mphone': d.mother_phone,
                    'createdAt': date,
                    'lastModified': serverTimestamp(),
                    'searchTerm': [
                        new Date(date).getMonth(),
                        lname,
                        fname,
                        oname,
                        d.admission_no
                    ],
                }
                resetConfig(9);
                await setDoc(doc(db, `patients${yr}`, patient.docs[0].id), data).then(val => {
                    //successfully added patient
                    e.submitter.classList.replace('clk', 'fin');
                    const id = setTimeout(() => {
                        //use a function to add data to the Records <section>
                        dialog[0].close();
                        setBackdrop(false);
                        dialog[0].querySelector('form').reset();
                        e.submitter.classList.remove('fin');
                        e.submitter.disabled = false;
                        clearTimeout(id);
                    }, 3000);
                });
            } else {
                alert("The patient has no record in the school's database.");
                e.submitter.disabled = false;
                e.submitter.classList.remove('clk');
            }
        } else {
            alert("The patient already exists.");
            e.submitter.disabled = false;
            e.submitter.classList.remove('clk');
        }
    });
});
//search for student
let searchTerm, snapFOLDER = [];
search_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;

    let st = searchTerm || search_input.value.toUpperCase();
    
    // resetConfig(9);
    const q = query(collection(db, `patients${yr}`), where('searchTerm', 'array-contains', st), orderBy('lastModified'));
    const snapdocs = await getDocs(q);
    if (snapdocs.empty) {
        alert("Sorry. No patient could be found.");
    } else {
        snapdocs.docs.forEach(snapDOC => {
            snapFOLDER.unshift(snapDOC);
            
        });
    }
    e.submitter.disabled = false;
});
//search option buttons
const searchOptBtns = document.querySelectorAll('.search_opt button:not(.uibtn)');
const search_form_submitter = document.querySelector('.fwd_arrow');
searchOptBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        search_input.value = '';
        search_input.value = btn.textContent;
        searchTerm = Number(e.target.dataset.val);
        search_form_submitter.click();

        // new Date(Date.now()).getMonth() == e.target.dataset.val  //10 for  November
        //Intl.DateTimeFormat('en-gb', {dateStyle: 'full'}).format(Date.now()).search(/November/)
    });
});
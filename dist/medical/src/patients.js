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
const divTable = document.querySelector('div.table');
let searchTerm, snapFOLDER = [],/* newVersion = false,*/ nodes = [];;
search_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;

    let st = searchTerm || search_input.value.toUpperCase();
    if (st == '') return;
    // resetConfig(9);
    const q = query(collection(db, `patients${yr}`), where('searchTerm', 'array-contains', st), orderBy('lastModified'));
    const snapdocs = await getDocs(q);
    if (snapdocs.empty) {
        alert("Sorry. No patient could be found.");
    } else {
        // if (!snapFOLDER.length) newVersion = true;
        snapFOLDER = [];
        snapdocs.docs.forEach(snapDOC => {
            let obj = snapDOC.data();
            obj['id'] = snapDOC.id;
            obj['name'] = snapDOC.data().name.join(' ');
            snapFOLDER.unshift(obj);
        });
        //run a function to insert snapdocs
        snapFOLDER.forEach(item => {
            const row = divTable.querySelector('template').content.cloneNode(true);
            const {initials, name, regNo, cls, gender, onmed='No'} = item;
            row.firstElementChild.firstElementChild.firstElementChild.textContent = initials;
            row.firstElementChild.lastElementChild.querySelector('span:nth-child(1)').textContent = name;
            let others = [regNo, cls, gender, onmed];
            row.lastElementChild.querySelectorAll('span:not(:nth-child(1))').forEach((span, idx) => {
                span.textContent = others[idx];
            });
            nodes.push(row);
        });
        nodes.forEach(node => {
            divTable.appendChild(node);
        });

        //event for rows in divTable
        divTable.querySelectorAll('.tr').forEach((tr, ix) => {
            tr.addEventListener('click', async (e) => {
                await sideAsset(snapFOLDER[ix]);
            });
        });
    }
    e.submitter.disabled = false;
});
//function to insert bio data into the upper section of the sidebar
const sectionII = document.querySelector('main > section:nth-of-type(2)');
async function sideAsset (sdata) {
    const {name, regNo, cls, arm, fphone, mphone} = sdata;
    sectionII.querySelectorAll('div:nth-of-type(1) > .li > span:nth-child(2)').forEach((sp,ix) => {
        sp.textContent = [name, regNo, `${cls} ${arm}`, fphone, mphone][ix] || 'None';
    });
    //asset for Record Details <dialog>
    dialog[2].querySelector('header + div > .li:nth-child(1) > span:nth-child(2)').textContent = name;
    //asset for New Record <dialog>
    const nameArr = name.split(' ');
    dialog[1].querySelector('header + div.li').innerHTML = `
        <span><small>${nameArr[0]} ${nameArr[2]}</small><br/>${nameArr[1]}</span>
        <span id="sid"><small>${regNo}</small></span>
    `;

    await findMedRecords(sdata.id);
}
const pHR = document.querySelector('p.hr');
let medFOLDER = [];
async function findMedRecords(fid) {
    pHR.classList.add('load');
    //filter medFOLDER for id
    let record = medFOLDER.filter(({id}) => id == fid);
    //if found, insert into the DOM
    if (record.length) {
        insertMedRecords(record);
        return;
    };
    //else, await checking backend
    const snapREC = await getDocs(query(collection(db, `patients${yr}`, fid, 'record')));
    //if not found, alert the user as such
    if (snapREC.empty) {
        pHR.nextElementSibling.innerHTML = '<code>No Data</code>';
    } else {
        //if found, push to medFOLDER and repeat Step 1 and 2
        record = {[fid]: snapREC.docs};
        medFOLDER.unshift(record);
        insertMedRecords(record);
        return;
    }
    pHR.classList.remove('load');
}
function insertMedRecords (rcd) {
    rcd.forEach(rec => {
        sectionII.querySelector('div:nth-of-type(2)').insertAdjacentHTML('beforeend', `
            <div class="records">
                <div>${rec.createdAt}</div>
                <div>${rec.comp}</div>
                <button type="button" class="view">View</button>
            </div>
        `);
    });

    pHR.classList.remove('load');
}
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
//clone medication
const medTemp = dialog[1].querySelector('form > template');
//insert categories into <select>
let groupNames = [], forbiddenSymb = '/.-:;#$%*()[]{}!~ '.split('');
configs[9].categories.forEach((c, d) => {
    let cname = '';
    for (let i = 0; i < c.length; i++) {
        if (forbiddenSymb.includes(c[i])) continue;
        cname += c[i];
    }
    let o = `<option value="${cname}">${configs[9].categories[d]}</option>`;
    groupNames.push(o);
});
//close uihead
const uihead = document.getElementById('uihead');
uihead.firstElementChild.onclick = () => {
    dialog[1].querySelectorAll('form div.cb').forEach(cb => {
        cb.removeAttribute('data-cb');
    });
    uihead.classList.remove('shw');
}
//remove checkbox selection
uihead.lastElementChild.onclick = () => {   //the Remove Button
    dialog[1].querySelectorAll('form div.cb').forEach(cb => {
        if (cb.hasAttribute('data-cb')) cb.parentElement.parentElement.remove();
        uihead.classList.remove('shw');
    });
}
//Add Medication click event listener
document.querySelector('button#addmed').addEventListener('click', () => {
    const copy = medTemp.content.cloneNode(true);
    groupNames.forEach(g => {
        copy.querySelector('select.cn').insertAdjacentHTML('beforeend', `${g}`);
    });
    //insert category drugs
    copy.querySelectorAll('select.cn').forEach(select => {
        select.addEventListener('change', async (e) => {
            e.target.disabled = true;
            e.target.classList.add('chg');
            await fetchDrugs(e.target.value, e.target.nextElementSibling);
            e.target.classList.remove('chg');
            e.target.disabled = false;
        });
    });
    //select checkbox event
    copy.querySelectorAll('div.cb').forEach(cb => {
        cb.addEventListener('click', (e) => {
            e.target.toggleAttribute('data-cb');
            const cbs = [...dialog[1].querySelector('form').querySelectorAll('div.cb')];
            const b = cbs.some(c => c.hasAttribute('data-cb'));
            b ? uihead.classList.add('shw') : uihead.classList.remove('shw');
        });
    });
    dialog[1].querySelector('form').appendChild(copy.firstElementChild);
});
//function to insert category drugs
async function fetchDrugs(cat, elem) {
    const i = JSON.parse(sessionStorage.getItem(cat));
    if (i === null) {
        //fetch from backend
        // resetConfig(9);
        const snap = await getDoc(doc(db, 'category', cat));
        console.log(snap.data())
        sessionStorage.setItem(cat, JSON.stringify(snap.data().prod));
        insertDrugs(snap.data().prod, elem);
    } else {
        insertDrugs(i, elem);
    }
}
function insertDrugs(items, elem) {
    let o = '<option value="">Select Drug</option>';
    items.forEach(im => {
        o += `<option value="${im}">${im}</option>`;
    });
    elem.innerHTML = o;
}
//create and submit medication
dialog[1].querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.classList.add('clk');

    let datA = [...dialog[1].querySelectorAll('.fm_part')].map(part => {
        let p = [...part.querySelectorAll('select, input')].map(elem => elem.value);
        return p;
    });
    //complaint
    const complaint = dialog[1].querySelector('form input#complaint').value;
    console.log(datA, complaint);
});
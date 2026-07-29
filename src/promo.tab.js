import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, updateDoc, query, where, and, or, serverTimestamp, orderBy, getCountFromServer, setDoc } from "firebase/firestore";

import configs from "../src/JSON/configurations.json" assert {type: 'json'};
// function somefunc(selector) {
//     //logic
// }

var app = initializeApp(configs[6]);
//init services
var db = getFirestore();
// collection refs

function chooseConfig(projConfig) {
    deleteApp(app);
    app = initializeApp(projConfig);
    db = getFirestore();
}

// initiating key params
let ss_props = JSON.parse(sessionStorage.getItem('master_util'));
let std_props = JSON.parse(sessionStorage.getItem('std_util'));
 const MONTH = new Date().getMonth();
let master_props = {    //very critical here, the order of the properties
    'FORM_ARM': ss_props?.FORM_ARM || '',
    'SESSION': MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear()),
    'FORM_NAME': ss_props?.FORM_NAME || '',
    'MASTER': ss_props?.MASTER || '',
}
console.log(ss_props);
let promoID, promoIndex;;
const changeFormBtn = document.querySelector('button#change_form');
const logoutBtn = document.querySelector('button#logout');
const loginDialog = document.querySelector('dialog#login_dg');
const adminDialog = document.querySelector('dialog#admin_dg');
const prDialog = document.getElementById('pr_dg');
const container = prDialog.querySelector('div.container');

//logout handler
logoutBtn.onclick = () => {
    sessionStorage.removeItem('master_util'), sessionStorage.removeItem('std_util'), sessionStorage.removeItem('snapshot');
    location.replace('login-cat.html');
}
//populate promo_tab.html
const promoOptions = ['Promote', 'Probation', 'Not Promoted', 'On trial'];
const statusMenu = document.createElement('ul');
for(let a = 0; a < promoOptions.length; a++) statusMenu.insertAdjacentHTML('beforeend', `<li data-val="${a}">${promoOptions[a]}</li>`);
statusMenu.addEventListener('click', e => {
    e.stopPropagation();
    promoIndex = e.target.dataset.val
    promoteHandler(e.target.closest('tr'), promoIndex);
});

function insertData (master, students) {
    //insert master
    const vals =  Object.values(master);
    document.querySelectorAll('div#bottom_header > div').forEach((div, idx) => {
        idx == 1 ? div.lastElementChild.textContent = `${vals[2]} ${vals[0]}` : div.lastElementChild.textContent = vals[idx + 1];
    });

    //insert students
    const tbody = document.querySelector('section table > tbody');
    tbody.innerHTML = '';   //reset tbody
    const xy = Object.values(students);
    xy.forEach((ME, ix) => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${ix+1}</td>
                <td>${ME.admission_no}</td>
                <td class="${['prom','prob','rept','trial',''].at(['Promoted','Probation','Not Promoted','Promoted on Trial'].indexOf(ME?.promo_status))}">${ME.last_name} ${ME.first_name} ${ME.other_name}</td>
                <td>${ME.admission_year}</td>
                <td>
                    <button type="button" class="drop_btn"></button>
                </td>
            </tr>    
        `);
    });
    //roll no
    document.querySelector('footer > div > div').firstElementChild.textContent = xy.length;
    promoteBtnsHandler();
}
function promoteBtnsHandler () {
    const prBtns = document.querySelectorAll('tr > td:last-of-type > button');
    prBtns.forEach((btn, btx) => {
        btn.addEventListener('click', e => {
            e.target.appendChild(statusMenu);
        });
        btn.addEventListener('blur', e => {
            statusMenu.remove();
        });
    });
}

//error div function
function loginDataErr(str, container, errDiv) {
    errDiv.lastElementChild.textContent = str;
    container.classList.add('err');
    const toid = setTimeout(() => {
        container.classList.remove('err');
        clearTimeout(toid);
    }, 3000);
}
let exception;
async function getMasterFromServer (uname, upwd, cont, err) {
    exception = false;
    chooseConfig(configs[6]);
    const masterQ = query(collection(db, 'staffCollection'), and(where('username', '==', uname), where('password', '==', upwd)));
    await getDocs(masterQ).then(async res => {
        console.log(res);
        if (res.empty) {
            loginDataErr('Error logging in.', cont, err);
            exception = true;
            return;
        }
        const fname = res.docs[0].get('fullName');
        const resMap = res.docs[0].get('masterOfForm');
        if (!resMap) {
            loginDataErr('User not allowed.', cont, err);
            exception = true;
            return;
        }
        const cls = Object.keys(resMap)[0];
        const arm = Object.values(resMap)[0];
        console.log(cls, arm);
        Object.defineProperties(master_props, { //object.defineproperties returns a modified master_props
            MASTER: {value: fname},
            FORM_NAME: {value: cls},
            FORM_ARM: {value: arm}
        });
        sessionStorage.setItem('master_util', JSON.stringify(master_props));
        ss_props = JSON.parse(sessionStorage.getItem('master_util'));

        await getStudents(cls, arm, cont, err);
        insertData(master_props, std_props);
        promoteBtnsHandler();

        console.log("From server.");
    });
    return exception;
}

//function to get students
async function getStudents (cls, arm, cont, err) {
    exception = false;
    chooseConfig(configs[configs[7].indexOf(cls)]);  //try sub'ing cls for master_props.FORM_NAME
    const formQ = query(collection(db, 'session', master_props.SESSION, 'students'), where('arm', '==', arm), orderBy('last_name'));
    await getDocs(formQ).then(xres => {
        if (xres.empty) {
            loginDataErr('Data unavailable.', cont, err);
            exception = true;
            return;
        }
        let students = {};
        xres.docs.forEach(val => {
            students[val.id] = val.data();
        });
        sessionStorage.setItem('std_util', JSON.stringify(students));
        std_props = students;

        insertData(master_props, std_props);
        promoteBtnsHandler();
    });
}

let admin = false;
//click event to display class login form
changeFormBtn.onclick = () => {
    admin ? adminDialog.showModal() : loginDialog.showModal();
}
//on page load
const admin_form = adminDialog.querySelector('form');
const snapshot = JSON.parse(sessionStorage.getItem('snapshot'));
if (snapshot?.data.username !== 'guestmode') {
    master_props.MASTER = snapshot?.data.fullName || '';
    admin = true;
    const SPAN = document.createElement('span');
    SPAN.className = 'padlock';
    SPAN.setAttribute('title', 'Admin Status');
    document.querySelector('#bottom_header > div:nth-of-type(3) > div').insertAdjacentElement('beforeend', SPAN);
    
    //create and insert admin form and its children select elements
    const Classes = configs[7].slice(0,6);
    const SELECT0 = document.createElement('select');
    SELECT0.name = 'cls';
    SELECT0.id = 'cls_slct';
    const options = Classes.map(c => {
        let o = new Option(c,c);
        return o;
    });
    SELECT0.append(...options);
    admin_form.appendChild(SELECT0);

    const Arms = JSON.parse(sessionStorage.getItem('arm')).arms;
    const SELECT1 = document.createElement('select');
    SELECT1.name = 'arm';
    SELECT1.id = 'arm_slct';
    const options1 = Arms.map(a => {
        let o = new Option(a,a);
        return o;
    });
    SELECT1.append(...options1);
    admin_form.appendChild(SELECT1);

    admin_form.insertAdjacentHTML('beforeend', `
        <button>
            <span class="txt">ENTER</span>
            <span class="carousel"></span>
        </button>
        <button type="button" class="cncl">CLOSE</button>
    `);
}
(ss_props && std_props) || (admin && std_props) ? insertData(master_props, std_props) : changeFormBtn.click();

//login form handler
const login_form = loginDialog.querySelector('form');
login_form.addEventListener('submit', async (e) => {
    const cont = loginDialog.firstElementChild;
    const elem = loginDialog.lastElementChild;
    e.preventDefault();
    e.submitter.disabled = true, e.submitter.nextElementSibling.disabled = true;
    e.submitter.classList.add('clk');
    const uname = document.querySelector('input#uname').value;
    const upwd = document.querySelector('input#upwd').value;

    let exception = await getMasterFromServer(uname, upwd, cont, elem);
    e.submitter.disabled = false, e.submitter.nextElementSibling.disabled = false;
    e.submitter.classList.remove('clk');

    if (!exception) {
        login_form.reset();
        loginDialog.close();
    }
});

//admin form handler
admin_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true, e.submitter.nextElementSibling.disabled = true;
    e.submitter.classList.add('clk');

    const cont = adminDialog.firstElementChild;
    const err = adminDialog.lastElementChild;
    const cls = admin_form.querySelector('select#cls_slct').value;
    const arm = admin_form.querySelector('select#arm_slct').value;
    
    master_props.FORM_NAME = cls;
    master_props.FORM_ARM = arm;

    await getStudents(cls, arm, cont, err);
    sessionStorage.setItem('master_util', JSON.stringify(master_props));
    e.submitter.disabled = false, e.submitter.nextElementSibling.disabled = false;
    e.submitter.classList.remove('clk');

    if (!exception) {
        admin_form.reset();
        adminDialog.close();
    }
});

let old_form, new_form, new_session = Number(master_props.SESSION) + 1;
function promoteHandler(tr, btx) {
    const STUDENT_NAME = tr.children[2].textContent;
    const ADM_NO = tr.children[1].textContent;
    old_form = master_props.FORM_NAME;
    new_form = configs[7][configs[7].indexOf(old_form) + 1];
    
    Object.entries(std_props).some(([key, val]) => {if (val.admission_no == ADM_NO) promoID = key});
    switch (btx) {
        case '0':
            container.firstElementChild.firstElementChild.textContent = `promote ${STUDENT_NAME} to ${new_form}`;
            container.lastElementChild.lastElementChild.firstElementChild.textContent = 'PROMOTE';
            container.classList.replace('rpt', 'prm') ? true : container.classList.add('prm');
            break;
        case '1':
            container.firstElementChild.firstElementChild.textContent = `set ${STUDENT_NAME} on Probation`;
            container.lastElementChild.lastElementChild.firstElementChild.textContent = 'Probation';
            container.classList.remove('rpt', 'prm');
            break;
        case '2':
            container.firstElementChild.firstElementChild.textContent =  `repeat ${STUDENT_NAME} in ${old_form}`;
            container.lastElementChild.lastElementChild.firstElementChild.textContent = 'NOT PROMOTED';
            container.classList.replace('prm', 'rpt') ? true : container.classList.add('rpt');
            break;
        case '3':
            container.firstElementChild.firstElementChild.textContent =  `promote ${STUDENT_NAME} on trial to ${new_form}`;
            container.lastElementChild.lastElementChild.firstElementChild.textContent = 'ON TRIAL';
            container.classList.replace('rpt', 'prm') ? true : container.classList.add('prm');
            break;
        default:
            break;
    }
    // console.log(promoID, new_form, new_session)
    prDialog.showModal();
}

//promote or repeat btns
const notify = document.querySelector('.notify');
const carouselBtn = container.querySelector('div > button:last-of-type');
carouselBtn.addEventListener('click', async (e) => {
    carouselBtn.disabled = true, carouselBtn.previousElementSibling.disabled = true;
    carouselBtn.classList.add('clk');
    notify.lastElementChild.textContent = ['Promoted','Probated','Not Promoted','On Trial'][promoIndex];
    //check if result already exists
    switch (promoIndex) {
        case '0':
            await finalPromotionHandler(new_form, 'Promoted');
            break;
        case '1':
            await finalPromotionHandler(old_form, 'Probation');
            break;
        case '2':
            await finalPromotionHandler(old_form, 'Not Promoted');
            break;
        case '3':
            await finalPromotionHandler(new_form, 'Promoted on Trial');
            break;
        default:
            break;
    }    
});

let x = new Array(8);
x.fill(null);   //8 nulls for SCORES collection
const NULLS = {
    0: x/*, 1: x, 2: x,*/
}

async function finalPromotionHandler (form_state, promomsg) {
    // console.log(old_form, configs[configs[7].indexOf(old_form)]);
    // return;
    chooseConfig(configs[configs[7].indexOf(old_form)]);
    const promoteDoc = await getDoc(doc(db, 'session', String(new_session), 'students', promoID));
    if (promoteDoc.exists()) {
        container.nextElementSibling.lastElementChild.textContent = "Task already achieved.";
        container.classList.add('err');
        const timerID = setTimeout(() => {
            container.classList.remove('err');
            carouselBtn.disabled = false, carouselBtn.previousElementSibling.disabled = false;
            carouselBtn.classList.remove('clk');
            clearTimeout(timerID);
        }, 3000);
        return;
    } else {
        let data = std_props[promoID];
        //create empty 'comments', 'days_present' and 'promo_status'
        data['comment'] = {0: '', 1: '', 2: ''};
        data['days_present'] = [0,0,0];
        data['promo_status'] = null;
        //create empty "records" of student subjects
        let records = {};
        // for (let k of Object.keys(data.offered)) records[k] = NULLS;
        for(let k in data['record']) data['record'][k] = NULLS;
        
        //check if old_form is JSS 3
        if(old_form == configs[7][2]) {
            delete data['offered'];
            data['record'] = {};//reset records
        }
        await updateDoc(doc(db, 'session', master_props.SESSION, 'students', promoID), {
            promo_status: promomsg
        });
        if (['Promoted', 'Not Promoted', 'Promoted on Trial'].includes(promomsg)){
            chooseConfig(configs[configs[7].indexOf(form_state)]);
            //setDoc to STUDENTS collection and thereafter SCORES collection
            await setDoc(doc(db, 'session', String(new_session), 'students', promoID), data);
            // await setDoc(doc(db, 'session', String(new_session), 'students', promoID, 'scores', 'records'), records);
        }
    }

    carouselBtn.closest('dialog').close();
    carouselBtn.disabled = false, carouselBtn.previousElementSibling.disabled = false;
    carouselBtn.classList.remove('clk');
    notify.classList.add('shw');
    const tid = setTimeout(() => {
        notify.classList.remove('shw');
        clearTimeout(tid);
    }, 3000);
}

//cancel btns on dialog elems
const cancelBtns = document.querySelectorAll('button.cncl');
cancelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('dialog').close();
    });
});
import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, updateDoc, query, where, and, or, serverTimestamp, orderBy } from "firebase/firestore";

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

let master_props = {    //very critical here, the order of the properties
    'FORM_ARM': ss_props?.FORM_ARM || null,
    'SESSION': '2024',
    'FORM_NAME': ss_props?.FORM_NAME || null,
    'MASTER': ss_props?.MASTER || null,
}

const prmClass = 'JSS 3';
const rptClass = 'JSS 2';
const studentSnapshot = {'ABC/00/0001': 'Neil Gibson', 'ABC/00/0002': 'Miranda Salkilld'};

let notifyMsg;
const changeFormBtn = document.querySelector('button#change_form');
const logoutBtn = document.querySelector('button#logout');
const loginDialog = document.querySelector('dialog#login_dg');
const prDialog = document.getElementById('pr_dg');
const container = prDialog.querySelector('div.container');
const container_login = loginDialog.querySelector('div.container');
const err_div = loginDialog.querySelector('.err_div');

//logout handler
logoutBtn.onclick = () => {
    sessionStorage.removeItem('master_util');
    sessionStorage.removeItem('std_util');
    location.reload();
}
//populate promo_tab.html
function insertData (master, students) {
    //insert master
    const vals =  Object.values(master);
    document.querySelectorAll('div#bottom_header > div').forEach((div, idx) => {
        idx == 1 ? div.lastElementChild.textContent = `${vals[2]} ${vals[0]}` : div.lastElementChild.textContent = vals[idx + 1];
    });

    //insert students
    const tbody = document.querySelector('section table > tbody');
    tbody.innerHTML = '';   //reset tbody
    students.forEach((st, ix) => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${ix+1}</td>
                <td>${st.admission_no}</td>
                <td>${st.last_name + ' ' + st.first_name + ' ' + st.other_name}</td>
                <td>${st.admission_year}</td>
                <td>
                    <button type="button"></button><button type="button"></button>
                </td>
            </tr>    
        `);
    });
    //roll no
    document.querySelector('footer > div > div').firstElementChild.textContent = students.length;
}

async function getMasterFromSession () {

}
//error div function
function loginDataErr(str) {
    err_div.lastElementChild.textContent = str;
    container_login.classList.add('err');
    const toid = setTimeout(() => {
        container_login.classList.remove('err');
        clearTimeout(toid);
    }, 3000);
}
async function getMasterFromServer (uname, upwd) {
    let exception;
    chooseConfig(configs[6]);
    const masterQ = query(collection(db, 'staffCollection'), and(where('username', '==', uname), where('password', '==', upwd)));
    await getDocs(masterQ).then(async res => {
        console.log('res.empty:', res.empty);
        if (res.empty) {
            loginDataErr('Error logging in.');
            exception = true;
            return;
        }
        const fname = res.docs[0].get('fullName');
        const resMap = res.docs[0].get('masterOfForm');
        const cls = Object.keys(resMap)[0];
        const arm = Object.values(resMap)[0];
        Object.defineProperties(master_props, { //object.defineproperties returns a modified master_props
            MASTER: {value: fname},
            FORM_NAME: {value: cls},
            FORM_ARM: {value: arm}
        });
        sessionStorage.setItem('master_util', JSON.stringify(master_props));
        ss_props = JSON.parse(sessionStorage.getItem('master_util'));

        //get students in this form
        chooseConfig(configs[configs[7].indexOf(cls)]);  //try sub'ing cls for master_props.FORM_NAME
        const formQ = query(collection(db, 'session', master_props.SESSION, 'students'), where('arm', '==', arm), orderBy('last_name'));
        await getDocs(formQ).then(xres => {
            if (res.empty) {
                loginDataErr('Data unavailable.');
                exception = true;
                return;
            }
            const students = [];
            xres.docs.forEach(val => {
                students.push(val.data())
            })
            sessionStorage.setItem('std_util', JSON.stringify(students));
            std_props = JSON.parse(sessionStorage.getItem('std_util'));
            insertData(master_props, std_props);

            const prBtns = document.querySelectorAll('tr > td > button');
            prBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    promoteHandler(btn)
                });
            });

            console.log("From server.");
        });
    });
    return exception;
}

//click event to display class login form
changeFormBtn.onclick = () => {
    loginDialog.showModal();
}
//on page load
ss_props && std_props ? insertData(master_props, std_props) : changeFormBtn.click();

//login form handler
const login_form = loginDialog.querySelector('form');
login_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true, e.submitter.nextElementSibling.disabled = true;
    e.submitter.classList.add('clk');
    const uname = document.querySelector('input#uname').value;
    const upwd = document.querySelector('input#upwd').value;

    let exception = await getMasterFromServer(uname, upwd);
    e.submitter.disabled = false, e.submitter.nextElementSibling.disabled = false;
    e.submitter.classList.remove('clk');

    if (!exception) {
        loginDialog.querySelector('form').reset();
        loginDialog.close();
    }
});

//event handlers for promote or repeat btns
// prBtns.forEach(btn => {
//     btn.addEventListener('click', (e) => {
    function promoteHandler(btn) {
        const student = btn.parentElement.parentElement.children[2].textContent;
        if (btn == btn.parentElement.firstElementChild) {
            //apply promote formatting
            notifyMsg = 'PROMOTED';
            container.firstElementChild.firstElementChild.textContent = `promote ${student} to ${prmClass}`;
            container.lastElementChild.lastElementChild.firstElementChild.textContent = 'PROMOTE';
            container.classList.replace('rpt', 'prm') ? true : container.classList.add('prm');
        } else {
            //apply repeat formatting
            notifyMsg = 'REPEATED';
            container.firstElementChild.firstElementChild.textContent =  `repeat ${student} in ${rptClass}`;
            container.lastElementChild.lastElementChild.firstElementChild.textContent = 'REPEAT';
            container.classList.replace('prm', 'rpt') ? true : container.classList.add('rpt');
        }
        prDialog.showModal();
    }
//     });
// });

//promote or repeat btns
const notify = document.querySelector('.notify');
const carouselBtn = container.querySelector('div > button:last-of-type');
carouselBtn.addEventListener('click', (e) => {
    carouselBtn.disabled = true, carouselBtn.previousElementSibling.disabled = true;
    carouselBtn.classList.add('clk');
    notify.lastElementChild.textContent = notifyMsg;
    //run the promotion or repeating
    const tid = setTimeout(() => {
        carouselBtn.closest('dialog').close();
        carouselBtn.disabled = false, carouselBtn.previousElementSibling.disabled = false;
        carouselBtn.classList.remove('clk');
        notify.classList.add('shw');
        clearTimeout(tid);
    }, 3000);
    const tid0 = setTimeout(() => {
        notify.classList.remove('shw');
        clearTimeout(tid0);
    }, 6000);
})
//cancel btns on dialog elems
const cancelBtns = document.querySelectorAll('button.cncl');
cancelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('dialog').close();
    });
});
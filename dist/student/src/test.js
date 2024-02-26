import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, and, or, updateDoc } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

const params = atob(new URL(location.href).searchParams.get('sb'))
const ct = parseInt(new URL(location.href).searchParams.get('ct'));
let cat;

const subby = JSON.parse(sessionStorage.getItem(params));
const snappy = JSON.parse(sessionStorage.getItem('snapshot'));
subby.forEach((sb, n) => {
    if (sb.catNo == ct) {
        cat = n;
        // console.log(cat)
        return;
    }
})
// const cat = subby.length < ct - 1 ? subby.length - ct : subby.length - 1;

const testAbbr = params;
const testNum = ct - 1;
const chosen = subby[cat].chosen;
const choice = subby[cat].choice;
const questions = subby[cat].questions;
const rating = subby[cat].rating;
const instr = subby[cat].instr;
const code = subby[cat].code;
const link = subby[cat].link + '&igu=1#toolbar=0';

const accDialog = document.querySelector('#accDialog');
const chkDateDialog = document.querySelector('#chkDateDialog');
const header = document.querySelector('header');
const section = document.querySelector('section');
const main = document.querySelector('main');
// const dt = subby[cat].startDate;
const startDate = new Date(subby[cat].startDate).setHours(24);
const startTime = subby[cat].startTime;
const duration = subby[cat].duration;

// settingn up startTime
/*
const parts = startTime.split(':');
const hr = parseInt(parts[0]);
const mm = parseInt(parts[1]);
var currentTime = new Date();
currentTime.setHours(hr);
currentTime.setMinutes(mm);
currentTime.setMinutes(currentTime.getMinutes() + duration);
var formattedTime = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');
*/

async function chkDate() {
    if (startDate < Date.now()) {
        chkDateDialog.querySelector('output').innerHTML = 'This test has expired.<br>Tender any inquiries to your teacher.';
        chkDateDialog.showModal();
        return;
    } else {
        // display accDialog
        accDialog.showModal();
    }
}
await chkDate();

var timer = document.getElementById('timer');
function displayHeader() {
    //display header resources
    document.getElementById('person').textContent = `${snappy.last_name + ' ' + snappy.first_name + ' ' + snappy.other_name}`;
    document.getElementById('task').textContent = snappy.offered[testAbbr];
    timer.textContent = duration;
    header.style.display = 'flex';
    header.classList.remove('disp');
}
function displaySection() {
    //display section resources
    const times = document.querySelector('.sectionX');
    instr.forEach((ins, i) => {
        times.insertAdjacentHTML('beforebegin', `
            <div>
                <h2>0${i+1}</h2>
                <p>${ins}</p>
            </div>
        `)
    })
    section.style.display = 'flex';
    section.classList.remove('disp');
}
const iframe = document.querySelector('iframe');
const tbody = document.querySelector('tbody');
function displayMain() {
    // populate answer sheet
    let counter = 1;
    let i, j;
    for (i = 0; i < questions; i++) {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>
                    <label>${i+1}</label>
                </td>
            </tr>
        `)
        for (j = 0; j < choice; j++) {
            tbody.lastElementChild.insertAdjacentHTML('beforeend', `
                <td>
                    <input type="radio" name="${i}" id="rd${counter}" value="${j+1}">
                    <label for="rd${counter}">${String.fromCharCode(65+j)}</label>
                </td>
            `)
            counter++;
        }
    }
    main.style.display = 'flex';
    main.classList.remove('disp');

    // insert link into iframe
    // iframe.insertAdjacentHTML
    iframe.src = link;
}

let intervalID;
iframe.addEventListener('load', function () {
    // console.log('Iframe has finished loading. Now start timer.')
    // start timer
    intervalID = setInterval(countDown, 1 * 60 * 1000)
})
function countDown () {
    if (timer.textContent == 0) {
        clearInterval(intervalID);
        submission();
        // submitBtn.click();
    } else {
        timer.textContent -= 1;
    }
}

const accForm = document.forms.accForm;
accForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const acc = accForm.acc.value;
    if (acc === code) {
        document.documentElement.requestFullscreen();
        await displayHeader();
        await displaySection();
        await displayMain();
        accDialog.close();
    } else {
        window.alert("Invalid access token.")
    }
    // console.log(subby[testNum - 1].code)
})

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === null) {
        submission();
        // submitBtn.click();
    }
})
const classIndex = configs[7].indexOf(snappy.class);

// initial firebase app, assuming for SSS 3
var app = initializeApp(configs[classIndex]);
// init services
var db = getFirestore();

// const selectElt = document.querySelector('select#classroom');
// selectElt.addEventListener('change', (e) => {
//     deleteApp(app);
//     let optIndex = e.target.selectedIndex - 1;
//     app = initializeApp(configs[optIndex]);
//     // init services
//     db = getFirestore()
//     // collection refs
// })
// lksHjPA7
// F79pWGRz
// sKi3qxLu
// new Date(JSON.parse(sessionStorage.LIT)[0].startDate) > Date.now()
// JSON.parse(sessionStorage.LIT)[0].link

// load options
const uid = snappy.id;

let buffer = new ArrayBuffer(questions);
let dv = new DataView(buffer);
let updateVal = [null, null, null, null];
const msgDialog = document.querySelector('dialog#msgDialog');
const submitDialog = document.querySelector('dialog#submitDialog');
const submitBtn = document.querySelector('.aside__footer input[type="submit"]');
submitBtn.addEventListener('click', (e) => {
    // display submitDialog
    // submitDialog.showModal();
    submission();
});
/*
const yesBtn = document.querySelector('button#yes');
yesBtn.addEventListener('click', (e) => {
    submitDialog.querySelectorAll(button).forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    })
    submission();
    submitDialog.close();
})
*/
async function submission() {
    // submitBtn.addEventListener('click', async (e) => {
        submitBtn.disabled = true;
        submitBtn.style.cursor = 'not-allowed';
        clearInterval(intervalID);
    
        let i, score = 0;
        for (i = 0; i < questions; i++) {
            if (chosen[i] == dv.getInt8(i)) {
                score++;
            }
        }
        const scoreRef = doc(db, "scores", uid)
        await getDoc(scoreRef).then( async res => {
            if (res.data()?.[testAbbr] === undefined) {
                updateVal.splice(testNum, 1, Number((score/questions*rating).toFixed(1)))
                await setDoc(scoreRef, {
                    [testAbbr]: updateVal,
                }, { merge: true })
                // console.log("Test updated 1.")
                msgDialog.querySelector('output').innerHTML = `
                    Your score:<br><large>${score} out of ${questions}</large>
                `;
                msgDialog.showModal();
                tbody.style.pointerEvents = 'none';
            } else {
                if (res.data()[testAbbr][testNum] != null) return window.alert("You've already taken this test.");
                let arr = res.data()[testAbbr];
                arr.forEach((element, index) => {
                    updateVal.splice(index, 1, element)
                });
                // updateVal = res.data()[testAbbr];
                updateVal[testNum] = Number((score/questions*rating).toFixed(1));
        
                await setDoc(scoreRef, {
                    [testAbbr]: updateVal,
                }, { merge: true })
                msgDialog.querySelector('output').innerHTML = `
                    Your score:<br><large>${score} out of ${questions}</large>
                `;
                msgDialog.showModal();
                tbody.style.pointerEvents = 'none';
            }
        })
    
    // })
}

const quizForm = document.forms.quizForm;
quizForm.addEventListener('change', (e) => {
    dv.setInt8(e.target.name, e.target.value);
})

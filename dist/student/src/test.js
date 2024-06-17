import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
import { update } from "firebase/database";

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

const testAbbr = params;
const testNum = ct - 1;
const chosen = subby[cat].chosen;
const choice = subby[cat].choice;
const questions = subby[cat].questions;
const rating = subby[cat].rating;
const instr = subby[cat].instr;
const code = subby[cat].code;
const link = subby[cat].link + '#toolbar=0';

const accDialog = document.querySelector('#accDialog');
const chkDateDialog = document.querySelector('#chkDateDialog');
const header = document.querySelector('header');
const section = document.querySelector('section');
const main = document.querySelector('main');
// const dt = subby[cat].startDate;
const startDate = new Date(subby[cat].startDate).setHours(24);
const startTime = subby[cat].startTime;
var duration = subby[cat].duration;

const classIndex = configs[7].indexOf(snappy.class);

// initial firebase app
var app = initializeApp(configs[6]);
// init services
var db = getFirestore();

let eotDates, term;
async function eot() {
    const eotRef = doc(db, "reserved", "EOT");
    await getDoc(eotRef).then((res) => {
        // store dates in eotDates
        eotDates = res.data();
        term = ['First','Second','Third'].indexOf(res.data().this_term);
        deleteApp(app);
        app = initializeApp(configs[classIndex]);
        db = getFirestore();
    })
}
eot();

async function chkDate() {
    if (startDate < Date.now()) {
        chkDateDialog.querySelector('output').innerHTML = 'This test has expired.<br>Tender any inquiries to your teacher.';
        chkDateDialog.showModal();
        return;
    } else {
        accDialog.showModal();
    }
}
await chkDate();

var timer = document.getElementById('timer');
function displayHeader() {
    //display header resources
    document.getElementById('person').textContent = `${snappy.last_name + ' ' + snappy.first_name + ' ' + snappy.other_name}`;
    document.getElementById('task').textContent = snappy.offered[testAbbr];
    timer.textContent = duration + ".00";
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

    // iframe.src = link;
    const img = new Image();
    img.onload = function () {
        img.setAttribute('width', '100%');
        iframe.contentDocument.body.appendChild(img);
    }
    img.src = link;
}

let intervalID;
iframe.addEventListener('load', function () {
    // console.log('Iframe has finished loading. Now start timer.')
    // start timer
})
let sec = 60;
function countDown () {
    sec--;
    if (timer.textContent == "0.00") {
        clearInterval(intervalID);
        // submission();
        // submitBtn.click();
    } else {
        timer.textContent = duration + '.' + String(sec).padStart(2,0);
        if (sec == 0) {
            duration--;
            sec = 60; //reset sec
        }
    }
}

// load options
const uid = snappy.id;

let buffer = new ArrayBuffer(questions);
let dv = new DataView(buffer);
let updateVal;
const msgDialog = document.querySelector('dialog#msgDialog');
const submitDialog = document.querySelector('dialog#submitDialog');
const submitBtn = document.querySelector('.aside__footer input[type="submit"]');

const accForm = document.forms.accForm;
accForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const acc = accForm.acc.value;
    // get test doc if available
    const scoreRef = doc(db, "scores", uid);
    await getDoc(scoreRef).then(async res => {
        if (res.get(testAbbr) && res.get(testAbbr)[term][testNum] != null) {
            window.alert("You've already taken this test.");
            return;
        }
        if (!res.exists || res.get(testAbbr) == undefined) {
            await setDoc(scoreRef, {
                [testAbbr]: {
                    0: [null, null, null, null],
                    1: [null, null, null, null],
                    2: [null, null, null, null]
                }
            }, { merge: true });
            updateVal = [null, null, null, null];
        } else {
            updateVal = res.get(testAbbr)[term];
        }
        if (acc === code) {
            accDialog.close();
            document.documentElement.requestFullscreen();
            displayHeader();
            displaySection();
            displayMain();
            intervalID = setInterval(countDown, 1000);
        } else {
            window.alert("Invalid access token.")
        }
    })
})

// document.addEventListener('fullscreenchange', () => {
//     if (document.fullscreenElement === null) {
//         // document.documentElement.requestFullscreen();
//         // submitBtn.click();
//         submission();
//     }
// })

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    submitDialog.showModal();
});

const yesBtn = document.querySelector('button#yes');
yesBtn.addEventListener('click', (e) => {
    submitDialog.querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
    })
    submission();
    submitDialog.close();
})

async function submission() {
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
    updateVal.splice(testNum, 1, Number((score/questions*rating).toFixed(1)));
    await setDoc(scoreRef, {
        [testAbbr]: {[term]: updateVal},
    }, { merge: true });
    msgDialog.querySelector('output').innerHTML = `
        Your score:<br><large>${score} out of ${questions}</large>
    `;
    msgDialog.showModal();
    tbody.style.pointerEvents = 'none';
}

const quizForm = document.forms.quizForm;
quizForm.addEventListener('change', (e) => {
    dv.setInt8(e.target.name, e.target.value);
})

let answerPad = document.querySelector('.switch')

function openpad () {
    answerPad.classList.add('open-aside')
}
function closepad () {
    answerPad.classList.remove('open-aside')
}
const iframeWindow = iframe.contentWindow;
iframeWindow.addEventListener('click', function(){
    if (answerPad.classList.contains('open-aside')) {
        closepad();
    } else {
        openpad()
    }
})
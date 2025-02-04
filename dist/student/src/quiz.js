import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, updateDoc, query, where, and, or, serverTimestamp, orderBy, limit, runTransaction } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
//fullscreen setup
// document.addEventListener('DOMContentLoaded', (e) => {
    
// });
// document.addEventListener('fullscreenchange', (e) => {
//     if (document.fullscreenElement === null) {
//         console.log(e);
//     }
// });

const startupDialog = document.querySelector('#startup-dg');
const scoreDialog = document.querySelector('#score-dg');

const timeElem = document.querySelector('span#cdtmr > i');
const infoBtn = document.querySelector('#info-btn');
const oculus = document.querySelector('button.oculus');
const img = document.querySelector('aside:nth-child(2) > img');
const submitBtn = document.querySelector('#submit-btn');
const pasteBtn = document.querySelector('#paste-btn');
const txtCode = document.getElementById('txtcode');
const dg0btns = document.querySelectorAll('.dg0btn');
const closeBtns = document.querySelectorAll('button.ex');
const yesBtn = document.querySelector('#oi-btns > button:nth-child(2)');
const resultBtn = document.querySelector('#submitted-dg button');
const progressbar = document.querySelector('.progressbar');
const scorebar = document.querySelector('#score-dg > div > div:nth-child(3)');
const form = document.querySelector('div#form');

//STORE TEST DURATION MILLISECONDS IN CACHE TO EXPIRE AFTERWARDS
// const SUBJECT = new URL(location.href).searchParams.get('sb');
const loc = location.href.lastIndexOf('=');
const SUBJECT = location.href.slice(loc + 1);
const CATNO = parseInt(new URL(location.href).searchParams.get('ct'));

//SESSION STORAGE ITEMS
let ssSTUDENT = JSON.parse(sessionStorage.getItem('snapshot'));
let ssTEST = JSON.parse(sessionStorage.getItem(SUBJECT)).filter(({catNo}) => catNo == CATNO)[0];

const classConfiguration = configs[configs[7].indexOf(ssSTUDENT.class)];
var app = initializeApp(classConfiguration)
var db = getFirestore(app);

const today = Date.now();
const month = new Date(today).getUTCMonth();
let score = 0,
    session = month >= 8 ? String(new Date(today).getUTCFullYear()+1) : String(new Date(today).getUTCFullYear()),
    term = 0;
switch (true) {
    case month <= 3:
        term = 1;
        break;
    case month <= 7:
        term = 2;
        break;
    default:
        term = 0;
        break;
}

let NULLS = new Array(8);
NULLS.fill(null);
//check if test has been earlier taken, before display startupDialog
const userDIV = document.querySelector('div.user');
const clock = document.querySelector('#clock');

const getref = await getDoc(doc(db, 'session', session, 'students', ssSTUDENT.id, 'scores', 'records'));
const res = getref.get(SUBJECT)?.[term] || NULLS;
const start = [,0,2,4,6][CATNO];

if (res[start] != null) {   
    yesBtn.classList.remove('clk');
    yesBtn.closest('dialog').close();
    const err = "This particular test has been sat for.";
    const errnote = document.querySelector('.errnote');
    errnote.querySelector('span').textContent = err;
    errnote.classList.add('shw');
    const errID = setTimeout(() => {
        errnote.classList.remove('shw');
        clearTimeout(errID);
    }, 5000);
} else {
    startupDialog.show();
}
clock.classList.remove('load');
//const, var, let of FUNCTIONS
let didNotAnswer = 0;
let answered = new Array(ssTEST.questions).fill(null);
let dur = ssTEST.duration;
let time = dur * 60;

function updateHeaderTree () {
    //catNo
    document.querySelector('div.hdd > i').textContent = ['01','02','03','Ex'][ssTEST.catNo - 1];
    userDIV.querySelectorAll('span').forEach((span, idx) => {
        span.textContent = [`${ssSTUDENT.first_name} ${ssSTUDENT.last_name}`, ssSTUDENT.offered[SUBJECT], ssSTUDENT.class][idx];
    });

    userDIV.classList.remove('load');
    let li = '';
    ssTEST.instr.forEach(ins => li += `<li>${ins}</li>`);
    document.querySelector('#instr-dg menu').innerHTML = li;
    
    startupDialog.querySelectorAll('div:nth-child(2) > div:nth-child(1), div:nth-child(2) > div:nth-child(2)').forEach((div, idx) => {
        div.textContent = [ssSTUDENT.offered[SUBJECT], `${ssTEST.questions} questions / ${ssTEST.duration} mins`][idx];
    });

    const h = Math.floor((dur * 60) / 60 / 60), m = Math.floor((dur * 60) / 60) % 60;
    timeElem.innerHTML = `${h} : ${m < 10 ? '0' + m : m} : 00`;

    oculus.insertAdjacentHTML('afterend', `<span class='ctr'>0</span> / ${ssTEST.questions}`);
    
    document.getElementById('date').textContent = ssTEST.startDate;
}

//closing dialogs
closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('dialog').forEach(dia => {
            if (dia.contains(e.target)) {
                dia.close();
            }
            if (dia.id == 'score-dg') {
                progressbar.setAttribute('aria-value', '0');
                progressbar.style.setProperty("--progress", '0');
                progressbar.toggleAttribute('data-bullseye', false);
                scorebar.classList.remove('sco');
            }
        });
    });
});
//info btn
infoBtn.onclick = () => {
    document.querySelector('#instr-dg').showModal();
}
//oculus
oculus.onclick = () => {
    oculus.classList.toggle('clk');
    document.querySelectorAll('div.fmgrp').forEach(div => div.classList.toggle('slt'));
}
//paste btn
pasteBtn.onclick = () => {
    txtCode.value = '';
    navigator.clipboard.readText().then(cliptxt => {
        txtCode.value = cliptxt;
    });
}
//start btn
let timeElapsed;
dg0btns[0].addEventListener('click', (e) => {
    e.target.disabled = true;
    document.documentElement.requestFullscreen().then((res) => {
        updateFormTree(ssTEST.questions);
        img.addEventListener('load', (e) => {
            img.style.opacity = '1';
            let id = setInterval(() => {
                timeElapsed = countdown();
                if (timeElapsed) {
                    clearInterval(id);
                }
            }, 1000);
        });
    
        img.src = ssTEST.link;
        startupDialog.close();
    });
});
//code btn
dg0btns[1].addEventListener('click', async (e) => {
    await startup(txtCode, e.target);
});
txtCode.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') await startup(e.target, dg0btns[1]);
});
//submit test request btn
const submitDialog = document.querySelector('dialog#subreq-dg');
submitBtn.addEventListener('click', () => {
    if (timeElapsed) {
        submitDialog.querySelector('div > div:first-of-type').textContent = 'Submitting test...';
        submitDialog.querySelector('#oi-btns').children[0].style.visibility = 'hidden';
        yesBtn.click();
    }
    submitDialog.showModal();
});
//YES btn
let mark = 0;
yesBtn.addEventListener('click', async (e) => {
    const par = e.target.parentElement;
    const chdrn = [...par.children];
    chdrn.forEach(ch => ch.disabled = true);
    yesBtn.classList.add('clk');
    [form, submitBtn].forEach(elem => elem.classList.add('dsbd'));
    //stop timepiece
    timeElapsed = true;

    //calculate test mark
    markTest();
    //save test score
    await saveScore();
});
//result btn
resultBtn.addEventListener('click', (e) => {
    scorebar.textContent = `${mark} / ${ssTEST.questions}`;
    const cent = mark / ssTEST.questions * 100;
    let scorePercent = parseInt(cent.toFixed());
    scoreDialog.showModal();
    let progress = 0;

    var intervalID = setInterval(() => {
        updateprogress(progress);
        if (progress == scorePercent) {
            clearInterval(intervalID);
            progressbar.toggleAttribute('data-bullseye', true);
            scorebar.classList.add('sco');
        }
        progress += 1;
    }, 50);
});
/***** FUNCTIONS *****/
async function startup(input, button) {
    button.disabled = true;
    dg0btns[1].classList.add('clk');

    if (input.value === ssTEST.code) {
        const q = query(collection(db, 'activities', 'test', SUBJECT), where('code', '==', ssTEST.code), limit(1));
        const testRef = await getDocs(q);
        if (testRef.empty) return alert("No docs found.");
        dur = testRef.docs[0].get('duration');
        let dt = Date.now();
        let [h, m] = testRef.docs[0].get('startTime').split(':');
        let ulimit = 15;   //15 i.e. 1500, school close time
        const d = new Date(testRef.docs[0].get('startDate')).setHours(Number(h), Number(m));
        const e = new Date(testRef.docs[0].get('startDate')).setHours(ulimit, Number(m) + dur);
        if (!(ssSTUDENT.admission_no.startsWith('DCA')) || d < dt && e > dt) {
            ssTEST.chosen = testRef.docs[0].get('chosen');
            updateHeaderTree();
            startupDialog.classList.add('start');
            dg0btns[0].focus();
        } else {
            startupDialog.firstElementChild.firstElementChild.innerHTML = d > dt ? '<b>TEST PENDING.</b> However, ensure system time and date are correct.' : '<b>TEST ELAPSED.</b> However, ensure system time and date are correct.';
            startupDialog.classList.add('error');
            let tid = setTimeout(() => {
                startupDialog.classList.remove('error');
                button.disabled = false;
                clearTimeout(tid);
            }, 5000);
        }
    } else {
        startupDialog.firstElementChild.firstElementChild.textContent = 'Invalid code.';
        startupDialog.classList.add('error');
        let toid = setTimeout(() => {
            startupDialog.classList.remove('error');
            button.disabled = false;
            clearTimeout(toid);
        }, 1500);
    }
    dg0btns[1].classList.remove('clk');
}
function updateprogress(progress) {
    progressbar.setAttribute('aria-value', progress);
    progressbar.style.setProperty("--progress", progress + "%");
}
function updateFormTree (n) {
    const choice = ssTEST.choice;
    let btns = '';
    for (let l = 0; l < choice; l++) {btns += `<button type="button"><span>${['A','B','C','D','E'][l]}</span></button>`}
    for (let i = 1; i <= n; i++) {
        form.insertAdjacentHTML('beforeend', `
            <div class="fmgrp">
                <button type="button"><span>${i}</span></button>
                ${btns}
            </div>
        `);
    }

    const optBtns = document.querySelectorAll('.fmgrp > button');
    optBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const par = e.target.parentElement;
            const chdrn = [...par.children];
            chdrn.forEach(c => c.classList.remove('slt'));

            const idx = chdrn.indexOf(e.target);
            par.children[idx].classList.add('slt');
            const firstElemChild = par.children[0]
            firstElemChild.classList.add('sol');

            const start = Number(firstElemChild.textContent) - 1;
            answered.splice(start, 1, idx);

            const opt = answered.filter(x => Boolean(x)).length;
            document.querySelector('span.ctr').textContent = opt;
        });
    });

    //show submitBtn
    submitBtn.removeAttribute('style');
}
const fx = 100 / time;
let lvl = 0;

function countdown () {
    const h = Math.floor(time / 60 / 60);
    let m = Math.floor(time / 60) % 60;
    let s = Math.floor(time % 60);

    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    timeElem.innerHTML = `${h} : ${m} : ${s}`;
    time--;
    lvl = lvl + fx;
    clock.style.setProperty('--grad-lvl', lvl + '%');

    if (h + m + s == 0) {
        timeElapsed = true;
        submitBtn.click();
    }
    return timeElapsed;
}
function markTest () {
    const chosen = ssTEST.chosen;
    const fmgrp = document.querySelectorAll('.fmgrp');
    let mark_scheme = chosen.map((x, i) => x == answered[i] ? true : Number(x));
    for (let i = 0; i < chosen.length; i++) {
        if (typeof mark_scheme[i] == 'boolean') {
            fmgrp[i].querySelector('button.slt').classList.add('rgt');
        } else {
            try {
                fmgrp[i].querySelector('button.slt').classList.add('wrg');
                fmgrp[i].children[mark_scheme[i]].classList.add('spare');
            } catch {
                didNotAnswer++;
            }
            fmgrp[i].querySelectorAll('button:not(:first-of-type, .wrg, .spare)').forEach(btn => {
                if (btn != fmgrp[i].children[mark_scheme[i]]) btn.firstElementChild.innerHTML = '&bullet;';
            });
        }
    }
}
//submit test score
// console.log(ssSTUDENT.id)
async function saveScore () {
    //calc score
    const f = answered.filter((a, i) => a == ssTEST.chosen[i]);
    mark = f.length;
    score = Number((mark*ssTEST.rating/ssTEST.questions).toFixed(1));
    //try catch the following
        //instantiate a transaction to:
            //get current array of scores for this subject
    try {
        let tx = await runTransaction(db, async transaction => {           
            res.splice(start, 1, score);
            //update the array of scores for this subject
            const setref = transaction.set(doc(db, 'session', session, 'students', ssSTUDENT.id, 'scores', 'records'), {
                [SUBJECT]: {[term]: res}
            }, {merge: true});
            //save ANSWERED array with timestamp
            const setref1 = transaction.set(doc(db, 'session', session, 'students', ssSTUDENT.id, 'CBT', ssSTUDENT.id), {
                'Q': answered.length,
                'A': answered,
                'C': didNotAnswer,
                'dateModified': serverTimestamp()
            });
            yesBtn.closest('dialog').close();
            yesBtn.classList.remove('clk');
            document.querySelector('#submitted-dg').show();
            oculus.classList.add('activate');
            document.querySelector('section > aside:nth-child(2)').classList.add('slt');
        });
    } catch (error) {
        console.log(error);
        //if catch err, reactivate submitBtn and remove clk from YES btn classlist
        submitDialog.querySelector('div > div:first-of-type').textContent = 'Try again. Click Yes to submit the test.';
        yesBtn.classList.remove('clk');
        // submitBtn.classList.remove('dsbd');
    }
}
//logout event
document.querySelector('#logout').addEventListener('click', () => {
    //clear sessionStorage and navigate home
    sessionStorage.clear();
    location.replace('../dist/logon.html');
});
//view test details
document.querySelector('.hde > button').addEventListener('click', (e) => e.target.classList.toggle('focus'));
/*
CBT Re-adjustments
1 - Store whether test was submitted by user or the user-agent
2 - Store time remaining during cbt
*/
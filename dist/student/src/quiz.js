// document.querySelector('#submitted-dg').show();

const startupDialog = document.querySelector('#startup-dg');
const scoreDialog = document.querySelector('#score-dg');

startupDialog.show();

const timeElem = document.querySelector('span#cdtmr > i');
const infoBtn = document.querySelector('#info-btn');
const oculus = document.querySelector('button.oculus');
const fmgrps = document.querySelectorAll('div.fmgrp');
const submitBtn = document.querySelector('#submit-btn');
const pasteBtn = document.querySelector('#paste-btn');
const txtCode = document.getElementById('txtcode');
const dg0btns = document.querySelectorAll('.dg0btn');
const closeBtns = document.querySelectorAll('button.ex');
const yesBtn = document.querySelector('#oi-btns > button:nth-child(2)');
const resultBtn = document.querySelector('#submitted-dg button');
const progressbar = document.querySelector('.progressbar');
const scorebar = document.querySelector('#score-dg > div > div:nth-child(3)');

//SESSION STORAGE ITEMS
//ss.ENG = subject,//
const test = `{
    "instr": [
        "Answer All Questions"
    ],
    "chosen": [
        "4",
        "1",
        "3",
        "4",
        "1",
        "4",
        "3",
        "3",
        "4",
        "2",
        "2",
        "3",
        "2",
        "1",
        "2",
        "3",
        "4",
        "1",
        "3",
        "2",
        "2",
        "3",
        "3",
        "2",
        "3",
        "3",
        "1",
        "3",
        "4",
        "2",
        "1",
        "1",
        "1",
        "3",
        "4",
        "4",
        "1",
        "1",
        "2",
        "4"
    ],
    "link": "https://firebasestorage.googleapis.com/v0/b/jss-1-d8b98.appspot.com/o/files%2Ftest%2FENG%2FENG%20JSS1%203RD%20TERM%20EXAM%202024.png?alt=media&token=025207dc-3147-4243-bc19-6d1ea6fe33d5",
    "rating": 20,
    "duration": 1,
    "choice": 4,
    "catNo": 4,
    "startTime": "18:52",
    "questions": 40,
    "name": "ENG JSS1 3RD TERM EXAM 2024.png",
    "startDate": "2024-10-04",
    "code": "8XH94ZRA"
}`;

//ss.snapshot = student
const student = `{
    "id": "R7qu1iKtYYmqQcRKLowJ",
    "first_name": "Ada",
    "last_name": "Lovelace",
    "other_name": "",
    "gender": "F",
    "admission_no": "DCA/00/0002",
    "session": "2025",
    "arm": "Classic",
    "class": "JSS 1",
    "em": "DCA/00/0002",
    "pwd": "VMKT30C",
    "photo_src": "https://firebasestorage.googleapis.com/v0/b/jss-1-d8b98.appspot.com/o/img%2F2025%2FJSS%201%2FR7qu1iKtYYmqQcRKLowJ.jpeg?alt=media&token=d4a8364e-6cdf-4a8a-91da-4a9d7f4ae1b1",
    "offered": {
        "ENG": "English Language",
        "MTH": "Mathematics",
        "ICT": "Computer Studies"
    }
}`;

const ssTEST = JSON.parse(test);
const ssSTUDENT = JSON.parse(student);

const dur = ssTEST.duration;
let time = dur * 60;

function updateHeaderTree () {
    //catNo
    document.querySelector('div.hdd > i').textContent = ['01','02','03','Ex'][ssTEST.catNo - 1];
    
    document.querySelectorAll('div.user > span').forEach((span, idx) => {
        span.textContent = [`${ssSTUDENT.first_name} ${ssSTUDENT.last_name}`, ssSTUDENT.offered.ENG, ssSTUDENT.class][idx];
    });

    let li = '';
    ssTEST.instr.forEach(ins => li += `<li>${ins}</li>`);
    document.querySelector('#instr-dg menu').innerHTML = li;
    
    startupDialog.querySelectorAll('div:nth-child(2) > div:nth-child(1), div:nth-child(2) > div:nth-child(2)').forEach((div, idx) => {
        div.textContent = [ssSTUDENT.offered.ENG, `${ssTEST.questions} questions / ${ssTEST.duration} mins`][idx];
    });

    const h = Math.floor((dur * 60) / 60 / 60), m = Math.floor((dur * 60) / 60) % 60;
    timeElem.innerHTML = `${h} : ${m < 10 ? '0' + m : m} : 00`;

    oculus.insertAdjacentHTML('afterend', `<span class='ctr'>0</span> / ${ssTEST.questions}`);
    
    document.getElementById('date').textContent = ssTEST.startDate;
    
    updateFormTree(ssTEST.questions);
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
                progressbar.toggleAttribute('data-bullseye');
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
    fmgrps.forEach(div => div.classList.toggle('slt'));
}
//paste btn
pasteBtn.onclick = () => {
    txtCode.value = '';
    navigator.clipboard.readText().then(cliptxt => {
        txtCode.value = cliptxt;
    });
}
//start btn
dg0btns[0].addEventListener('click', (e) => {
    e.target.disabled = true;
    startupDialog.close();
    let id = setInterval(() => {
        const timeElapsed = countdown();
        if (timeElapsed) clearInterval(id);
    }, 1000);
    // dg0btns[0].classList.add('clk');
})
//code btn
dg0btns[1].addEventListener('click', (e) => {
    startup(txtCode, e.target);
});
txtCode.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') startup(e.target, dg0btns[1]);
});
//submit test request btn
submitBtn.addEventListener('click', () => {
    document.querySelector('dialog#subreq-dg').showModal();
});
//submit YES btn
yesBtn.addEventListener('click', (e) => {
    const par = e.target.parentElement;
    const chdrn = [...par.children];
    chdrn.forEach(ch => ch.disabled = true);
    yesBtn.classList.add('clk');
});
//result btn
const score = 38;
scorebar.textContent = `${score} / ${ssTEST.questions}`;
const cent = score / ssTEST.questions * 100;
let scorePercent = parseInt(cent.toFixed());
resultBtn.addEventListener('click', (e) => {
    scoreDialog.showModal();
    let progress = 0;

    var intervalID = setInterval(() => {
        progress += 1;
        updateprogress(progress);
        if (progress == scorePercent) {
            clearInterval(intervalID);
            progressbar.toggleAttribute('data-bullseye');
            scorebar.classList.add('sco');
        }
    }, 50);
});

/***** FUNCTIONS *****/
//const, let, var of functions
// const cbtArray = new Array(ssTEST.questions);
function startup(input, button) {
    button.disabled = true;
    dg0btns[1].classList.add('clk');
    let toid = setTimeout(() => {
        if (input.value === 'passcode') {
            updateHeaderTree();
            startupDialog.classList.add('start');
            clearTimeout(toid);
        } else {
            startupDialog.classList.add('error');
            let toidInner = setTimeout(() => {
                startupDialog.classList.remove('error');
                button.disabled = false;
                clearTimeout(toidInner);
            }, 1500);
        }
        dg0btns[1].classList.remove('clk');
    }, 1500);
}
function updateprogress(progress) {
    progressbar.setAttribute('aria-value', progress);
    progressbar.style.setProperty("--progress", progress + "%");
}
function updateFormTree (n) {
    const form = document.querySelector('div#form');
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
}
function countdown () {
    const h = Math.floor(time / 60 / 60);
    let m = Math.floor(time / 60) % 60;
    let s = Math.floor(time % 60);

    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    timeElem.innerHTML = `${h} : ${m} : ${s}`;
    time--;

    if (h + m + s == 0) return true;
}





/*
const asideP = document.querySelectorAll('aside > p');
asideP.forEach(p => {
    p.addEventListener('click', (e) => {
        const par = e.target.parentElement;
        const chdrn = [...par.children];
        console.log(chdrn.indexOf(e.target));
        chdrn.forEach(c => c.classList.toggle('slt', c == e.target));
        par.previousElementSibling.classList.add('slt');
    });
});
*/

/*
const form = document.forms.namedItem('multi-choice-form');
const fader = document.querySelector('#light-dark-fader');
fader.addEventListener('mousemove', (e) => {
    // console.log(e.target.value);
    let x = Number(e.target.value / 100);
    form.style.opacity = Number((x).toFixed(1));
});

const multiChoiceBtn = document.querySelector("button#multi-choice-btn");
multiChoiceBtn.addEventListener('click', (e) => {
    e.target.parentElement.classList.toggle('on');
});
*/

const startupDialog = document.querySelector('#startup-dg');
const scoreDialog = document.querySelector('#score-dg');

startupDialog.show();

const timeElem = document.querySelector('span#cdtmr > i');
const infoBtn = document.querySelector('#info-btn');
const oculus = document.querySelector('button.oculus');
const /*iframe = document.querySelector('iframe'), */img = document.querySelector('aside:nth-child(2) > img');
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

//const, var, let of FUNCTIONS
let didNotAnswer = 0;
let answered = new Array(ssTEST.questions);
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
    
    updateFormTree(ssTEST.questions);
    img.addEventListener('load', (e) => {
        img.style.opacity = '1';
        let id = setInterval(() => {
            timeElapsed = countdown();
            if (timeElapsed) clearInterval(id);
        }, 1000);
    });

    img.src = ssTEST.link;
    startupDialog.close();
});
//code btn
dg0btns[1].addEventListener('click', (e) => {
    startup(txtCode, e.target);
});
txtCode.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') startup(e.target, dg0btns[1]);
});
//submit test request btn
let autoSubmit = false;
submitBtn.addEventListener('click', () => {
    const submitDialog = document.querySelector('dialog#subreq-dg');
    
    if (autoSubmit) {
        submitDialog.querySelector('div > div:first-of-type').textContent = 'Submitting test...';
        submitDialog.querySelector('#io-btns').children[0].style.visibility = 'hidden';
        yesBtn.click();
    }
    submitDialog.showModal();
});
//submit YES btn
let mark = 0;
yesBtn.addEventListener('click', (e) => {
    const par = e.target.parentElement;
    const chdrn = [...par.children];
    chdrn.forEach(ch => ch.disabled = true);
    yesBtn.classList.add('clk');
    
    form.classList.add('dsbd');
    timeElapsed = true;
    //calculate test mark
    const f = answered.filter((a, i) => a == ssTEST.chosen[i]);
    mark = f.length;
    let id = setTimeout(() => {
        clearTimeout(id);
        markTest();
        yesBtn.closest('dialog').close();
        yesBtn.classList.remove('clk');
        document.querySelector('#submitted-dg').show();
        oculus.classList.add('activate');
        document.querySelector('section > aside:nth-child(2)').classList.add('slt');
    }, 3000);
});
//result btn
resultBtn.addEventListener('click', (e) => {
    scorebar.textContent = `${mark} / ${ssTEST.questions}`;
    const cent = mark / ssTEST.questions * 100;
    let scorePercent = parseInt(cent.toFixed());
    scoreDialog.showModal();
    let progress = 0;

    var intervalID = setInterval(() => {
        progress += 1;
        updateprogress(progress);
        if (progress == scorePercent) {
            clearInterval(intervalID);
            progressbar.toggleAttribute('data-bullseye', true);
            scorebar.classList.add('sco');
            console.log(didNotAnswer);
        }
    }, 50);
});

/***** FUNCTIONS *****/
function startup(input, button) {
    button.disabled = true;
    dg0btns[1].classList.add('clk');
    let toid = setTimeout(() => {
        if (input.value === ssTEST.code) {
            updateHeaderTree();
            startupDialog.classList.add('start');
            dg0btns[0].focus();
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
}
function countdown () {
    const h = Math.floor(time / 60 / 60);
    let m = Math.floor(time / 60) % 60;
    let s = Math.floor(time % 60);

    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    timeElem.innerHTML = `${h} : ${m} : ${s}`;
    time--;

    if (h + m + s == 0) {
        timeElapsed = true;
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
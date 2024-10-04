// document.querySelector('#startup-dg').show();
document.querySelector('#submitted-dg').show();

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

const scoreDialog = document.querySelector('#score-dg');

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
    // dg0btns[0].classList.add('clk');
})
//code btn
dg0btns[1].addEventListener('click', (e) => {
    e.target.disabled = true;
    dg0btns[1].classList.add('clk');
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
const numOfQuestions = 100;
const score = 70;
scorebar.textContent = `${score} / ${numOfQuestions}`;
const cent = score / numOfQuestions * 100;
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

function updateprogress(progress) {
    progressbar.setAttribute('aria-value', progress);
    progressbar.style.setProperty("--progress", progress + "%");
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
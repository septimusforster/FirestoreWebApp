document.querySelector('#startup-dg').show();

const oculus = document.querySelector('button.oculus');
const fmgrps = document.querySelectorAll('div.fmgrp');
const pasteBtn = document.querySelector('#paste-btn');
const txtCode = document.getElementById('txtcode');
const dg0btns = document.querySelectorAll('.dg0btn');

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
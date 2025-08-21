import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc,updateDoc, getDocs, setDoc, query, where, and, or, serverTimestamp} from "firebase/firestore";
import configs from "../../src/JSON/configurations.json" assert {type: 'json'};

var app, db;
function useApp(n){
    if (app) deleteApp(app);
    app = initializeApp(configs[n]);
    db = getFirestore(app);
}
//logout
document.querySelector('.tab.out+i').addEventListener('click', (e) => {
    localStorage.clear();
    location.replace('logon.html');
});
//nav tabs
document.querySelector('nav').addEventListener('click', (e) => {
    if (e.target.className.includes('tab')) e.currentTarget.classList.toggle('opn');
})
/*get curr timestamp*/
const cstmp = Date.now();
let now = new Date(cstmp);
const ssn = (now.getMonth() > 9 ? now.getFullYear()+1 : now.getFullYear()).toString();
const term = function(n){
    let x = new Date(n).getUTCMonth();
    if(x<=3){
        return 1;
    }else if(x<=7){
        return 2;
    }else{
        return 0;
    }
}(now);
let mois = JSON.parse(sessionStorage.getItem('mois'));
useApp(mois.cls);
//listen and handle refresh
window.addEventListener('beforeunload', (e) => {
    if (navigator.userActivation.hasBeenActive) {   //has user interacted with page even once
        e.preventDefault();
        console.log("Reload rejected.");
    }
});
//get and store test array in fb_arr
let start = '';
let fb_arr = new Array(8).fill(null);
(async function postWorker(){
    const wkr = new Worker(new URL('worker.js', import.meta.url));
    wkr.postMessage({mois, ssn});
    wkr.onmessage = (e) => {
        if(e.data == "Worker-based Error.") {
            ntwkChk('off', 'Retrying connection...', 5000);
            const wkr_id = setTimeout(() => {
                postWorker();
                clearTimeout(wkr_id);
            },10000);
        }else{
            ntwkChk('on','Connection established.', 5000);
            fb_arr = e.data;
        }
    }
})();
//fetch server timestamp
let fb_stamp = null, try_fetch = 0;
(async function fetchStamp(){
    if (!fb_stamp) {
        try{
            await updateDoc(doc(db, 'session',ssn,'students',mois.id),{'modAt': serverTimestamp()});
            const millisec = (await getDoc(doc(db,'session',ssn,'students',mois.id))).get('modAt').seconds;
            fb_stamp = parseInt(millisec+'000');
            ntwkChk('on','Files online.', 5000);
            
            //nav lnks drp dwn mnu
            document.querySelectorAll('.lnk>i').forEach((lk,lx,ls) => lk.addEventListener('mouseenter', (e) => {
                if(lk.className.includes('dp')) lk.classList.remove('dp');
                ls.forEach(elt => elt.classList.toggle('dp', e.target == elt));
                // if (e.target.previousElementSibling.className.includes('out')){
                // }
            }));
            document.querySelectorAll('.lnk>i').forEach((lk,lx,ls) => lk.addEventListener('mouseleave', (e) => {
                lk.classList.remove('dp');
            }));
        }catch(err){
            try_fetch++;
            try_fetch < 5 ? fetchStamp() : ntwkChk('off','Bad network. Restart the program.');
            // console.log(err);
        }
    }else{
        fetchStamp();
    }
})();
//update ME
const clsNames = ['7th Grade','8th Grade','9th Grade','10th Grade','11th Grade','12th Grade'];
const ME = document.getElementById('me');
const pg_hdg = document.querySelector('header>span:nth-child(1)');
const section = document.querySelector('section');
const tmer = document.getElementById('tmer');
const holder = document.getElementById('holder');
const tstImg = document.getElementById('tst_img');
const loading = document.querySelector('.loading');
ME.firstElementChild.textContent = `${mois.last_name + " " + mois.first_name + " " + mois.other_name || ''}`;
ME.lastElementChild.textContent = `${clsNames[mois.cls] + " " + mois.arm}`;
const sbjMnu = document.querySelector('.sbj_mnu');
//listen for fullscreen change
document.body.addEventListener('fullscreenchange', (e) => {
    if(document.fullscreenElement){
        tstImg.setAttribute('style', 'height:900px;');
        holder.setAttribute('style', 'max-height:720px;');
    }else{
        tstImg.removeAttribute('style');
        holder.removeAttribute('style');
    }
})
//get 'offered' from mois
for(const k in mois.offered) sbjMnu.insertAdjacentHTML('beforeend', `<div data-ofd="${k}">${mois.offered[k]}</div>`);
//sbj menu
let ofd, ofd_n, cbts = {};
sbjMnu.addEventListener('click', async (e) => {
    if (e.target.tagName === 'DIV' && e.target.className === ''){
        //fetch sbjs
        loading.classList.toggle('run');
        ofd = e.target.dataset.ofd;
        try{
            if(ofd in cbts){
                loadCBT(cbts[ofd])
            }else{
                const q = collection(db, 'activities', 'test', ofd);
                const tests = await getDocs(q);
                if (tests.size) {
                    const m = tests.docs.map(tst => tst.data());
                    cbts[ofd] = m;
                    loadCBT(m);
                }
            }
        }catch(err){
            console.log(err);
        }finally{
            loading.classList.remove('run');
        }
        pg_hdg.textContent = e.target.textContent;
    }
});
function loadCBT(cbt){
    section.innerHTML='';
    // console.log(fb_stamp);
    cbt.forEach((d,x) => {
        section.insertAdjacentHTML('beforeend', `
            <div class="ui_card" data-cat="${d.catNo}">
                <p>Assessment ${d.catNo}</p>
                <p>${Intl.DateTimeFormat('en-US', {dateStyle: 'full'}).format(new Date(d.startDate))}</p>
                <div class="code">
                    ${Boolean(fb_stamp>new Date(d.startDate+'T'+d.startTime).getTime()-60e3) && Boolean(fb_stamp<new Date(d.startDate+'T'+d.startTime).setHours(15) + (d.duration*60e3)) ? `<code>${d.code}</code><div class="btn copy">COPY</div>` : "<code>NOT AVAILABLE</code>"}
                </div>
                <div class="actn">
                    <span>${d.questions}</span><span>${d.rating}</span><span>${d.duration>60?Math.floor(d.duration/60)+','+d.duration%60:d.duration}</span>
                </div>
            </div>
        `);
    });
}
/*cbt script*/
//tst event listener
const pop_code = document.getElementById('pop_code');
const rez_pop = document.getElementById('rez_pop');
const input_code = pop_code.querySelector('input#cde');
section.addEventListener('click', (e) => {
    if ((e.target.className).includes('copy')) {
        const x = e.target.closest('.ui_card').getAttribute('data-cat');
        ofd_n = [...e.currentTarget.children].indexOf(e.target.closest('.ui_card'));
        console.log(ofd_n);
        input_code.setAttribute('placeholder', `Enter Code for #${x}`);
        input_code.setAttribute('value', e.target.previousElementSibling.innerText);
        pop_code.showPopover();
    }
});
//select options
let ans, runtm, test_over = false, choice = '', alpha = 'ABCDEF', fb_data;
const answd = document.getElementById('answd');
holder.addEventListener('click', forHolder);
function forHolder(e){
    if (e.target.tagName === 'I') {
        const t = e.target;
        const p = t.parentElement;
        ans.splice(parseInt(p.firstElementChild.textContent)-1,1,alpha.indexOf(t.textContent)+1);
        localStorage.setItem(ofd+ofd_n, JSON.stringify({[runtm]: ans}));
        p.querySelectorAll('i').forEach(i => i.classList.toggle('pk', i === t));
        answd.textContent = e.currentTarget.querySelectorAll('i.pk').length;
    };
}
const fms = document.forms;
//cde fm
const screen = document.getElementById('screen');
const cde_fm = fms.namedItem('cde_fm');
cde_fm.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = cbts[ofd][ofd_n];
    const gtm = new Date(c.startDate+"T"+c.startTime)-60e3; //get start time, 1 min early
    const gdu = new Date(gtm).setHours(15) + (c.duration*60e3); //duration: school close
    // const gdu = gtm + (c.duration*60*1000); //duration: normal human beings

    if(input_code.value !== c.code) return e.target.setAttribute('data-err', 'Incorrect code.');
    if(fb_stamp < gtm || fb_stamp > gdu) return e.target.setAttribute('data-err', 'Permission denied.');

    fb_data = fb_arr[ofd][term];
    start = [0,2,4,6][c.catNo-1];
    if(fb_data[start] !== null){
        e.target.setAttribute('data-err','Test already sat for.');
    }else{
        pop_code.hidePopover();
        //scr header and time set
        document.querySelector('.scr_hr>span:nth-child(2)').innerHTML = `${pg_hdg.textContent} &bull; ${clsNames[mois.cls]} &bull; #${ofd_n+1}`;
        tmer.textContent = `${c.duration} : 00`;
        screen.removeAttribute('style');
        console.log("Index where test will be recorded:", start);
    }
});
pop_code.addEventListener('toggle', (e) => {
    if (e.oldState == 'closed') {
        cde_fm.removeAttribute('data-err');
        cde_fm.reset();
    }
});
//bck btn
const readyBtn = document.getElementById('ready');
document.querySelector('.btn.bck').onclick = function(){
    screen.setAttribute('style','display:none;');
    tstImg.removeAttribute('style'),tstImg.innerHTML='';
    tmer.removeAttribute('style'),tmer.innerHTML='';
    answd.innerHTML=0;
    holder.innerHTML='';
    test_over=false;
    readyBtn.textContent='Start';
}
//ready DOM
let tst;
readyBtn.addEventListener('click', (e) => {
    if (test_over) {
        rez_pop.showPopover();
        return;
    }
    document.querySelector('.btn.bck').setAttribute('style','display:none;');
    e.target.style.display = 'none';
    loading.classList.add('run');
    //insert img file
    tst = cbts[ofd][ofd_n];
    if(localStorage?.[ofd+ofd_n]){
        runtm = Object.keys(JSON.parse(localStorage.getItem(ofd+ofd_n)))[0];
        ans = Object.values(JSON.parse(localStorage.getItem(ofd+ofd_n)))[0];
    }else{
        runtm = tst.duration * 60;
        ans = new Array(tst.questions).fill(null);
    }

    const img_file = document.createElement('img');
    img_file.setAttribute('src', tst.link);
    img_file.onload = () => {
        //insert multi-choice
        holder.innerHTML='';
        for(let ch = 0; ch < tst.choice; ch++) choice += `<i>${alpha[ch]}</i>`;
        for (let qn = 0; qn < tst.questions; qn++){
            holder.insertAdjacentHTML('beforeend', `
                <div class="ngrp">
                    <span>${qn+1}</span>${choice}
                </div>
            `);
        }
        if (localStorage?.[ofd+ofd_n]) {
            const nepa = Object.values(JSON.parse(localStorage.getItem(ofd+ofd_n)))[0];
            const l = holder.querySelectorAll('.ngrp').length;
            let num = 0;
            for(let m=0;m<l;m++) {
                if(nepa[m] == null) continue;
                holder.querySelectorAll('.ngrp')[m].children[nepa[m]].classList.add('pk');
                num++;
            }
            answd.innerText = num;
        }
        tstImg.appendChild(img_file);
        document.getElementById('scr_bd').removeAttribute('style');
        //start timer
        const cid = setInterval(() => {
            timeElapsed = countdown();
            if (timeElapsed) {
                clearInterval(cid);
            }
        }, 1000);
        loading.classList.remove('run');
    }
});
//countdown func
const sbt_pop = document.getElementById('sbt_pop');
const submtBtn = document.getElementById('okay');
let lvl=0, timeElapsed=false;
function countdown () {
    let [h, m, s] = [Math.floor(runtm / 60 / 60), Math.floor(runtm / 60) % 60, Math.floor(runtm % 60)];
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    tmer.innerText = `${h} : ${m} : ${s}`;
    runtm--;
    lvl = lvl + (100/runtm);
    tmer.style.setProperty('--clk-lvl', lvl + '%');

    if (h + m + s == 0) {
        timeElapsed = true;
        submtBtn.click();
    }
    return timeElapsed;
}
//submitting test...
let total = 0, score = 0;
submtBtn.addEventListener('click', async (e) => {
    sbt_pop.hidePopover();
    try{
        timeElapsed = true;
        holder.removeEventListener('click', forHolder);
    } catch(err){
        console.log(err);
        console.log("Listener already removed.");
    }
    if (!navigator.onLine) {
        ntwkChk('off',"Network disconnected.",5000);
        return;
    }
    loading.classList.add('run');
    const cb = cbts[ofd][ofd_n];
    //calculate score
    const s = Object.values(JSON.parse(localStorage.getItem(ofd+ofd_n)))[0];
    total = cb.chosen.reduce((acc,cvl,cix,arr) => cvl == s[cix] ? acc + 1 : acc + 0, 0);
    console.log("total", total);
    score = (cb.rating*total)/cb.questions;
    console.log("score", score);
    //upload score
    try{
        if(fb_data){
            fb_data.splice(start, 1, score);
            await setDoc(doc(db, 'session', ssn, 'students', mois.id, 'scores', 'records'), {
                [ofd]:{[term]:fb_data}
            },{merge:true});
            //clear localStorage
            localStorage.removeItem(ofd+ofd_n);
            test_over=true;
            document.querySelector('.btn.bck').removeAttribute('style');
            tstImg.style.opacity = .3;
            readyBtn.textContent = 'See Score';
            readyBtn.removeAttribute('style');
        }else{
            ntwkChk('off','Missing record.',5000);
        }
    }catch(err){
        if(err.cause == 'thief') {
            ntwkChk('off',err.message,5000);
        }else{
            console.log(err);
        }
    }finally{
        //change START btn to VIEW SCORE, then display score
        loading.classList.remove('run');
    }
});
rez_pop.addEventListener('toggle', (e) => {
    if (e.newState === 'open'){
        //load score
        rez_pop.querySelector('.scr_bar').textContent = `${(total/tst.questions*100).toFixed()}`.padStart(2,0);
        rez_pop.querySelector('.scr_bar').style.setProperty('--bar-num', `${total/tst.questions*100}%`);
        const scar = document.getElementById('scor');
        scar.children[0].innerText = total; //<sup>
        scar.children[1].innerText = tst.questions; //<sub>
    }
});
const ntwk = document.querySelector('.ntwk');
window.addEventListener('offline', (e) => {
    ntwkChk('off',"Network disconnected.",5000);
});
window.addEventListener('online', (e) => {
    ntwkChk('on', "You're now online.", 5000);
})
function ntwkChk(stat,msg,tmo){
    ntwk.querySelector('span').textContent = msg, ntwk.classList.add('dp',stat);
    const stm = setTimeout(() => {
        ntwk.classList.remove('dp',stat);
    },tmo);
}
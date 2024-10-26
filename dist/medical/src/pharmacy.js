import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";  //"firebase/app";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or, serverTimestamp, orderBy, limit, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";   //"firebase/firestore";
// import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

const cfg = {
    apiKey: "AIzaSyCnGk02gQeUZ9nJeOBxHMk3jlC2_pG_jZo",
    authDomain: "flutterspace-d2385.firebaseapp.com",
    projectId: "flutterspace-d2385",
    storageBucket: "flutterspace-d2385.appspot.com",
    messagingSenderId: "979544012314",
    appId: "1:979544012314:web:c2eef86fccbae61f17c3a3",
    measurementId: "G-5E3NVV96HY"
};

var app = initializeApp(cfg);
var db = getFirestore(app);

const pie = document.querySelector('#pie');
document.addEventListener('DOMContentLoaded', () => {
    caches.open('pgs').then(cache => {
        const css = '../styles/pharmacy.css';
        cache.match(css).then(res => {
            const link = document.createElement('link');
            link.rel='stylesheet';
            if (res && res.ok) {
                link.href = res.url;
                console.log("Found css in cache.");
            } else {
                console.log("Fetching css...")
                link.href = css;
            };
            document.head.appendChild(link);
        }).then(async () => {
            const p = parent.document;
            p.querySelector('.loader').classList.remove('on');
            p.querySelector('iframe').classList.remove('off');
            pie.querySelector('.val').classList.add('throb');
            document.body.removeAttribute('style');
            await dataToTable();
        });
    });
});

const ctbody = document.querySelector('#ctable > tbody');
const tempRow = document.querySelector("[data-tab-template]");
const foot = document.querySelector('div.foot');
let docs = [];

async function dataToTable () {
    //get data from backend
    const Q = query(collection(db, 'category'), orderBy('createdAt','desc'));
    const Snapdocs = await getDocs(Q);
    if (Snapdocs.empty) {
        alert("No data found.");
    } else {
        Snapdocs.docs.forEach((d, x) => {
            let data = d.data();
            docs.push(data);
            let {name, quantity, used} = data.folios;
            let tr = tempRow.content.cloneNode(true).children[0];
            for (let i = 1; i < 4; i++) tr.querySelector('td:nth-child('+i+')').textContent = [x+1, name, `${used} / ${quantity}`][i-1];
            tr.querySelector('td > .bar').style.setProperty('--bar-width', ((quantity - used) * 100 / quantity) + '%');
            ctbody.appendChild(tr);
        });

        foot.querySelectorAll('i').forEach((et, ix) => {
            et.textContent = [1,1,Snapdocs.size][ix];
        });

        ctbody.querySelectorAll('tr').forEach((rw, ix, ar) => {
            rw.addEventListener('click', (e) => {
                ar.forEach(row => row.classList.toggle('clk', rw == row));
                plotpie(rw);
            });
        });
        
        foot.removeAttribute('style');
    }
    //meanwhile, pie animation active opacity;      
    pie.querySelector('.val').classList.remove('throb');
}
//form init
function initSubmit(elem, clk=true, done=false) {
    elem.disabled = clk;
    elem.classList.toggle('clk', clk);
    const isToggled = elem.classList.toggle('done', done);
    if (isToggled) {
        const id = setTimeout(() => {
            elem.classList.remove('done');
            clearTimeout(id);
        }, 3000);
    }
}
const forms = document.forms;
//insert opts of select#alias
// const categories = configs[9].categories;
const categories = [
    "Antiseptics",
    "Analgesics",
    "Anaesthetics"
];
categories.forEach(cat => {
    forms[0].querySelector('select#alias').insertAdjacentHTML('beforeend', `
        <option value="${cat}">${cat}</option>    
    `);
});
//create category
forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    initSubmit(e.submitter);
    let data = {
        createdAt: Date.now(),
        lastModified: serverTimestamp(),
        folios: {
            used: 0,
        }
    }
    const fd = new FormData(forms[0]);
    for (const [k, v] of fd.entries()) {
        data.folios[k] = Number(v) || v;
    }
    const docRef = await getDoc(doc(db, 'category', data.folios.name));
    if (!docRef.exists()) {
        await setDoc(doc(db,'category', data.folios.name), data);
        initSubmit(e.submitter, false, true);
    } else {
        initSubmit(e.submitter, false);
        alert(`${data.folios.name} has already been categorized.`);
    }
});
//edit category
const txtInputs = document.querySelectorAll('.txtinput');
forms[1].addEventListener('submit', (e) => {
    e.preventDefault();
    initSubmit(e.submitter);
    let data = {};
    txtInputs.forEach(elem => {
        data[elem.previousElementSibling.dataset.for] = Number(elem.textContent) || elem.textContent;
    });
    console.log(data);
    // updateDoc(doc(db, data.name, doc.id), {folios: data});
});
//plot pie
let elem;
function plotpie (tr) {
    const idx = Number(tr.firstElementChild.textContent)-1;
    elem = docs[idx];
    let x = elem.folios;
    pie.firstElementChild.firstChild.textContent = document.querySelector('#preview .ttl').textContent = x.name;
    pie.querySelector('.val').style.setProperty('--con-grad', ((x.quantity - x.used) * 100 / x.quantity) + '%');
    pie.querySelector('.val').dataset.num = ((x.quantity - x.used) * 100 / x.quantity) + '%';
    pie.querySelectorAll('#keys > span').forEach((span, ix) => span.setAttribute('title', [x.used, x.quantity][ix]));

    insertDetails(elem);
}
//insert data details
function insertDetails (data) {
    forms[1].innerHTML = '';
    let folios = data.folios;
    let {name, vendor, quantity, used, desc} = folios;
    let obj = {
        'Name': ['name',name],  //str 'name' is the field path actual name
        'Vendor': ['vendor',vendor],
        'Quantity': ['quantity',quantity],
        'Used': ['used',used],
        'Description': ['desc',desc],
    }

    for (const [k, v] of Object.entries(obj)) {
        forms[1].insertAdjacentHTML('beforeend', `
            <div class="label" data-for="${v[0]}">${k}</div>
            <div class="txtinput" contenteditable="false">${v[1]}</div>
        `);
    }
}
//open details pane
const lastSectionHTML = document.querySelector('section:last-of-type');
const detailsBtn = document.querySelector('.dets');
detailsBtn.addEventListener('click', (e) => {
    lastSectionHTML.classList.add('see');
    lastSectionHTML.classList.remove('off');
});
//close details pane
const previewBtns = document.querySelectorAll('#preview button.chevron.back, #preview > div:nth-child(2) button.times');
previewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        lastSectionHTML.classList.remove('see');
        lastSectionHTML.classList.add('off');
    });
});
//pencil: edit btn
const pencil = document.querySelector('.pencil');
pencil.onclick = () => {
    pencil.parentElement.classList.add('off');
    txtInputs.forEach(elem => elem.setAttribute('contenteditable', 'true'));
}
//times: cancel btn
const times = document.querySelectorAll('.times');
times.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (times[0] == btn) {
            btn.parentElement.nextElementSibling.classList.remove('off');
            txtInputs.forEach(elem => elem.setAttribute('contenteditable', 'false'));
        }
    });
});
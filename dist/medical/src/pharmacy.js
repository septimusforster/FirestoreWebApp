import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";  //"firebase/app";
import { getFirestore, collection, collectionGroup, addDoc, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or, serverTimestamp, orderBy, limit, runTransaction } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";   //"firebase/firestore";
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
                console.log("Fetching css...");
                link.href = css;
            };
            document.head.appendChild(link);
        }).then(async () => {
            const p = parent.document;
            p.querySelector('.loader').classList.remove('on');
            p.querySelector('iframe').classList.remove('off');
            document.body.removeAttribute('style');
        });
    });
});

const selectCategoryBtn = document.querySelector('select#category');
const ctbody = document.querySelector('#ctable > tbody');
const tempRow = document.querySelector("[data-tab-template]");
const foot = document.querySelector('div.foot');
let docs = [];

selectCategoryBtn.addEventListener('change', async (e) => {
    pie.querySelector('.val').classList.add('throb');
    if (e.target.selectedIndex) {
        await dataToTable(e.target.value);
    }
})
async function dataToTable (category) {
    //get data from backend
    const Q = query(collection(db, 'products'), where('name', '==', category), orderBy('createdAt','desc'));
    const Snapdocs = await getDocs(Q);
    if (Snapdocs.empty) {
        alert("No data found.");
    } else {
        //reset
        ctbody.innerHTML = '';
        pie.querySelector('.val').style.setProperty('--con-grad', 0 + '%');
        pie.querySelector('.val').dataset.num = 0 + '%';
        pie.querySelectorAll('#keys > span').forEach(span => span.setAttribute('title', 0));

        Snapdocs.docs.forEach((d, x) => {
            let data = d.data();
            docs.push({[d.id]: data});
            let {drug, quantity, used} = data;
            let tr = tempRow.content.cloneNode(true).children[0];
            for (let i = 1; i < 4; i++) tr.querySelector('td:nth-child('+i+')').textContent = [x+1, drug, `${used} / ${quantity}`][i-1];
            tr.querySelector('td > .bar').style.setProperty('--bar-width', ((quantity - used) * 100 / quantity) + '%');
            ctbody.appendChild(tr);
        });

        // foot.querySelectorAll('i').forEach((et, ix) => {
        //     et.textContent = [1,1,Snapdocs.size][ix];
        // });

        ctbody.querySelectorAll('tr').forEach((rw, ix, ar) => {
            rw.addEventListener('click', (e) => {
                ar.forEach(row => row.classList.toggle('clk', rw == row));
                plotpie(rw);
            });
        });
        
        // foot.removeAttribute('style');
    }
    //meanwhile, pie animation active opacity;      
    pie.querySelector('.val').classList.remove('throb');
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
//form init
function initSubmit(elem, clk=true, done=false) {
    elem.disabled = clk;
    elem.classList.toggle('clk', clk);
    const isToggled = elem.classList.toggle('done', done);
    if (isToggled) {
        const id = setTimeout(() => {
            elem.classList.remove('done');
            if (elem.textContent.toLowerCase() == 'save') previewBtns[1].click();
            clearTimeout(id);
        }, 3000);
    }
}
const forms = document.forms;
//insert opts of select#alias
// const categories = configs[9].categories;
(function addCategories() {
    const categories = [
        "Antiseptics",
        "Analgesics",
        "Anaesthetics"
    ];
    let defaultOpt = '<option value="">Choose category</option>';
    categories.forEach(cat => {
        defaultOpt += `<option value="${cat}">${cat}</option>`;
    });
    document.querySelector('select#category').insertAdjacentHTML('beforeend', defaultOpt);
    forms[0].querySelector('select#alias').insertAdjacentHTML('beforeend', defaultOpt);
})();

//plot pie
let elem;
function plotpie (tr) {
    const idx = Number(tr.firstElementChild.textContent)-1;
    elem = docs[idx];
    let x = Object.values(elem)[0];
    document.querySelector('#preview .ttl').textContent = x.name;
    pie.querySelector('.val').style.setProperty('--con-grad', ((x.quantity - x.used) * 100 / x.quantity) + '%');
    pie.querySelector('.val').dataset.num = ((x.quantity - x.used) * 100 / x.quantity) + '%';
    pie.querySelectorAll('#keys > span').forEach((span, ix) => span.setAttribute('title', [x.used, x.quantity][ix]));

    insertDetails(x);
}
//insert data details
function insertDetails (data) {
    forms[1].innerHTML = '';
    let {name, vendor, quantity, unit, used, desc} = data;
    let obj = {
        'Name': ['name',name],  //str 'name' is the field path actual name
        'Vendor': ['vendor',vendor],
        [`Quantity (in ${unit})`]: ['quantity',quantity],
        'Used': ['used',used],
        'Description': ['desc',desc],
    }

    for (const [k, v] of Object.entries(obj)) {
        forms[1].insertAdjacentHTML('beforeend', `
            <div class="label" data-for="${v[0]}">${k}</div>
            <div class="txtinput" contenteditable="false">${v[1] || 'Nil'}</div>
        `);
    }
}
//create category
forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    initSubmit(e.submitter);
    let data = {
        createdAt: Date.now(),
        lastModified: serverTimestamp(),
        used: 0,
        vendor: '',
        desc: '',
    }
    const fd = new FormData(forms[0]);
    for (const [k, v] of fd.entries()) {
        data[k] = Number(v) || v;
    }
    // console.log(data);
    await addDoc(collection(db,'products'), data);
    forms[0].reset();
    initSubmit(e.submitter, false, true);
});
//edit category
forms[1].addEventListener('submit', async (e) => {
    const txtInputs = document.querySelectorAll('.txtinput');
    e.preventDefault();
    initSubmit(e.submitter);
    let data = {};
    txtInputs.forEach(elem => {
        data[elem.previousElementSibling.dataset.for] = Number(elem.textContent) || elem.textContent;
    });
    const id = Object.keys(elem)[0];

    await updateDoc(doc(db, 'products', id), data);
    for (const [k, v] of Object.entries(data)) {
        Object.values(elem)[0][k] = v;
    }
    initSubmit(e.submitter, false, true);
});
//pencil: edit btn
const pencil = document.querySelector('.pencil');
pencil.onclick = () => {
    const txtInputs = document.querySelectorAll('.txtinput');
    pencil.parentElement.classList.add('off');
    txtInputs.forEach(elem => elem.setAttribute('contenteditable', 'true'));
}
//times: cancel btn
const times = document.querySelectorAll('.times');
times.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const txtInputs = document.querySelectorAll('.txtinput');
        if (times[0] == btn) {
            btn.parentElement.nextElementSibling.classList.remove('off');
            txtInputs.forEach(elem => elem.setAttribute('contenteditable', 'false'));
        }
    });
});
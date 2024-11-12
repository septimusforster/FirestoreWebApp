import { initializeApp } from "firebase/app"; //"https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDocs, updateDoc, query, where, serverTimestamp, orderBy, setDoc, arrayUnion } from "firebase/firestore";  // "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

const cfg = configs[9].appsettings;

var app = initializeApp(cfg);
var db = getFirestore(app);

const p = parent.document;
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
            // document.head.appendChild(link);
        }).then(async () => {
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
        docs = [];

        Snapdocs.docs.forEach((d, x) => {
            let data = d.data();
            docs.push({[d.id]: data});
            let {drug, quantity, available, unit_number} = data;
            let used = Number((available / unit_number).toFixed());
            let tr = tempRow.content.cloneNode(true).children[0];
            for (let i = 1; i < 4; i++) tr.querySelector('td:nth-child('+i+')').textContent = [x+1, drug, `${used} / ${quantity}`][i-1];
            tr.querySelector('td > .bar').style.setProperty('--bar-width', (used * 100 / quantity) + '%');
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
//nav to index page/new cat
const newCat = document.querySelector('.new_cat');
const navCatBtns = document.querySelectorAll('.exst_cat > h5 > button.chevron.back, .exst_cat > button.add, .new_cat > h5 > button.chevron.back');
navCatBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        switch (idx) {
            case 0:
                p.querySelector('iframe').classList.add('off');
                break;
            case 1:
                newCat.classList.remove('off');
                break;
            case 2:
                newCat.classList.add('off');
                break;
            default:
                break;
        }
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
    const categories = configs[9].categories.sort();
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
    let avail = Number((x.available / x.unit_number).toFixed());
    let y = avail * 100 / x.quantity;
    document.querySelector('#preview .ttl').textContent = x.name;
    pie.querySelector('.val').style.setProperty('--con-grad', y + '%');
    pie.querySelector('.val').dataset.num = y + '%';
    pie.querySelectorAll('#keys > span').forEach((span, ix) => span.setAttribute('title', [x.quantity - avail, avail][ix]));

    insertDetails(x);
}
//insert data details
function insertDetails (data) {
    forms[1].innerHTML = '';
    let {drug, vendor, quantity, container, available, desc, unit_number} = data;
    let obj = {
        'Product': ['product',drug],  //str 'name' is the field path actual name
        'Vendor': ['vendor',vendor],
        [`Quantity (in ${container})`]: ['quantity',quantity],
        'Available': ['available',Number((available / unit_number).toFixed())],
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
let forbiddenSymb = '/.-:;#$%*()[]{}!~ '.split('');
forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    initSubmit(e.submitter);
    let data = {
        createdAt: Date.now(),
        lastModified: serverTimestamp(),
        vendor: '',
        desc: '',
    }
    const fd = new FormData(forms[0]);
    for (const [k, v] of fd.entries()) {
        data[k] = Number(v) || v;
    }
    //multiplier
    data['available'] = data.unit_number * data.quantity;
    // console.log(data);    
    await addDoc(collection(db,'products'), data).then(async d => {
        let cname = '';
        for (let i = 0; i < data.name.length; i++) {
            if (forbiddenSymb.includes(data.name[i])) continue;
            cname += data.name[i];
        }
        await setDoc(doc(db, 'category', cname), {
            'prod': arrayUnion(data.drug),
        }, {merge: true});
        
        forms[0].reset();
        initSubmit(e.submitter, false, true);
    });
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
//share
const shareBtn = document.querySelector('button.share');
shareBtn.addEventListener('click', async () => {
    const e = Object.values(elem)[0];
    
    const available = e.quantity - Number((e.available / e.unit_number).toFixed());

    const data = {
        title: e.name,
        text: `${e.drug}\b*Available in stock*: ${available + ' ' + e.unit_name}${available <= 1 ? '' : 's'}`,
        url: location.origin + '/dist/medical/index.html'
    }
    if (!navigator.canShare(data)) {
        console.log("This piece of data cannot be shared using this API.");
        return;
    }
    try {
        await navigator.share(data);
        const d = Date.now();
        console.log(d, "Shared successfully.");
    } catch (err) {
        console.log(err);
    }
});

/** HACKS for pharmacy.js **/
/*
//CREATE CATEGORY FOR EACH DRUG
//get all docs on antibiotics/tablet injection
const n = configs[9].categories[11];
const snapped = await getDocs(query(collection(db, 'products'), where('name', '==', n)));
let drugs = [];
if (snapped.empty) {
    alert('No drug found.');
} else {
    snapped.docs.forEach(snp => drugs.push(snp.data().drug));
    console.log(drugs);
}
let nname = '';
for (let i = 0; i < n.length; i++) {
    if (forbiddenSymb.includes(n[i])) continue;
    nname += n[i];
}
await setDoc(doc(db, 'category', nname), {
    'prod': arrayUnion(...drugs),
}, {merge: true});
console.log('Set!');
*/

//ENTER NEW FIELDS FOR EACH DRUG
/*
const n = configs[9].categories[11];
const snapped = await getDocs(query(collection(db, 'products'), where('name', '==', n)));
let drugs = [];
if (snapped.empty) {
    alert('No drug found.');
} else {
    snapped.docs.forEach(snp => {
        let d = snp.data();
        // d['available'] = d.quantity * d
        drugs.push(snp.data().drug)
    });
    console.log(drugs);
}
*/
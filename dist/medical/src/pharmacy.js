// import { initializeApp, deleteApp } from "firebase/app";
// import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, updateDoc, query, where, and, or, serverTimestamp, orderBy, limit, runTransaction } from "firebase/firestore";
// import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

//form init
function initSubmit(elem, bool=true) {
    elem.disabled = bool;
    elem.classList.toggle('clk', bool);
}
const forms = document.forms;
//create category
forms[0].addEventListener('submit', (e) => {
    e.preventDefault();
    initSubmit(e.submitter);
    let data = {
        createdAt: Date.now(),
        // lastModified: serverTimestamp(),
        folios: {
            used: 0,
        }
    }
    const fd = new FormData(forms[0]);
    for (const [k, v] of fd.entries()) {
        data.folios[k] = Number(v) || v;
    }
    console.log(data);
    // updateDoc(doc(db, data.name, doc.id), {folios: data});
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
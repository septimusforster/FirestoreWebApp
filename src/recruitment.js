import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";

//dca-mobile config
const dcamobile = {
    apiKey: "AIzaSyCT92x3HE8nUsYsKgQ2eJZU7DHQ83mTgwE",
    authDomain: "dca-mobile-26810.firebaseapp.com",
    projectId: "dca-mobile-26810",
    storageBucket: "dca-mobile-26810.appspot.com",
    messagingSenderId: "843119620986",
    appId: "1:843119620986:web:e1a4f469626cbd4f241cc3"
};
  
// Initialize Firebase
let app = initializeApp(dcamobile);
let db = getFirestore(app);

const loader_et_result = document.querySelectorAll("#loader, #result");
loader_et_result.forEach(elem => elem.removeAttribute('style'));

let abbr, activewindow, uid;
let user, udata, catNo;
window.addEventListener('click', (e) => {
    if (activewindow) activewindow.classList.remove('active');
}, true);

const hdnInput = document.querySelector('input[type="hidden"]');
const menu = document.querySelector('menu');
const select = document.querySelector('#select');
select.addEventListener('click', (e) => {
    const t = e.target;
    if (t.localName === 'li') {
        menu.querySelectorAll('li').forEach(li => {
            if (li.childElementCount > 1) li.lastElementChild.remove();
            li.classList.toggle('active', li == t);
        });
        hdnInput.value = t.firstElementChild.textContent;
        abbr = t.firstElementChild.id;
        catNo = Number(t.dataset.ct);
        select.firstElementChild.textContent = t.textContent;
        t.insertAdjacentHTML('beforeend', '<span>&check;</span>');
    } else {
        activewindow = t;
    }
    select.classList.toggle('active');
});

//copy btn
const copyBtn = document.querySelector('#cpy-btn');
copyBtn.addEventListener('click', (e) => {
    navigator.clipboard.writeText(copyBtn.previousElementSibling.textContent);
    copyBtn.textContent = 'Copied!'
    copyBtn.style.pointerEvents = 'none';
    const timeoutID = setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.style.pointerEvents = 'fill';
        clearTimeout(timeoutID);
    }, 3000);
});

//exam btn
const examBtn = document.querySelector('#exm-btn');
examBtn.addEventListener('click', (e) => {
    testJSParams(udata, abbr, user);
    location.href = `/dist/student/dist/test.html?ct=${catNo}&uid=${uid}&sb=${btoa(abbr)}`;
});

const forms = document.forms;
const section = document.querySelector('section');
//recruit sign up form
forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();

    section.classList.add('stg01');
    const fd = new FormData(forms[0]);
    let obj = {};
    obj['offered'] = {[abbr]: fd.get('offered')};
    fd.delete('offered');
    obj['createdOn'] = serverTimestamp();
    obj['arm'] = 'Recruit';
    
    for (const [k, v] of fd.entries()) {
        obj[k] = v;
    }
    // console.log(obj);
    //check if phone number exists
    const userSnap = await getDocs(query(collection(db, 'students'), where('phone', '==', obj.phone), limit(1)));
    if (userSnap.empty) {
        const snapshot = await addDoc(collection(db, "students"), obj).then(async student => {
            uid = student.id;
            obj['id'] = uid, obj['class'] = 'Demo';
            user = obj;
            const snapshot2 = await setDoc(doc(db, "students", student.id, "scores", student.id), {
                [abbr]: 0,
            });
            //get abbr code
            const abbrSnap = await getDocs(query(collection(db, 'activities', 'test', abbr), where('catNo', '==', catNo)));
            udata = [abbrSnap.docs[0].data()];
            abbrSnap.docs.forEach(dcmt => copyBtn.previousElementSibling.textContent = dcmt.get('code'));
            section.classList.replace('stg01', 'stg02');
        });
    } else {
        section.classList.remove('stg01');
        alert("User already exists.");
    }
});

const openCloseBtns = document.querySelectorAll('#login-btn, #close-dialog-btn');
// const loginBtn = document.querySelector('button');
const loginDialog = document.querySelector('#login-dialog');
//open login dialog
openCloseBtns.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
        if (idx) return loginDialog.close();
        if (!idx) return loginDialog.showModal();
    });
});

//login form
forms[1].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';

    const phone = document.querySelector('input#uphone').value;
    const userSnap = await getDocs(query(collection(db, 'students'), where('phone', '==', phone), limit(1)));
    if (userSnap.empty) {
        alert(`Sorry. The user with phone number ${phone} does not exist.`);
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
        return
    }
    uid = userSnap.docs[0].id;
    user = {'id': uid, ...userSnap.docs[0].data(), 'class': 'Demo'};
    abbr = Object.keys(userSnap.docs[0].get('offered'))[0];
    let subject = Object.values(userSnap.docs[0].get('offered'))[0];
    // const snapshot2 = await setDoc(doc(db, "students", uid, "scores", uid), {
    //     [abbr]: 0,
    // });
    //get abbr code
    console.log(subject);
    document.querySelectorAll('menu li').forEach(li => {
        if (li.firstElementChild.textContent == subject) catNo = Number(li.dataset.ct);
    });
    const abbrSnap = await getDocs(query(collection(db, 'activities', 'test', abbr), where('catNo', '==', catNo)));
    udata = [abbrSnap.docs[0].data()];
    abbrSnap.docs.forEach(dcmt => copyBtn.previousElementSibling.textContent = dcmt.get('code'));
    openCloseBtns[0].remove();
    loginDialog.close();
    section.classList.add('stg02');
});

function testJSParams (udata, abbr, user) {
    sessionStorage.setItem(abbr, JSON.stringify(udata));
    sessionStorage.setItem('snapshot', JSON.stringify(user))
}
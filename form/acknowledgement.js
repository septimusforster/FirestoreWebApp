import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, getDoc, doc, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import  configs from "../src/JSON/configurations.json" assert {type: 'json'};

var app = initializeApp(configs[6]);
var db = getFirestore(app);

function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore(app);
}
let currentClass;

//const declarations
const header = document.querySelector('header');
const select = document.querySelector('select#cls');
const main = document.querySelector('main');
const dialog = document.querySelectorAll('dialog');

//finding records
select.addEventListener('change', async (e) => {
    if (e.target.selectedIndex) {
        e.target.disabled = true;
        header.classList.add('on');

        const cname = currentClass = e.target.value;
        let payload = JSON.parse(sessionStorage.getItem(cname));
        if (payload) {
            header.classList.replace('on', 'load');
            insertPayload(payload);
            e.target.disabled = false;
            return;
        }

        chooseConfig(configs[7].indexOf(cname));
        const q = query(collection(db, 'robotics'), orderBy('dateTime'))
        const snap = await getDocs(q);
        if (snap.empty) {
            main.querySelectorAll('div').forEach(div => div.remove());  //reset main
            header.classList.remove('on');
            e.target.disabled = false;
            return;
        }

        payload = [];
        snap.docs.forEach(snp => payload.push(snp.data()));
        sessionStorage.setItem(cname, JSON.stringify(payload));
        insertPayload(payload);
        header.classList.replace('on', 'off');
        // header.classList.add('off');
        e.target.disabled = false;
    }
    // console.log(si);
});
const months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
]
function insertPayload(data) {
    main.querySelectorAll('div').forEach(div => div.remove());  //reset main
    let div = '', _m = '';
    data.forEach(d => {
        const { dateTime, fullname } = d;
        let x = new Date(dateTime).getMonth();
        if (_m !== x) {
            div = `
            <div class="month">${months[x]}</div>
            `;
            _m = x;
        }
        div += `
            <div class="bubble">
                <p>My name is <b>${fullname}</b>.</p>
                <small>${Intl.DateTimeFormat('en-GB', {dateStyle: 'medium'}).format(dateTime)}</small>
            </div>
        `;
    });
    main.insertAdjacentHTML('beforeend', div);
    header.classList.add('off');

    main.querySelectorAll('.bubble').forEach((bubble, index) => {
        bubble.onclick = () => confirmReceipt(index);
    });
}

function confirmReceipt(idx) {
    const data = JSON.parse(sessionStorage.getItem(currentClass))[idx];
    document.querySelector('div.image').style.backgroundImage = `url(${data.file}`;
    dialog[0].showModal();
}
//close dialog
document.querySelector('button.close').addEventListener('click', () => dialog[0].close());

document.addEventListener('beforeunload', () => {
    sessionStorage.removeItem(currentClass);
});
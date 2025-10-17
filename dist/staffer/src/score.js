import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, setDoc, getFirestore, orderBy, query, where, increment, updateDoc, runTransaction } from "firebase/firestore";

// initialize firebase app
var app = initializeApp(configs[6])
var db;
function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}
db = getFirestore();
const MONTH = new Date().getMonth();
const session = MONTH >= 9 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session

const eot = await getDoc(doc(db, 'EOT', session));
let perm = eot.data().perm;
perm = perm.toString(2);

let arms = await getDoc(doc(db, 'reserved', '6Za7vGAeWbnkvCIuVNlu'));
arms = arms.data().arms.sort();
const main = document.querySelector('main');
main.removeAttribute('inert');
const term = function(n){
    if(n <= 3) return 1; //second term
    if(n <= 7) return 2; //third term
    return 0; //first term
}(MONTH);

let storage = JSON.parse(sessionStorage.getItem('snapshotId'));
//insert params
if(storage){
    storage = storage.data;

    const loadForm = document.forms.namedItem('load');
    const table = document.querySelector('table>tbody');
    //insert subjects, cls, arms
    for(const c of storage.classroomsTaught.sort()) loadForm.querySelector('select#cls').insertAdjacentHTML('beforeend', `<option value="${configs[7].indexOf(c)}">${c}</option>`);
    for(const s of storage.subjectsTaught.sort((a, b) => Object.values(a)[0].localeCompare(Object.values(b)[0]))) loadForm.querySelector('select#sbj').insertAdjacentHTML('beforeend', `<option value="${Object.keys(s)[0]}">${Object.values(s)[0]}</option>`);
    arms.forEach(a => loadForm.querySelector('select#arm').insertAdjacentHTML('beforeend', `<option>${a}</option>`));

    // adding permission
    table.previousElementSibling.querySelectorAll('tr>th:nth-child(n + 4)').forEach((th, tx) => th.classList.toggle('perm', perm[tx] == 1));

    let data, mySub, myClass, myArm; //subject, class, arm
    function loadTable(info){
        document.getElementById('thead').textContent = `${configs[7][myClass]} ${myArm} - ${storage.subjectsTaught[0][mySub]}`;
        table.innerHTML='';

        for(let i = 0; i < info.length; i++){
            if(!info[i]?.record || !info[i].record[mySub]) continue;
            const elems = info[i].record[mySub][term];
            const td = elems.reduce((a,c,x) => c === null ? a + `<td${perm[x] == 1 ? ' contenteditable' : ''}>-</td>` : a + `<td${perm[x] == 1 ? ' contenteditable' : ''}>${c}</td>`,'');
            table.insertAdjacentHTML('beforeend', `
                <tr id="${info[i].id}">
                    <td>${i+1}</td>
                    <td>${info[i].last_name} ${info[i].first_name} ${info[i]?.other_name || ''}</td>
                    <td>${info[i].admission_no}</td>
                    ${td}
                </tr>
            `);
        }
    }
    //change handler
    table.addEventListener('keypress', (e) => {
        if(!e.target.hasAttribute('contenteditable') || e.target.parentElement.className.includes('w')) return;
        e.target.parentElement.classList.add('w');
    })
    //load form submit handler
    loadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.submitter.disabled = true;
        main.setAttribute('inert','');

        const fd = new FormData(e.target);
        if(myArm+myClass === fd.get('arm')+fd.get('cls')){
            mySub = fd.get('sbj');
            loadTable(data);
        }else{
            [mySub, myClass, myArm] = fd.values();
            chooseConfig(parseInt(myClass));
            const neoSnap = await getDocs(query(collection(db, `session/${session}/students`), where('arm', '==', myArm)));
            data = [...neoSnap.docs].map(m => m.data()).sort((a,b) => a.last_name.localeCompare(b.last_name));
            document.querySelector('#table .ftr>button').toggleAttribute('disabled',!data.length);
            loadTable(data)
        }
        main.removeAttribute('inert');
        e.submitter.disabled = false;
    });
    //update-btn handler
    document.querySelector('button#upd-btn').addEventListener('click', async (e) => {
        const trows = table.querySelectorAll('tr.w');
        if(!trows.length){
            alert("Nothing to update.");
            return;
        }else{
            e.target.disabled = true;
            main.setAttribute('inert','');
            chooseConfig(parseInt(myClass));
            try{
                const prom = [...trows].map(async m => {
                    const d = [...m.querySelectorAll('td:nth-child(n+4)')].map(td => td.textContent === '-' ? null : Number(td.textContent));
                    await runTransaction(db, async (transaction) => {
                        await transaction.update(doc(db, 'session', session, 'students', m.id),{[`record.${mySub}.${term}`]:d})
                    });
                });
                await Promise.all(prom).then(() => {
                    notify('Updation successful.');
                })
            }catch(err){
                if(err){
                    console.log(err);
                    notify('Error during updation.',true);
                }
            }finally{
                main.removeAttribute('inert');
                e.target.disabled = false;
            }
        }
    });
    //notify
    const notf = document.getElementById('notf');
    function notify(msg,err=false){
        notf.querySelector('p').textContent = msg;
        notf.style.top = '2%';
        notf.classList.toggle('err', err);
        setTimeout(() => {
            notf.removeAttribute('style');
        }, 4500);
    }
}
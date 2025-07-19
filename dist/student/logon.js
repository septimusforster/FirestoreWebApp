import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, updateDoc, query, where, and, or } from "firebase/firestore";
import configs from "../../src/JSON/configurations.json" assert {type: 'json'};

var app, db;
function useApp(n){
    if (app) deleteApp(app);
    app = initializeApp(configs[n]);
    db = getFirestore(app);
}
//initialze app
// useApp(6);

document.addEventListener('DOMContentLoaded', (e) => {
    //check online availability
    amionline();
});
window.addEventListener('online', amionline, false);
window.addEventListener('offline', amionline, false);

const myZone = new Date(Date.now()).getTimezoneOffset();
const timeDOM = document.getElementById('time');
function amionline() {
    if (navigator.onLine) {
        if(myZone === -60){
            timeDOM.innerHTML = `<div>${Intl.DateTimeFormat('en-US', {dateStyle: 'full'}).format(Date.now())}</div>`;
        }else{
            timeDOM.innerHTML = `<div>Please check your system time.</div>`;
        }
    } else {
        timeDOM.innerHTML = "<span id='offline'></span><span>Offline</span>";
        document.querySelectorAll('.opq').forEach(opq => opq ? opq.classList.remove('opq') : false);
        return;
    }
}
const popWarn = document.getElementById('pop_warn');
const fms = document.forms;
//toggle pass
document.querySelector('.btn.eye').onclick = function(){
    if(this.previousElementSibling.type==='password'){
        this.previousElementSibling.type = 'text';
        this.firstElementChild.firstElementChild.setAttribute('href', '#eye-open');
    } else {
        this.previousElementSibling.type = 'password';
        this.firstElementChild.firstElementChild.setAttribute('href', '#eye-close');
    }
}
//login
const notf = document.querySelector('.notf');
const now = new Date();
const ssn = (now.getMonth() > 9 ? now.getFullYear()+1 : now.getFullYear()).toString();
let cls, offered, mois;

fms.namedItem('login').addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    if(!navigator.onLine){
        notf.textContent = 'Network Error.';
        notf.classList.add('dp', 'err');
        const sid = setTimeout(() => {
            notf.classList.remove('dp', 'err', 'ok');
            e.submitter.disabled = false;
            clearTimeout(sid);
        }, 3000);
        e.submitter.disabled = false;
        return;
    }
    if (e.target.name === 'login') {//WARNING: user-defined name
        e.target.classList.add('opq');
        const f0 = new FormData(e.target);
        const eml = f0.get('eml');
        cls = parseInt(f0.get('cls'));
        const pwd = f0.get('pwd');
        
        useApp(cls);
        const stdRef = collection(db, 'session', ssn, 'students');
        const q = query(stdRef, and(or(where("email", "==", eml), where("admission_no", "==", eml)), where("password", "==", pwd)));
        try{
            await getDocs(q)
            .then(async val => {
                const v = val.size;
                if(myZone !== -60) throw Error("Time zone mismatch.",{cause: true});
                if(v===1) {
                    mois = val.docs.map(m => m.data())[0];
                    if(Object.hasOwn(mois, 'offered')){
                        userValidated();
                        // await getDoc(doc(db, "session", ssn, "students", mois.id, 'scores', 'records')).then(val=>{
                        //     console.log(val.data())
                        // });
                    } else {
                        useApp(6);
                        //get subjects
                        const sbjs = await getDoc(doc(db, 'reserved', cls <= 2 ? "2aOQTzkCdD24EX8Yy518" : "eWfgh8PXIEid5xMVPkoq"));
                        offered = sbjs.data();
                        const stg = e.target.querySelector('#stg');
                        stg.innerHTML = '';
                        e.target.querySelector('.nwstd').innerHTML = `<div>${mois.last_name} ${mois.first_name} ${mois?.other_name ? mois.other_name : ""}</div>`;
                        e.target.querySelector('legend').textContent = "Register subjects";
                
                        e.submitter.disabled = false;
                        //if new student
                        e.target.setAttribute('name', 'reg_sub');
                        let s=0;
                        for(let k in offered){
                            stg.insertAdjacentHTML('beforeend', `
                                <div class="chbx">
                                    <input type="checkbox" name="sbr" id="sbr${s}" value="${k}">
                                    <label for="sbr${s}">${offered[k]}</label>
                                </div>
                            `);
                            s++;
                        }
                    }
                } else if (v===0) {
                    throw Error("Wrong Email/Admission Number or Password.", {cause: true});
                } else if (v>1){
                    throw Error(`Failed(${v}): multiple users found.`, {cause: true});
                }
            });
        }catch(err){
            if (err.cause) {
                notf.textContent = err.message;
                notf.classList.add('dp', 'err');
                const sid = setTimeout(() => {
                    notf.classList.remove('dp', 'err', 'ok');
                    e.submitter.disabled = false;
                    clearTimeout(sid);
                }, 3000);
            } else {
                console.log(err);
            }
        }finally{
            e.target.classList.remove('opq');
        }
    } else {
         e.submitter.disabled = false;
        //count checkboxes
        const sbr = new FormData(e.target).getAll('sbr');
        if (!sbr.length) return;
        if(sbr.length<17){
            //warn sub registered is less than 7
            popWarn.querySelector('.msg').textContent = `You have selected only ${sbr.length === 1 ? sbr.length + " subject" : sbr.length + " subjects"}. Do you wish to continue?`;
            popWarn.showPopover();
        } else {
            await reg_sbj(mois.id);
        }
    }
});
//yesBtn event listener
document.querySelector('.msg+div button:nth-child(2)').addEventListener('click', async (e) => await reg_sbj(mois.id));

let data = {};
async function reg_sbj(id){
    fms.namedItem('reg_sub').classList.add('opq');
    let sbrs = [...document.querySelectorAll('input[type="checkbox"]:checked')];
    sbrs.forEach(sbr => data[sbr.value] = offered[sbr.value]);

    console.log(cls)
    useApp(cls);
    try{
        await updateDoc(doc(db, "session", ssn, "students", id),{'offered':data});
        mois['offered'] = data;
        notf.textContent = 'Logging in...';
        notf.classList.add('dp', 'ok');
        const tid = setTimeout(() => {
            notf.classList.remove('dp', 'err', 'ok');
            e.submitter.disabled = false;
            clearTimeout(tid);
        }, 5000);
        userValidated();
    }catch(err){
        console.log(err);
    }
}
function userValidated(){
    delete mois.password, mois['cls'] = cls;
    sessionStorage.setItem('mois', JSON.stringify(mois));
    location.replace('index.html');
}
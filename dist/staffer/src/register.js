import { initializeApp, deleteApp } from "firebase/app";
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, doc, getDoc, query, where, updateDoc, getDocs, setDoc, deleteField, runTransaction } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

//declare all const and var
const classArray = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"];

// initialize firebase app
var app = initializeApp(configs[6]);
// init services
var db = getFirestore(app);
let eot, term;
// calculate session
const MONTH = new Date().getMonth();
const session = MONTH >= 8 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());   //SEPTEMBER, which marks the turn of the session
//notify
const notf = document.querySelector('#notf');
function notify(msg, err=false){
    notf.querySelector('p').textContent = msg;
    notf.style.top = '2%';
    notf.classList.toggle('err', err);
    setTimeout(() => {
        notf.removeAttribute('style');
    }, 4500);
}
const eotRef = doc(db, 'EOT', session);
await getDoc(eotRef).then((res) => eot = res.data());
term = ["First", "Second", "Third"].indexOf(eot.this_term) || function(n){
    if(n <= 3) return 1; //second term
    if(n <= 7) return 2; //third term
    return 0; //first term
}(MONTH);
const main = document.querySelector('main');

function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore();
}
const ss = JSON.parse(sessionStorage.getItem('snapshotId'));
if(ss && 'masterOfForm' in ss.data){
    const sbmtBtn = main.querySelector('.ftr>button');
    const master = Object.entries(ss.data.masterOfForm)[0];
    const avatar = document.querySelector('#avatar');
    avatar.nextElementSibling.querySelectorAll('p, small').forEach((el,ex) => {
        el.innerHTML = ex ? `${ss.data.fullName} &bull; ${master[0]} ${master[1]}` : ss.data.username;
    });
    
    const tbody = document.querySelector('tbody');
    const jnrSubs = {
        AGR: "Agricultural Science",
        BSC: "Basic Science",
        BTEC: "Basic Technology",
        BUS: "Business Studies",
        CCA: "Cultural and Creative Arts",
        CIV: "Civic Education",
        CRS: "Christian Religious Studies",
        ENG: "English Language",
        FRE: "French Language",
        HAU: "Hausa Language",
        HECO: "Home Economics",
        HIS: "History",
        ICT: "Computer Studies",
        IGB: "Igbo Language",
        MTH: "Mathematics",
        MUS: "Music",
        PHE: "Physical and Health Education",
        SOS: "Social Studies",
        YOR: "Yoruba"
    };
    const snrSubs = {
        ACCT: "Financial Accounting",
        AGR: "Agricultural Science",
        BIO: "Biology",
        CCP: "Catering Craft Practice",
        CHE: "Chemistry",
        CIV: "Civic Education",
        COM: "Commmerce",
        CRS: "Christian Religious Studies",
        ECO: "Economics",
        ENG: "English Language",
        "F&N": "Foods and Nutrition",
        FMAT: "Further Mathematics",
        FRE: "French Language",
        FSH: "Fisheries",
        GEO: "Geography",
        GOV: "Government",
        ICT: "Computer Studies",
        LIT: "Literature-in-English",
        MKT: "Marketing",
        MTH: "Mathematics",
        PHY: "Physics",
        TD: "Technical Drawing",
        TOU: "Tourism",
        VIS: "Visual Arts",
    };
    const SUBJ = Object.keys(ss.data.masterOfForm)[0].startsWith('JSS') ? jnrSubs : snrSubs;
    
    let snapDocs = [], snappedChange = [];
    chooseConfig(classArray.indexOf(master[0]))
    const q = query(collection(db, 'session', session, 'students'), where("arm", "==", master[1]));
    const snapDoc = await getDocs(q);
    main.removeAttribute('inert');
    sbmtBtn.disabled = false;
    if (snapDoc.empty) {
        window.alert('This class is empty.');
    } else {
        // snapDoc.docs.sort()
        let sorted = snapDoc.docs.sort((a,b) => a.data().last_name.localeCompare(b.data().last_name));
        sorted.forEach(d => {
            if (d.data().admission_no.startsWith('DCA')) {
                snappedChange.push({id:d.id, dd:d.data()});
                if('record' in d.data()) snapDocs.push({id:d.id, dd:d.data()});
            }
        });

        snapDocs.map((m, mx) => {
            let len = Object.values(m.dd.record);
            let tot = len.map(l => l[term].reduce((a,c) => a + c)).reduce((b, d) => b + d);
            let avg = ((tot*100)/(len.length*100)).toFixed();

            tbody.insertAdjacentHTML('beforeend', `
                <tr id="${m.id}">
                    <td>${mx+1}</td>
                    <td>${m.dd.last_name} ${m.dd.first_name} ${m.dd?.other_name || ''}</td>
                    <td>${m.dd.admission_no}</td>
                    <td>${m.dd.gender}</td>
                    <td>${m.dd.email}</td>
                    <td>${m.dd.password}</td>
                    <td contenteditable>${m.dd.days_present[term] || 0}</td>
                    <td contenteditable>${m.dd.comment[term] || '&hellip;'}</td>
                    <td>${avg}</td>
                </tr>
            `);
        });

        tbody.addEventListener('keypress', (e) => {
            if(!e.target.hasAttribute('contenteditable') || e.target.parentElement.className.includes('w')) return;
            e.target.parentElement.classList.add('w');
        })
        sbmtBtn.addEventListener('click', async (e) => {
            const trows = tbody.querySelectorAll('tr.w');
            if(!trows.length) return notify('Nothing to submit.',true);

            e.target.disabled = true;
            main.setAttribute('inert','');
            // chooseConfig(parseInt(myClass));
            try{
                const prom = [...trows].map(async m => {
                    const d = [...m.querySelectorAll('td:nth-child(7),td:nth-child(8)')].map(td => Number(td.textContent) || td.textContent);
                    const {days_present} = snapDocs.find(f => f.id == m.id).dd;
                    days_present.splice(term, 1, d[0]);

                    await runTransaction(db, async (transaction) => {
                        await transaction.update(doc(db, 'session', session, 'students', m.id),{
                            days_present,
                            [`comment.${term}`]: d[1]
                        })
                    });
                });
                await Promise.all(prom).then(() => {
                    notify('Updation successful.');
                })
            }catch(err){
                if(err){
                    console.log(err);
                    notify('Error submitting record.',true);
                }
            }finally{
                main.removeAttribute('inert');
                e.target.disabled = false;
            }
        })
    }
    /*
    const formRegister = document.forms.formRegister;
    formRegister.addEventListener('change', (e) => {
        let inputs = document.getElementsByClassName(e.target.name);
        for (const a of inputs) {
            if (a.value == '') a.value = a.placeholder;
        }
        const hidden = e.target.parentElement.parentElement.children[8];    //children[8] is hidden <input>
        hidden.setAttribute("name", e.target.name);
        if (e.target.type == "number") {
            let x = JSON.parse(hidden.getAttribute("value"));
            x.splice(term, 1, Number(e.target.value));
            // console.log(x);
            hidden.value = JSON.stringify(x);
        }
    })
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.submitter.disabled = true;
        e.submitter.style.opacity = '.5';
        const formData = new FormData(formRegister);
        let inputs = {};
        
        for (const pair of formData.entries()) {
            if (!pair[1]) continue;
            const arr = formData.getAll(pair[0]);
            let dp = Number(arr[1]);
            let data = {
                days_present: JSON.parse(arr[3]),
                comment: {
                    [term]: arr[2]
                }
            };
            inputs[pair[0]] = data;
        }
        // console.log(inputs);
        const entries = Object.entries(inputs);
        console.log("Entries:", entries);
    
        const promises = entries.map(async cb => {
            await setDoc(doc(db, 'session', session, 'students', cb[0]), cb[1], { merge: true });
        })
        await Promise.allSettled(promises);
        // location.reload();
    
        window.alert("Success!");
        e.submitter.disabled = false;
        e.submitter.style.opacity = '1';
    });
    */
    
    //change of subjects
    const COSpopWrap = document.querySelector('#sbj_chg>.pop_wrp');
    const thead = COSpopWrap.querySelector('.thead');
    const popTbody = COSpopWrap.querySelector('.tbody');
    const selectAll = COSpopWrap.querySelector('select#all');
    //insert thead sbj
    let count = 0;
    thead.querySelectorAll('i').forEach(i => i.remove());
    for(const k in SUBJ){
        thead.insertAdjacentHTML('beforeend', `<i>${k}</i>`);
        count++;
        selectAll.insertAdjacentHTML('beforeend', `<option value="${count}">${count}</option>`);
    }
    snappedChange.forEach((snp, snx) => {
        const iTags = Object.keys(SUBJ).reduce((a,c) => snp.dd?.record && c in snp.dd?.record ? a + '<i class="i"></i>' : a + '<i></i>' ,'');
        popTbody.insertAdjacentHTML('beforeend', `
            <div class="tr">
                <b>${snx+1}</b>
                <span>${snp.dd.last_name} ${snp.dd.first_name}</span><span>${snp.dd.admission_no}</span>${iTags}
            </div>
        `);
    });
    let tbodyChildren = [...popTbody.children];
    //popTbody handler
    popTbody.addEventListener('click', (e) => {
        if(e.target.localName === 'i'){
            e.target.classList.toggle('i');
        }
    });
    //select#all handler
    selectAll.onchange = (e) => {
        tbodyChildren.forEach(chd => chd.querySelectorAll('i')[e.target.selectedIndex-1].classList.add('i'));
    }
    COSpopWrap.querySelector('input#entire').onchange = (e) => {
        tbodyChildren.forEach(chd => chd.querySelectorAll('i').forEach(i => i.classList.toggle('i', e.target.checked)));
    }
    //change of subject btn
    let CHANGE_OF_SUBJECT = [];
    const cosBtn = COSpopWrap.querySelector('button#cos_btn');
    cosBtn.addEventListener('click', async (e) => {
        //get term too
        cosBtn.disabled = true;
        COSpopWrap.setAttribute('inert','');
    
        snappedChange.forEach((snp, snx) => {
            const u = tbodyChildren[snx].querySelectorAll('i');
            const v = Object.keys(SUBJ).filter((ff, fx) => {
                if(snp.dd?.record){
                    if(u[fx].className.includes('i') && !(ff in snp.dd?.record)){
                        return ff;
                    }
                }else if(u[fx].className.includes('i')){
                    return ff;
                }
            });
            if(v.length) {
                let obj = {};
                for(const o of v) obj[o] = {[term]: Array(8).fill(null)}
                CHANGE_OF_SUBJECT.push({[snp.id]: obj});
            }
        });
        // console.log(CHANGE_OF_SUBJECT);
        const prom = CHANGE_OF_SUBJECT.map(async obj => {
            await setDoc(doc(db, 'session', session, 'students', Object.keys(obj)[0]), {
                'record':Object.values(obj)[0]
            },{merge:true})
        });
        await Promise.allSettled(prom).then(res => {
            cosBtn.disabled = false;
            COSpopWrap.removeAttribute('inert');
            COSpopWrap.parentElement.hidePopover();
            
            const rejections = [...res].filter(({status}) => status === 'rejected').length;
            console.log('Rejections:', rejections);
    
            if(rejections > 0){
                notify(`Error saving ${rejections} of ${CHANGE_OF_SUBJECT.length} subjects.`, true);
                return;
            }
            notify('Selection saved.');
        });
    });
}
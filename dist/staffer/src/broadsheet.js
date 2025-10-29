import { initializeApp, deleteApp } from "firebase/app";
import { collection, collectionGroup, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

let app = initializeApp(configs[6]); //FirebasePro config
let db = getFirestore(app);

function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore(app);
}
const jrsub = await getDoc(doc(db, "reserved", "2aOQTzkCdD24EX8Yy518"));
const srsub = await getDoc(doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq"));
// calculate session
const MONTH = new Date().getMonth();
let session = MONTH >= 8 ? String(new Date().getFullYear() + 1) : String(new Date().getFullYear());

const ss = JSON.parse(sessionStorage.snapshotId);   //id & data
//remove snapshotId from session storage
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
const main = document.querySelector('main');
main.removeAttribute('inert');

if(ss && 'masterOfForm' in ss.data){
    const master = Object.entries(ss.data.masterOfForm)[0];
    const avatar = document.querySelector('#avatar');
    avatar.nextElementSibling.querySelectorAll('p, small').forEach((el,ex) => {
        el.innerHTML = ex ? `${ss.data.fullName} &bull; ${master[0]} ${master[1]}` : ss.data.username;
    });
    const popsettings = document.getElementById('popsettings');
    const formSettings = popsettings.querySelector('form');

    //insert range of sessions
    let opt = '';
    for(let o = 2023; o < Number(session); o++) opt += `<option value="${o+1}">${o}/${o+1}</option>`;
    formSettings.querySelector('select#ssn').insertAdjacentHTML('beforeend', opt);
    
    let term;
    term = function(n){
        if(n <= 3) return 1; //second term
        if(n <= 7) return 2; //third term
        return 0; //first term
    }(MONTH);

    popsettings.showPopover();
    document.getElementById('chng-sesn').onclick = function(){
        popsettings.showPopover();
    }
    formSettings.addEventListener('submit',(e) => {
        e.preventDefault();
        e.submitter.disabled = true;
        popsettings.querySelector('.wrp').classList.add('on');
    
        term = Number(e.target[0].value);
        session = e.target[1].value;

        // get EOT and subject collections for both junior and senior secondary
        
        const worker = new Worker(new URL('dist/staffer/src/worker_bundle.js', location.origin));
        worker.postMessage(session);    //THIS SERVICE WORKER IS NOT BEING USED; DESTROY LATER.
        worker.onmessage = async ({data}) => {
            // const EOT = data;   //worker.js
            /*|| ["First","Second","Third"].indexOf(data?.this_term);*/
            // console.log(data.this_term, term);
            try {
                await setBroadSheet();
                // document.getElementById('sttng').innerText = `${e.target[1][e.target[1].selectedIndex].innerText} - ${e.target[0][e.target[0].selectedIndex].innerText}`;
            } catch (error) {
                console.log(error);
                notify("Sorry, something went wrong.", true);
                // popwrp.classList.add('on');
                // const tid = setTimeout(() => {
                //     popwrp.classList.remove('on');
                //     clearTimeout(tid);
                // }, 3000);
            } finally {
                popsettings.hidePopover();
                popsettings.querySelector('.wrp').classList.remove('on');
                e.submitter.disabled = false;
                // popsettings.querySelector('.wrp').classList.remove('on');
            }
        };
    });
    let IDs = [], names = [], promotion = [], studentSnap, scoresSnap = [];
    const table = document.querySelector('table');
    async function setBroadSheet() {
        // console.log(jrsub.data());
        let abbr, abbr_unmutated;
        if (master[0].startsWith("JSS")) {
            abbr = Object.keys(jrsub.data()).sort();
            abbr_unmutated = Object.keys(jrsub.data()).sort();
        } else if (master[0].startsWith("SSS")) {
            abbr = Object.keys(srsub.data()).sort();
            abbr_unmutated = Object.keys(srsub.data()).sort();
        } else {
            //for recruits or entrance students
            abbr = ['BSC', 'BIO', 'CCA', 'COM', 'CRS', 'ICT', 'PHE', 'ENG', 'MTH'].sort();
            abbr_unmutated = ['BSC', 'BIO', 'CCA', 'COM', 'CRS', 'ICT', 'PHE', 'ENG', 'MTH'].sort();
        }
    
        // reset app and query the students of the masterOfForm's arm
        const school = 'DCA';
        chooseConfig(configs[7].indexOf(master[0]));
        IDs = [], names = [];
        const q1 = query(collection(db, 'session', session, 'students'), where("arm", "==", master[1]), orderBy("last_name"));  //and where("days_present","array-contains","null")
        studentSnap = await getDocs(q1);
        studentSnap.docs.forEach(s => {
            if (['demo'].includes(master[0].toLowerCase()) || s.data().arm.toLowerCase() !== 'entrance' || s.data()?.admission_no.toUpperCase().includes(school)) {
                IDs.push(s.id);
                scoresSnap.push(s.data().record);
                names.push({na: `${s.data().last_name} ${s.data().first_name} ${s.data()?.other_name}`, nb: s.data()?.promo_status || null});
            }
        });

        const tbody = table.querySelector('tbody');
        
        //populate table header with the [abbr] of the subjects
        abbr.push('AVE');   //last column
        const th = abbr.unshift('#','NAME'); //mutates array & returns new length of same array
        table.querySelector('thead').innerHTML = '<tr></tr>'; //reset thead
        for (let i = 0; i < th; i++) {
            table.querySelector('thead>tr').insertAdjacentHTML('beforeend', `
            <th>${abbr[i]}</th>
            `);
        }        
        // populate tbody with student name and total score for each subject
        tbody.innerHTML=''; //reset tbody
        const benchmark = abbr_unmutated.length;
        names.forEach(({na, nb}, i) => {
            let tds = `<td>${i+1}</td><td>${na}</td>`, f = 0, rt = 0;
            const obj = scoresSnap[i];
            if (obj) {
                let scoreEntries = Object.entries(obj).sort();
                let core = {MTH:0, ENG:0, LIT:0, CIV:0, GOV:0, PHY:0, CHEM:0, ACCT:0, COMM:0};
                for (const [k, v] of scoreEntries) {
                    let idx = abbr_unmutated.indexOf(k);
                    let slice = idx - f;
                    if (slice) {
                        for (let j = 0; j < slice; j++) tds += "<td></td>";
                    }
                    let s = v[term]?.reduce((a,c) => a + c) || 0;
                    const ck = Object.values(v);
                    if(master[0].startsWith('SSS')){
                        if(k in core) core[k] = (ck.flat().reduce((x,y) => x + y, 0) / ck.length).toFixed(1)
                    }else{
                        core[k] = (Object.values(v).flat().reduce((x,y) => x + y, 0) / ck.length).toFixed(1);
                    }
                    rt += s;
                    tds += `<td>${parseFloat(s.toFixed(1))}</td>`;
                    f = idx + 1;
                }
                promotion.push(core);
                
                for (f; f < benchmark + 1; f++) {
                    f < benchmark ? tds += '<td></td>' : tds += `<td>${(rt/scoreEntries.length).toFixed(1)}</td>`;
                }
            }
            tbody.insertAdjacentHTML('beforeend', `
                <tr id="${IDs[i]}">${tds}</tr>
            `)
        });
        promotion.forEach(p => {
            for(const sb in p) p[sb] == 0 ? delete p[sb] : p[sb] = Number(p[sb]);
        });
        isPromoted();
        // compute total and average for each subject and store in td string
        let aveStr = '', totStr = '';
        abbr.forEach((ab,ix) => {
            if (!([0,1].includes(ix))) {
                let td = [...document.querySelectorAll(`tbody tr > td:nth-child(${ix+1})`)];
                let m = td.map(x => Number(x.innerText)).filter(y => Boolean(y));
                // console.log(m);
                let tc = m.reduce((a,c) => a + c, 0);
                totStr += `<td>${tc.toFixed(1)}</td>`;
                aveStr += `<td>${(tc/(m.length || 0.001)).toFixed(1)}</td>`;    //0.001 is to prevent 0 (tc) being divided by 0 (m.length), which give NaN
            } else if (ix == 1) {
                totStr += '<td></td><td>Total</td>';
                aveStr += '<td></td><td>Average</td>';
            }
        });
    
        // insert total and average in tfoot tr
        insertFoot(totStr, aveStr, th);
        studentTotal();
    }
    
    function insertFoot(a, t, th) {
        // document.querySelector('tfoot').innerHTML='<tr><td>Broad Sheet</td></tr>';  //reset tfoot
        // table.querySelector('tfoot>tr:last-child>td').setAttribute('colspan', th);
        for (const i of arguments) {
            if(typeof i === 'number') continue;
            document.querySelector("tfoot").insertAdjacentHTML("afterbegin", `
                <tr>${i}</tr>
            `);
        }
    }
    
    let positionArray = [];
    function studentTotal () {
        names.forEach((n, i) => {
            let x = [...document.querySelectorAll(`tbody tr:nth-child(${i+1}) td:not(td:last-child)`)];
            let y = x.map(f => Number(f.innerText));
            y.splice(0,2);
            let z = y.reduce((a,c) => a + c, 0);
    
            const wrapperDiv = document.createElement('DIV');
            const childDiv = document.createElement('DIV');
            const txt = document.createTextNode(z.toFixed());
            positionArray.push(Number(z.toFixed()));
            childDiv.classList.add('snum');
            childDiv.append(txt);
            wrapperDiv.append(childDiv)

            document.querySelector(`tbody tr:nth-child(${i+1}) td:nth-child(2)`).appendChild(wrapperDiv);
        });
    }
    
    // calculate position according to positionArray
    positionArray.sort((a, b) => a - b).reverse();
    
    let computedPos = false;
    //compute pos and insert in DOM
    document.getElementById('revl-pos').addEventListener('click', (e) => {
        const posState = e.target.classList.toggle('on');
        document.querySelectorAll("div.ps").forEach(ps => ps.classList.toggle("show", posState));   
        if (!computedPos) {
            let s = [...document.querySelectorAll(".snum")];
            for (let i = 0; i < names.length; i++) {
                const pos = positionArray.indexOf(Number(s[i].innerText));
                document.querySelector(`tbody tr:nth-child(${i+1}) td:nth-child(2) > div`).insertAdjacentHTML('beforeend', `
                    <div class="ps show">${pos+1}</div>
                `)
            }
            computedPos = true;
        }
    })
    //for setting promotion status
    /*
    const dialogs = document.querySelectorAll("dialog");
    const promoTabBody = document.querySelector("table#promo-tab tbody");
    const promoForm = document.querySelector("form#promo-form");
    let computedProm = false;
    let newBtn = document.createElement("button");
    newBtn.type = "button";
    newBtn.textContent = "Promotion Settings";
    newBtn.id = "promo-btn";
    newBtn.addEventListener("click", (e) => {
        if (!computedProm) {
            //get tbody tr IDs and names and insert into the promoTab tbody rows cells having newly created radio buttons
            const rows = [...document.querySelectorAll('tbody tr')];
            rows.forEach((tr, ix) => {
                const id = tr.id;
                const name = tr.children[1].firstChild.textContent;
                promoTabBody.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td>${ix+1}</td>
                        <td>${name}</td>
                        <td><input type="radio" name="${id}" value="Promoted"/></td>
                        <td><input type="radio" name="${id}" value="Probation"/></td>
                        <td><input type="radio" name="${id}" value="Advised to repeat"/></td>
                        <td><input type="radio" name="${id}" value="Not promoted"/></td>
                    </tr>
                `);
            });
            computedProm = true;
        }
        dialogs[0].showModal();
    });
    document.querySelector("header").appendChild(newBtn);
    
    //promotion status form submission
    /*
    promoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.submitter.disabled = true;
        e.submitter.style.cursor = 'not-allowed';
    
        let data = [];
        const fd = new FormData(promoForm);
        for (const [k, v] of fd.entries()) {
            data.push({id: k, pr: v});
        }
        const p = data.map(async ({id, pr}) => {
            await updateDoc(doc(db, 'session', session, 'students', id), {promo_status: pr});
        });
        await Promise.all(p);
        window.alert('Promotion Settings applied successfully.');
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
        closeBtn.click();
    });
    */
    const closeBtn = document.querySelector("input#close");
    closeBtn.addEventListener('click', () => closeBtn.closest('dialog').close());
    
    //promo btn
    let prom=0,prob=0,nprm=0;
    const promPop = document.getElementById('promo-pop');
    document.getElementById('promo-btn').onclick = function(){
        promPop.querySelectorAll('.wrp>div').forEach((div, dvx) => div.textContent = `${['Promoted', 'Probation', 'Not Promoted'][dvx]} --- ${[prom,prob,nprm][dvx]}`)
        promPop.showPopover();
    }
    function isPromoted(){
        const cell = document.querySelectorAll('main tbody tr td:nth-child(2)');
        if(term == 2) {
            if(/^JSS/.test(master[0])){ //JSS class
                promotion.forEach((o,ox) => {
                    let ol = Object.values(o);
                    let rol = (ol.reduce((v,w) => v + w, 0)) / ol.length;
                    if(rol <= 49.4){
                        cell[ox].insertAdjacentHTML('afterbegin', '<code>Not Promoted.</code><br>'), nprm++;
                    }else if(rol >= 49.5 && rol <= 54.5){
                        cell[ox].insertAdjacentHTML('afterbegin', '<code>Probation.</code><br>'), prob++;
                    }else{
                        cell[ox].insertAdjacentHTML('afterbegin', '<code>Promoted.</code><br>'), prom++;
                    }
                });
            }
            if(master[0].startsWith('SSS')){ //SSS class
                promotion.forEach((p2,px) => {
                    const nb = names[px]['nb'];
                    if(nb !== null){
                        cell[px].insertAdjacentHTML('afterbegin', `<code>${nb}.</code><br>`);
                        if(nb.toLowerCase() === 'promoted') prom++;
                        if(nb.toLowerCase() === 'probation') prob++
                        if(nb.toLowerCase() === 'repeated') nprm++;
                    }else{
                        const {MTH, ENG, ...others} = p2;
                        if(MTH >= 50 && ENG >= 50 && Object.values(others).some(n => n >= 50)){
                            cell[px].insertAdjacentHTML('afterbegin', '<code>Promoted.</code><br>'), prom++;
                        }else if((MTH >= 50 || ENG >= 50) && Object.values(p2).filter(n => n >= 50).length >= 2){
                            cell[px].insertAdjacentHTML('afterbegin', '<code>Probation.</code><br>'), prob++;
                        }else if(Object.values(p2).every(n => n < 50) || (MTH < 50 && ENG < 50)){
                            cell[px].insertAdjacentHTML('afterbegin', '<code>Not promoted.</code><br>'), nprm++;
                        }
                    }
                })
            }
        }
    }
}
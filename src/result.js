import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where, and, getDocs, collectionGroup } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};

// initialize firebase app
var app;// = initializeApp();
// init services
var db;
// db = getFirestore();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}

const tbodyScores = document.querySelector('#section-grade table:nth-child(1) tbody');
const tfootTerm = document.querySelector('#section-grade table:nth-child(1) tfoot');
const tbodyTerm = document.querySelector('#section-grade > table:nth-of-type(2) tbody');
const tfootCumm = document.querySelector('#section-grade > table:nth-of-type(2) tfoot');
document.querySelector('[data-pop]').onclick = () => {
    tfootCumm.querySelector('tr').innerHTML = '';
    document.querySelector('dialog').showPopover();
    tbodyTerm.innerHTML = '';
    tbodyScores.innerHTML = '';
    tfootTerm.innerHTML = '';
}
const ss = JSON.parse(sessionStorage.getItem('student'));
const offered = ss.offered;
const classSize = ss.size;
const percent = document.getElementById('percent');
const fullName = ss.last_name.concat(' ', ss.other_name, ' ', ss.first_name);
let eotData, thisTerm, term, percentile, arm = JSON.parse(sessionStorage.getItem('arm')).arms.sort(), session = ss.session;
let myclass = configs[7].indexOf(ss.cls);
let className = '', daysOpen = '', daysPresent = '', daysAbsent = '', ssn = '', nextTerm = '';

const dialog = document.querySelector('dialog');
const loadbar = dialog.querySelector('#loadbar');
let pt = 7;
function loaded(ld) {
    pt += ld;
    loadbar.querySelector('i').style.width = pt + '%';
}

document.querySelector('select#res').addEventListener('change', (e) => {
    document.querySelector('.wrp > form > .gp:last-of-type').classList.toggle('on', e.target.selectedIndex === 2);
    document.querySelector('input#perc').value = e.target.value;
});
let eotReadyStatus,
    core = {MTH:0, ENG:0, LIT:0, CIV:0, GOV:0, PHY:0, CHEM:0, ACCT:0, COMM:0},
    core_lower = 0;

await eot();
document.forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    if (eotReadyStatus) {

        e.submitter.disabled = true;
        loadbar.showPopover();
        
        const fd = new FormData(e.target);
        term = Number(fd.get('term'));
        percentile = Number(fd.get('perc'));
        
        arm = ss.arm;
        const thisYr = String(new Date().getFullYear()-1);
        try {
            loaded(30);
            const principal = eotData.princ;    //eotData.principal[term]
            
            const studentsRef = collection(db, 'session', session, 'students');
            const studentsQuery = arm === "ENTRANCE" ? query(studentsRef, and(where("admission_year", ">=", thisYr), where("arm", "==", "ENTRANCE"))) : query(studentsRef, where("arm", "==", arm));
            loaded(40);
            const studentsSnapshot = await getDocs(studentsQuery);
            //second width
            
            let studentIDs = [], studentScores = [];
            const DCA = 'DCA';
            studentsSnapshot.docs.forEach(result => {
                if (result.data().admission_no.toUpperCase().includes(DCA)) studentIDs.push(result.id);
            });
            console.log('real students:', studentsSnapshot.docs.length);
            let overall = [];
            const path = session < 2025 ? 'records/scores' : 'scores/records'; //because of human-being error
            const scorePromises = studentIDs.map(async sid => {
                await getDoc(doc(db, 'session', session, 'students', sid, path)).then((res) => {
                    studentScores.push({sid, ...res.data()});
                    overall.push(res.data());
                });
            });
            loaded(22);
            await Promise.all(scorePromises);
            //third width
            const x = studentScores.filter(a => a.sid === ss.id)[0]; //[0] retrieves only the first sid match by filter
            if (!x) throw new Error(`No student data for this arm ${arm} exists.`);
            const ME = Object.entries(x).sort();
            ME.length = ME.length - 1; // excludes sid from iteration, leaving only subs
            const theadFirstRow = document.querySelector("#section-grade table:nth-child(1) thead tr:first-child th");
            if (percentile < 100) {
                theadFirstRow.innerText = "Progressive Report";
                document.querySelector('#status').style.display = 'none';
                //hide cumulative table
                document.querySelector('#section-grade > table:nth-child(2)').style.display = 'none';
            }
            let total = 0, i;
            let graderObject = {
                "A": 80/100*percentile, //consider using toFixed() to trim fractional part;
                "B": 65/100*percentile, //but these grades are fine because they return integers
                "C": 50/100*percentile,
                "D": 40/100*percentile,
                "E": 30/100*percentile,
                "F": 0/100*percentile,
            }
    
            for (i = 0; i < ME.length; i++) {
                var td = '';
                if (!ME[i][1][term]) continue;
                let [...test] = ME[i][1][term];
                let subtotal = test.reduce((a,c) => a + c);
                switch (test.length) {
                    case 4: //normal
                        td += `
                            <td>${i+1}</td>
                            <td>${offered[ME[i][0]]}</td>
                            <td>${test[0] || ''}</td>
                            <td>${test[1] || ''}</td>
                            <td>${test[2] || ''}</td>
                            <td>${test[3] || ''}</td>
                        `;
                        break;
                    case 5:
                        td += `
                            <td>${i+1}</td>
                            <td>${offered[ME[i][0]]}</td>
                            <td>${test[0] || ''}</td>
                            <td>${test[1] || ''}</td>
                            <td>${test[2] || ''}</td>
                            <td>${test[3] + test[4] || ''}</td>
                        `;
                        break;
                    case 8:
                        td += `
                            <td>${i+1}</td>
                            <td>${offered[ME[i][0]]}</td>
                            <td>${(test[0] + test[1]).toFixed(1) || ''}</td>
                            <td>${(test[2] + test[3]).toFixed(1) || ''}</td>
                            <td>${(test[4] + test[5]).toFixed(1) || ''}</td>
                            <td>${(test[6] + (test[7] || null)).toFixed(1) || ''}</td>
                        `;
                        break;
                }
                td += `<td>${!subtotal ? '' : subtotal.toFixed(1)}</td>`;
    
                switch (true) {
                    case subtotal >= graderObject.A:
                        td += '<td>A</td><td>Excellent</td>';
                        break;
                    case subtotal >= graderObject.B:
                        td += '<td>B</td><td>Very Good</td>';
                        break;
                    case subtotal >= graderObject.C:
                        td += '<td>C</td><td>Good</td>';
                        break;
                    case subtotal >= graderObject.D:
                        td += '<td>D</td><td>Satisfactory</td>';
                        break;
                    case subtotal >= graderObject.E:
                        td += '<td>E</td><td>Pass</td>';
                        break;
                    case subtotal > graderObject.F:
                        td += '<td>F</td><td>Fail</td>';
                        break;
                    default:
                        td += '<td></td><td></td>';
                        break;
                }
    
                total += subtotal;
                let summation = [];
                for (let j = 0; j < studentScores.length; j++) {
                    if (studentScores[j]?.[ME[i][0]]?.[term] === undefined) continue;
                    let all = 0;
                    studentScores[j][ME[i][0]][term].forEach(n => all += n);
                    if (!all) continue;
                    summation.push(all);
                };
            
                // if (!summation.length) continue;
                const bool = summation.length;
                let max = bool ? Math.max(...summation).toFixed(1) : '';
                let min = bool ? Math.min(...summation).toFixed(1) : '';
            
                td += `
                    <td>${max}</td>
                    <td>${min}</td>
                `;
                tbodyScores.insertAdjacentHTML('beforeend', `
                    <tr>${td}</tr>
                `);
                let sc = Object.values(ME[i][1]);
                let cumm_td = Array(3).fill(0), cumm = 0, count = term < sc.length ? 0 : term/sc.length, txt = '';
    
                for (const x of sc) {
                    if (!x) continue;
                    let t = x.reduce((a, c) => a + c, 0);
                    cumm += t;
                    cumm_td.splice(count,1,t.toFixed(1));
                    count++;
                }

                // for(let w = 0; w < cumm_td.length; w++) {
                //     term >= w ? txt += `<td>${cumm_td[w]}</td>` : txt += '<td>-</td>';
                //     console.log(txt);
                // }
                let m = cumm_td.map((mp, ix) => ix <= term ? mp : '-');
                let how_many_terms  = 0;
                for (const c of m) {
                    txt += `<td>${c}</td>`;
                    c > 0.9 ? how_many_terms++ : false;
                }

                //search out core subjects
                how_many_terms = (cumm/how_many_terms).toFixed(1);
                if(ME[i][0] in core) core[ME[i][0]] = how_many_terms;
                tbodyTerm.insertAdjacentHTML('beforeend', `
                    <tr>
                        ${txt}
                        <td>${term < 2 || percentile < 100 ? '-' : how_many_terms}</td>
                    </tr>
                `);
            }
    
            const ME_AVERAGE = (total / (ME.length)).toFixed(1);
            let subAverage = [];
            overall.forEach(ov => {
                if (ov) {
                    let elem = 0, factor = 0;
                    for (const x of Object.values(ov)) {
                        if (!x[term]) continue;
                        elem += x[term].reduce((acc, val) => acc + val,0);
                        factor++;
                    }
                    const yy = elem/factor;
                    yy ? subAverage.push(yy) : false;
                }
            });
    
            const xx = await subAverage.reduce((acc, cur) => acc + cur,0);
            const CLS_AVERAGE = (xx/classSize).toFixed(1);
            // get principal data
            const princDiv = document.getElementById('principal');
            princDiv.querySelector('p').textContent = principal.name;
            let term_grade;
            switch (true) {
                case ME_AVERAGE >= graderObject.A:
                    princDiv.querySelector('blockquote').textContent = principal.comments.A;
                    term_grade = 'A';
                    break;
                case ME_AVERAGE >= graderObject.B:
                    princDiv.querySelector('blockquote').textContent = principal.comments.B;
                    term_grade = 'B';
                    break;
                case ME_AVERAGE >= graderObject.C:
                    princDiv.querySelector('blockquote').textContent = principal.comments.C;
                    term_grade = 'C';
                    break;
                case ME_AVERAGE >= graderObject.D:
                    princDiv.querySelector('blockquote').textContent = principal.comments.D;
                    term_grade = 'D';
                    break;
                case ME_AVERAGE >= graderObject.E:
                    princDiv.querySelector('blockquote').textContent = principal.comments.E;
                    term_grade = 'E';
                    break;
                case ME_AVERAGE >= graderObject.F:
                    princDiv.querySelector('blockquote').textContent = principal.comments.F;
                    term_grade = 'F';
                    break;
            }
            //add term total and term grade
            const cspan = Number(tbodyScores.dataset.totHeader);
            tfootTerm.insertAdjacentHTML('beforeend', `
                <tr>
                    <td colspan="${cspan}">Total/Grade</td>
                    <td>${total.toFixed(1)}</td>
                    <td>${term_grade}</td>
                    <td></td>
                </tr>
                <tr>
                    <td colspan="${cspan}">Student Average/Class Average</td>
                    <td>${ME_AVERAGE}</td>
                    <td>${CLS_AVERAGE}</td>
                </tr>
            `);
            for (let colNum = 0; colNum < 4; colNum++) { //less than 4 because there are 4 cols in table 2
                let ft = 0;
                const tds = tbodyTerm.querySelectorAll(`tr td:nth-child(${colNum + 1}`);
                tds.forEach(td => {
                    if(!(td.innerText == '-' || td.innerText == undefined)) ft += Number(td.innerText);
                });
                core_lower = colNum == 3 ? (ft/ME.length).toFixed(1) : ft.toFixed(1) || '';
                tfootCumm.querySelector('tr').insertAdjacentHTML('beforeend', `
                    <td>${core_lower}</td>
                `);
            }
            isPromoted();
        } catch (err) {
            console.error(err.message);
            loadbar.hidePopover();
            dialog.hidePopover();
            pt = 7;
            loaded(0);
            e.submitter.disabled = false;
        } finally {
            thisTerm = ['First', 'Second', 'Third'][term];
            nextTerm = percentile < 100 ? '' : eotData?.next_term[term] || '';
            ssn = eotData.session;
            daysOpen = eotData.days_open[term];
            className = `${myclass + 7}th Grade ${ss.arm}`;
            daysPresent = ss.days_present[term] || 0;
            daysAbsent = daysOpen - daysPresent;

            bioTable(className, classSize, daysOpen, daysPresent, daysAbsent, 2);
            bioTable(thisTerm, ssn, nextTerm, null, null, 3);        
            //final width
            loaded(1);
            loadbar.hidePopover();
            dialog.hidePopover();
            e.submitter.disabled = false;
            pt = 7;
            loaded(0);
        }
    }
});
// set teacher's name and comment
const teacherDiv = document.getElementById('teacher');
const teacherName = ss.formMaster;
document.querySelector('select#trm').onchange = (e) => {
    term = Number(e.target.value);
    const comment = typeof ss.comment == "object" ? ss.comment?.[term] || '' : ss.comment;
    teacherDiv.querySelector('p').textContent = teacherName;
    teacherDiv.querySelector('blockquote').textContent = comment;
}

async function eot() {
    app = initializeApp(configs[6]);
    db = getFirestore(app);
    // chooseConfig(6);
    const eotRef = doc(db, 'EOT', session);
    await getDoc(eotRef).then(async (res) => {
        eotReadyStatus = 'ok';
        document.forms[0].querySelector('button').style.opacity = 1;
        chooseConfig(myclass);
        // store dates in eotDates
        eotData = res.data();
        
        const stamp = '../img/24_25/stamp03.png';
        const photo = "../img/user.png" || ss.photo_src;
        const regNo = ss.admission_no;
        const gender = 'Male Female'.split(' ').filter(x => x.startsWith(ss.gender))[0];
        
        const d = Date.now() - new Date(ss.dob).getTime();
        const age = (new Date(d).getUTCFullYear() - 1970) || '-';

        //load photo
        document.images[1].src = photo;
        bioTable(regNo, fullName, gender, age, null, 1);
        // load stamp
        document.querySelector("img[alt='stamp']").src = stamp;
    });
}
function bioTable(a, b, c, d, e, tb, idx = 0) {
    for (const arg of arguments) {
        if (idx > 3 && tb === 1 || idx > 4 && tb === 2 || idx > 2 && tb === 3) break;
        document.querySelectorAll(`#section-bio table:nth-child(${tb}) tr td:nth-child(2)`)[idx].textContent = arg;
        idx++;
    }
}
const pdfBtn = document.getElementById('pdf-btn');
function generatePDF () {
    const main = document.querySelector('main');
    const dw = main.clientLeft * 4 + main.clientWidth;
    const dh = main.clientTop * 4 + main.clientHeight;
    var opt = {
        margin: 1,
        filename: fullName + '.pdf',
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'px', format: [dw, dh], orientation: 'portrait', hotfixes: ['px_scaling'] }
    }

    html2pdf().set(opt).from(main).save();
}
pdfBtn.addEventListener('click', generatePDF);
function isPromoted(){
    if(term == 2) {
        if(/^JSS/.test(ss.cls)){ //JSS class
            if(core_lower < 49){
                return percent.textContent = 'Not promoted.';
            }else if(core_lower <= 58){
                return percent.textContent = 'Probation.';
            }else{
                return percent.textContent = 'Promoted.';
            }
        }
        if(ss.cls.startsWith('SSS')){ //SSS class
            for(const s in core) if(core[s] < 1) delete core[s];
             const {MTH, ENG, ...others} = core;
            if(MTH >= 50 && ENG >= 50 && Object.values(others).some(n => n >= 50)){
                percent.textContent = 'Promoted.';
            }else if((MTH >= 50 || ENG >= 50) && Object.values(core).filter(n => n >= 50).length >= 2){
                percent.textContent = 'Probation';
            }else if(Object.values(core).every(n => n < 50) || (MTH < 50 && ENG < 50)){
                percent.textContent = 'Not promoted.';
            }
        }
    }else{
        console.log(core_lower);
        const criteria = [80,65,50,40,30,0,];
        const status = ['A','B','C','D','E','F'].indexOf(criteria.findIndex(c => c <= core_lower));
        percent.textContent = status == -1 ? 'N/A' : status;
    }
}
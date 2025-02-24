import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where, getDocs, collectionGroup } from "firebase/firestore"
import  configs from "./JSON/configurations.json" assert {type: 'json'};

// initialize firebase app
var app = initializeApp(configs[6])
// init services
var db;
db = getFirestore();

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
const promoStatus = ss?.promo_status;
const fullName = ss.last_name.concat(' ', ss.other_name, ' ', ss.first_name);
let eotData, thisTerm, term, percentile, arm = JSON.parse(sessionStorage.getItem('arm')).arms.sort(), session = ss.session;
let myclass = configs[7].indexOf(ss.cls);

// arm is first an array before it becomes a string in the submit event of the form
// arm.forEach(arm => document.querySelector('select#myarm').insertAdjacentHTML('beforeend', `<option value="${arm}">${arm}</option>`));

// let n;
const dialog = document.querySelector('dialog');
const loadbar = dialog.querySelector('#loadbar');
let pt = 7;
function loaded(ld) {
    pt += ld;
    loadbar.querySelector('i').style.width = pt + '%';
}

document.querySelector('select#res').addEventListener('change', (e) => {
    console.log("Changed");
    document.querySelector('.wrp > form > .gp:last-of-type').classList.toggle('on', e.target.selectedIndex === 2);
    document.querySelector('input#perc').value = e.target.value;
});

document.forms[0].addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    loadbar.showPopover();
    
    const fd = new FormData(e.target);
    // session = fd.get('session');
    term = fd.get('term');
    percentile = Number(fd.get('perc'));
    
    arm = ss.arm;
    
    try {
        loaded(30);
        await eot();
        const principal = eotData.princ;    //eotData.principal[term]
        
        const studentsRef = collection(db, 'session', session, 'students');
        const studentsQuery = query(studentsRef, where("arm", "==", arm));
        loaded(40);
        const studentsSnapshot = await getDocs(studentsQuery);
        //second width
        
        let studentIDs = [], studentScores = [];
        const DCA = 'DCA';
        studentsSnapshot.docs.forEach(result => {
            if (result.data().admission_no.toUpperCase().includes(DCA)) studentIDs.push(result.id);
        });
        
        let overall = [];
        const path = session < 2025 ? 'records/scores' : 'scores/records'; 
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
                        <td>${test[0] + test[1] || ''}</td>
                        <td>${test[2] + test[3] || ''}</td>
                        <td>${test[4] + test[5] || ''}</td>
                        <td>${(test[6] + (test[7] || null)) || ''}</td>
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
            let cumm_td = Array(3).fill(0), cumm = 0, count = 0, txt = '';
            let sc = Object.values(ME[i][1]);

            for (const x of sc) {
                if (!x) continue;
                let t = x.reduce((a, c) => a + c, 0);
                cumm += t;
                cumm_td.splice(count,1,t.toFixed(1));
                count++;
            }
            for(let w = 0; w < cumm_td.length; w++) term >= w ? txt += `<td>${cumm_td[w]}</td>` : txt += '<td>-</td>';
            tbodyTerm.insertAdjacentHTML('beforeend', `
                <tr>
                    ${txt}
                    <td>${term < 2 || percentile < 100 ? '-' : (cumm/count).toFixed(1)}</td>
                </tr>
            `)
            // console.log(count, cumm)
        }

        const ME_AVERAGE = (total / (ME.length)).toFixed(1);
        let subAverage = [];
        overall.forEach(ov => {
            if (ov) {
                let elem = 0, factor = 0;
                for (const x of Object.values(ov)) {
                    if (!x[term]) continue;
                    elem += x[term].reduce((acc, val) => acc + val);
                    factor++;
                }
                const yy = elem/factor;
                yy ? subAverage.push(yy) : false;
            }
        });

        const xx = await subAverage.reduce((acc, cur) => acc + cur);
        const CLS_AVERAGE = (xx/classSize).toFixed(1);
        // get principal data
        const princDiv = document.getElementById('principal');
        princDiv.querySelector('p').textContent = principal.name;
        const percent = document.getElementById('percent');
        let term_grade, cumm_grade;
        let promoTerm = term == 2 ? promoStatus || 'N/A' : 0;
        let principalComment;
        if (promoStatus?.toLowerCase() === 'not promoted') principalComment = 'Advised to repeat.'; //if not promoted, princComment should be ADVISED TO REPEAT
        // ME_AVERAGE = ((total * 100) / (scores.length * 100)).toFixed();
        switch (true) {
            case ME_AVERAGE >= graderObject.A:
                princDiv.querySelector('blockquote').textContent = principalComment || principal.comments.A;
                percent.textContent = promoTerm || 'A';
                term_grade = 'A';
                break;
            case ME_AVERAGE >= graderObject.B:
                princDiv.querySelector('blockquote').textContent = principalComment || principal.comments.B;
                percent.textContent = promoTerm || 'B';
                term_grade = 'B';
                break;
            case ME_AVERAGE >= graderObject.C:
                princDiv.querySelector('blockquote').textContent = principalComment || principal.comments.C;
                percent.textContent = promoTerm || 'C';
                term_grade = 'C';
                break;
            case ME_AVERAGE >= graderObject.D:
                princDiv.querySelector('blockquote').textContent = principalComment || principal.comments.D;
                percent.textContent = promoTerm || 'D';
                term_grade = 'D';
                break;
            case ME_AVERAGE >= graderObject.E:
                princDiv.querySelector('blockquote').textContent = principalComment || principal.comments.E;
                percent.textContent = promoTerm || 'E';
                term_grade = 'E';
                break;
            case ME_AVERAGE >= graderObject.F:
                princDiv.querySelector('blockquote').textContent = principalComment || principal.comments.F;
                percent.textContent = promoTerm || 'F';
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
            tfootCumm.querySelector('tr').insertAdjacentHTML('beforeend', `
                <td>${colNum == 3 ? (ft/ME.length).toFixed(1) : ft.toFixed(1) || ''}</td>
            `);
        }

        //final width
        loaded(1);
        loadbar.hidePopover();
        dialog.hidePopover();
        e.submitter.disabled = false;
        pt = 7;
        loaded(0);
    } catch (err) {
        console.error(err.message);
        loadbar.hidePopover();
        dialog.hidePopover();
        pt = 7;
        loaded(0);
        e.submitter.disabled = false;
    }
});
async function eot() {
    let teacherDiv = document.getElementById('teacher');
    chooseConfig(6);
    const eotRef = doc(db, 'EOT', session);
    await getDoc(eotRef).then(async (res) => {
        chooseConfig(myclass);
        // store dates in eotDates
        eotData = res.data();
        thisTerm = ['First', 'Second', 'Third'][term];
        const nextTerm = percentile < 100 ? '' : eotData?.next_term[term] || '';
        const ssn = eotData.session;
        const daysOpen = eotData.days_open[term];
        const stamp = '../img/24_25/stamp03.png';
        // const stamp = [,'../img/24_25/stamp02.png','../img/24_25/stamp03.png'][term] || eotData.stamp;

        // const photo = "../img/7503204_user_profile_account_person_avatar_icon.png" || ss.photo_src;
        const photo = "../img/user.png" || ss.photo_src;
        const regNo = ss.admission_no;
        const gender = 'Male Female'.split(' ').filter(x => x.startsWith(ss.gender))[0];
        const className = `${myclass + 7}th Grade ${ss.arm}`;
        const daysPresent = ss.days_present[term] || 0;
        const daysAbsent = daysOpen - daysPresent;
        const teacherName = ss.formMaster;
        const comment = typeof ss.comment == "object" ? ss.comment?.[term] || '' : ss.comment;

        const d = Date.now() - new Date(ss.dob).getTime();
        const age = (new Date(d).getUTCFullYear() - 1970) || '-';

        //load photo
        document.images[1].src = photo;

        function bioTable(a, b, c, d, e, tb, idx = 0) {
            for (const arg of arguments) {
                if (idx > 3 && tb === 1 || idx > 4 && tb === 2 || idx > 2 && tb === 3) break;
                document.querySelectorAll(`#section-bio table:nth-child(${tb}) tr td:nth-child(2)`)[idx].textContent = arg;
                idx++;
            }
        }
        bioTable(regNo, fullName, gender, age, null, 1);
        bioTable(className, classSize, daysOpen, daysPresent, daysAbsent, 2);
        bioTable(thisTerm, ssn, nextTerm, null, null, 3);        

        // set teacher's name and comment
        teacherDiv.querySelector('p').textContent = teacherName;
        teacherDiv.querySelector('blockquote').textContent = comment;

        // load stamp
        document.querySelector("img[alt='stamp']").src = stamp;
    })
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
import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where, getDocs } from "firebase/firestore"
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

const ss = JSON.parse(sessionStorage.getItem('student'));
const offered = ss.offered;
const classSize = ss.size;
const fullName = ss.last_name.concat(' ', ss.other_name, ' ', ss.first_name);

let eotData, thisTerm, term, percentile;
await eot();
const principal = eotData.principal;

var n;
n = configs[7].indexOf(ss.cls);
chooseConfig(n);

const studentsRef = collection(db, "students");
const studentsQuery = query(studentsRef, where("arm", "==", ss.arm));
const studentsSnapshot = await getDocs(studentsQuery);

let studentIDs = [], studentScores = [];
studentsSnapshot.docs.forEach(result => {
    studentIDs.push(result.id);
})

let overall = [];
const scorePromises = studentIDs.map(async sid => {
    await getDoc(doc(db, "scores", sid)).then((res) => {
        studentScores.push({sid, ...res.data()});
        // overall.push(Object.entries(res.data()));
        overall.push(res.data());
    });
});

await Promise.allSettled(scorePromises);
// console.log(overall)
// console.log(studentScores);
const ME = Object.entries(studentScores.filter(a => a.sid === ss.id)[0]).sort(); //[0] retrieves only the first sid match by filter
ME.length = ME.length - 1; // excludes sid from iteration, leaving only subs
const theadFirstRow = document.querySelector("#section-grade table:nth-child(1) thead tr:first-child th");
if (percentile < 100) theadFirstRow.innerText = "Mid-Term Report";

const tbodyScores = document.querySelector('#section-grade table:nth-child(1) tbody');
const tfootTerm = document.querySelector('#section-grade table:nth-child(1) tfoot');
const tbodyTerm = document.querySelector('#section-grade table:nth-child(2) tbody');
const tfootCumm = document.querySelector('#section-grade table:nth-child(2) tfoot');
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
    let [...test] = ME[i][1][term];
    let subtotal = test.reduce((a,c) => a + c);
    td += `
        <td>${i+1}</td>
        <td>${offered[ME[i][0]]}</td>
        <td>${test[0] || ''}</td>
        <td>${test[1] || ''}</td>
        <td>${test[2] || ''}</td>
        <td>${test[3] || ''}</td>
        <td>${subtotal}</td>
    `;
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
        case subtotal >= graderObject.F:
            td += '<td>F</td><td>Fail</td>';
            break;
    }
    total += subtotal;

    let summation = [];
    for (let j = 0; j < studentScores.length; j++) {
        if (studentScores[j][ME[i][0]] === undefined) continue;
        // let [...test] = studentScores[j][ME[i][0]][term];
        // let all = test.reduce((a, c) => a + c);
        let [v,w,x,y,z=null] = studentScores[j][ME[i][0]][term];
        let all = (v + w + x + y + z).toFixed();
        if (all == 0) continue;
        summation.push(all);
    };

    let max = Math.max(...summation);
    let min = Math.min(...summation);
    td += `
        <td>${max}</td>
        <td>${min}</td>
    `;
    tbodyScores.insertAdjacentHTML('beforeend', `
        <tr>${td}</tr>
    `);
    let cumm_td = '', cumm = 0, count = 0;
    for (const x of Object.values(ME[i][1])) {
        let t = x.reduce((a, c) => a + c);
        cumm += t;
        if (t) count++;
        cumm_td += `<td>${percentile < 100 ? '-' : t || '-'}</td>`;
    }
    tbodyTerm.insertAdjacentHTML('beforeend', `
        <tr>
            ${cumm_td}
            <td>${percentile < 100 ? '-' : (cumm/count).toFixed(1)}</td>
        </tr>
    `)
}
const ME_AVERAGE = (total / (ME.length - 1)).toFixed(1);
let subAverage = [];

overall.forEach(ov => {
    if (ov) {
        let elem = 0, factor = 0;
        for (const x of Object.values(ov)) {
            let [a=null,b=null,c=null,d=null,e=null] = x[term];
            // elem += x[term].reduce((acc, val) => acc + val);
            elem += a + b + c + d + e;
            factor++;
        }
        const yy = elem/factor;
        yy ? subAverage.push(yy) : false;
        // subAverage.push(elem/factor);
    }
});
const xx = await subAverage.reduce((acc, cur) => acc + cur);
const CLS_AVERAGE = (xx/classSize).toFixed(1);

// console.log("subAverage:", subAverage);
// get principal data
const princDiv = document.getElementById('principal');
princDiv.querySelector('p').textContent = principal.name;
const percent = document.getElementById('percent');
let term_grade, cumm_grade;
// ME_AVERAGE = ((total * 100) / (scores.length * 100)).toFixed();
switch (true) {
    case ME_AVERAGE >= graderObject.A:
        princDiv.querySelector('blockquote').textContent = principal.Acomm;
        percent.textContent = 'A';
        term_grade = 'A';
        break;
    case ME_AVERAGE >= graderObject.B:
        princDiv.querySelector('blockquote').textContent = principal.Bcomm;
        percent.textContent = 'B';
        term_grade = 'B';
        break;
    case ME_AVERAGE >= graderObject.C:
        princDiv.querySelector('blockquote').textContent = principal.Ccomm;
        percent.textContent = 'C';
        term_grade = 'C';
        break;
    case ME_AVERAGE >= graderObject.D:
        princDiv.querySelector('blockquote').textContent = principal.Dcomm;
        percent.textContent = 'D';
        term_grade = 'D';
        break;
    case ME_AVERAGE >= graderObject.E:
        princDiv.querySelector('blockquote').textContent = principal.Ecomm;
        percent.textContent = 'E';
        term_grade = 'E';
        break;
    case ME_AVERAGE >= graderObject.F:
        princDiv.querySelector('blockquote').textContent = principal.Fcomm;
        percent.textContent = 'F';
        term_grade = 'F';
        break;
}
//add term total and term grade
const cspan = Number(tbodyScores.dataset.totHeader);
tfootTerm.insertAdjacentHTML('beforeend', `
    <tr>
        <td colspan="${cspan}">Total/Grade</td>
        <td>${total.toFixed()}</td>
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
    // console.log(tds);
    // console.log(ft)
    tfootCumm.querySelector('tr').insertAdjacentHTML('beforeend', `
        <td>${colNum == 3 ? (ft/studentScores.length).toFixed() : ft.toFixed() || ''}</td>
    `);
}
const overStats = document.querySelectorAll('.overstats');
// function overstats(sTot, sAve, cAve) {
//     let counter = 0;
//     let prefix = ["Student Total: ","Student Average: ","Class Average: "];
//     for (let stats of arguments) {
//         overStats[counter].innerHTML = prefix[counter] + stats;
//         counter++;
//     }
// }
// overstats(total.toFixed(1), ME_AVERAGE, CLS_AVERAGE);    // total.toFixed()

async function eot() {
    let teacherDiv = document.getElementById('teacher');
    
    const eotRef = doc(db, "reserved", "EOT");
    await getDoc(eotRef).then(async (res) => {
        // store dates in eotDates
        eotData = res.data();
        thisTerm = eotData.this_term;
        term = ["First", "Second", "Third"].indexOf(eotData.this_term);
        percentile = eotData.percentile;
        const nextTerm = percentile < 100 ? '' : eotData.next_term[term];
        const session = eotData.session;
        const daysOpen = parseInt(eotData.days_open[term]);
        const stamp = eotData.stamp; // [,,'../img/24_25/stmp_2.png'][term] || eotData.stamp;

        // const photo = "../img/7503204_user_profile_account_person_avatar_icon.png" || ss.photo_src;
        const photo = "../img/user.png" || ss.photo_src;
        const regNo = ss.admission_no;
        const gender = 'Male Female'.split(' ').filter(x => x.startsWith(ss.gender))[0];
        const className = `${ss.cls} ${ss.arm}`;
        const daysPresent = ss.days_present[term] || 0;
        const daysAbsent = daysOpen - daysPresent;
        const teacherName = ss.formMaster;
        const comment = typeof ss.comment == "object" ? ss.comment?.[term] || '' : ss.comment;

        const dob = new Date(ss.dob);
        const compareDate = new Date(eotData[ss.cls]);
        const diff = Math.abs(compareDate - dob);
        const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 52)) || '';

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
        bioTable(thisTerm, session, nextTerm, null, null, 3);        

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
        jsPDF: { unit: 'px', format: [dw, dh], orientation: 'landscape', hotfixes: ['px_scaling'] }
    }

    html2pdf().set(opt).from(main).save();
}
pdfBtn.addEventListener('click', generatePDF);
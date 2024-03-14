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

let eotData;
let thisTerm;
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

const scorePromises = studentIDs.map(async sid => {
    await getDoc(doc(db, "scores", sid)).then((res) => {
        studentScores.push({sid, ...res.data()})
    });
})

await Promise.allSettled(scorePromises);
// console.log(studentScores.length);
const ME = Object.entries(studentScores.filter(a => a.sid === ss.id)[0]).sort();
// console.log(ME);
const tbodyScores = document.querySelector('#section-grade table:nth-child(1) tbody');
const tbodyTerm = document.querySelector('#section-grade table:nth-child(2) tbody');
let overall = 0;
let total = 0;
let i;

for (i = 0; i < ME.length - 1; i++) {
    var td = '';
    let [a,b,c,d] = ME[i][1];
    td += `
        <td>${offered[ME[i][0]]}</td>
        <td>${a || ''}</td>
        <td>${b || ''}</td>
        <td>${c || ''}</td>
        <td>${d || ''}</td>
    `;
    let subtotal = a + b + c + d;
    switch (true) {
        case subtotal > 79:
            td += '<td>A</td><td>Excellent</td>';
            break;
        case subtotal > 64:
            td += '<td>B</td><td>Very Good</td>';
            break;
        case subtotal > 49:
            td += '<td>C</td><td>Good</td>';
            break;
        case subtotal > 39:
            td += '<td>D</td><td>Satisfactory</td>';
            break;
        case subtotal > 29:
            td += '<td>E</td><td>Pass</td>';
            break;
        case subtotal <= 29:
            td += '<td>F</td><td>Fail</td>';
            break;
    }
    total += subtotal;

    let summation = [];
    for (let j = 0; j < studentScores.length; j++) {
        let [w,x,y,z] = studentScores[j][ME[i][0]] || [null, null, null, null];
        summation.push(w+x+y+z);
    };
    // console.log(summation)
    overall += summation.reduce((acc, cur) => acc + cur);
    
    let max = summation.reduce((x,y) => Math.max(x,y));
    let min = summation.reduce((x,y) => Math.min(x,y));
    td += `
        <td>${max}</td>
        <td>${min}</td>
    `;
    tbodyScores.insertAdjacentHTML('beforeend', `
        <tr>${td}</tr>
    `);
    
    let term = ["First", "Second", "Third"].indexOf(thisTerm);  
    tbodyTerm.insertAdjacentHTML('beforeend', `
        <tr>
            <td>${term === 0 ? subtotal : ''}</td>
            <td>${term === 1 ? subtotal : ''}</td>
            <td>${term === 2 ? subtotal : ''}</td>
            <td></td>
        </tr>
    `)
}

const ME_AVERAGE = (total / (ME.length - 1)).toFixed(1);
// console.log(total);
console.log("Child's average:", ME_AVERAGE);
console.log("Overall:", overall);
// get principal data
const princDiv = document.getElementById('principal');
princDiv.querySelector('p').textContent = principal.name;
const percent = document.getElementById('percent');
// ME_AVERAGE = ((total * 100) / (scores.length * 100)).toFixed();
switch (true) {
    case ME_AVERAGE > 79:
        princDiv.querySelector('blockquote').textContent = principal.Acomm;
        percent.textContent = 'A';
        break;
    case ME_AVERAGE > 64:
        princDiv.querySelector('blockquote').textContent = principal.Bcomm;
        percent.textContent = 'B';
        break;
    case ME_AVERAGE > 49:
        princDiv.querySelector('blockquote').textContent = principal.Ccomm;
        percent.textContent = 'C';
        break;
    case ME_AVERAGE > 39:
        princDiv.querySelector('blockquote').textContent = principal.Dcomm;
        percent.textContent = 'D';
        break;
    case ME_AVERAGE > 29:
        princDiv.querySelector('blockquote').textContent = principal.Ecomm;
        percent.textContent = 'E';
        break;
    case ME_AVERAGE <= 29:
        princDiv.querySelector('blockquote').textContent = principal.Fcomm;
        percent.textContent = 'F';
        break;
}

const overStats = document.querySelectorAll('.overstats');
function overstats(sTot, sAve, cAve) {
    let counter = 0;
    let prefix = ["Student Total: ","Student Average: ","Class Average: "];
    for (let stats of arguments) {
        overStats[counter].innerHTML = prefix[counter] + stats;
        counter++;
    }
}
const CLS_AVERAGE = (overall/(classSize*studentScores.length)).toFixed(1);
overstats(total, ME_AVERAGE, CLS_AVERAGE);

async function eot() {
    let teacherDiv = document.getElementById('teacher');
    
    const eotRef = doc(db, "reserved", "EOT");
    await getDoc(eotRef).then(async (res) => {
        // store dates in eotDates
        eotData = res.data();
        thisTerm = eotData.this_term;
        const nextTerm = eotData.next_term;
        const session = eotData.session;
        const daysOpen = parseInt(eotData.days_open);
        
        const photo = ss.photo_src;
        const regNo = ss.admission_no;
        const fullName = ss.last_name.concat(' ', ss.first_name, ' ', ss.other_name);
        const gender = 'Male Female'.split(' ').filter(x => x.startsWith(ss.gender))[0];
        const className = `${ss.cls} ${ss.arm}`;
        // const classSize = ss.size;
        const daysPresent = ss.days_present || 0;
        const daysAbsent = daysOpen - daysPresent;
        const teacherName = ss.formMaster;
        const comment = ss.comment || '';

        const dob = new Date(ss.dob);
        const compareDate = new Date(eotData[ss.cls]);
        const diff = Math.abs(compareDate - dob);
        const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 7 * 52)) || '';

        //load photo
        document.images[1].src = photo || "../img/7503204_user_profile_account_person_avatar_icon.png";

        function bioTable(a, b, c, d, e, tb, idx = 0) {
            for (const arg of arguments) {
                if (idx > 3 && tb === 1 || idx > 4 && tb === 2 || idx > 2 && tb === 3) break;
                document.querySelectorAll(`#section-bio table:nth-child(${tb}) tr td:nth-child(2)`)[idx].textContent = arg;
                idx++;
            }
        }
        bioTable(regNo, fullName, gender, age, null, 1);
        bioTable(className, classSize, daysOpen, daysPresent, daysAbsent, 2);
        bioTable(thisTerm, nextTerm, session, null, null, 3);        

        // set teacher's name and comment
        teacherDiv.querySelector('p').textContent = teacherName;
        teacherDiv.querySelector('blockquote').textContent = comment;
/*
        // load section grade table 1: subjects
        let num = configs[7].indexOf(ss.cls);
        chooseConfig(num);
        const docRef = doc(db, "scores", uid);
        await getDoc(docRef).then(res => {
            if (!res.exists) return window.alert("The records for this student do not exist.")
            const scores = Object.entries(res.data()).sort();
            // console.log("Term tab: ", term)
            let total = 0, myAverage;
            
            scores.forEach(s => {
                let subtotal = s[1].reduce((prev, curr) => prev + curr);
                let td = `<td>${offered[s[0]]}</td>`;
                let reducer = s[1].reduce((acc, cur) => {
                    td += `<td>${cur}</td>`;
                    return td;
                }, td);
                
                switch (true) {
                    case subtotal > 79:
                        reducer += '<td>A</td><td>Excellent</td>';
                        break;
                    case subtotal > 64:
                        reducer += '<td>B</td><td>Very Good</td>';
                        break;
                    case subtotal > 49:
                        reducer += '<td>C</td><td>Good</td>';
                        break;
                    case subtotal > 39:
                        reducer += '<td>D</td><td>Satisfactory</td>';
                        break;
                    case subtotal > 29:
                        reducer += '<td>E</td><td>Pass</td>';
                        break;
                    case subtotal <= 29:
                        reducer += '<td>F</td><td>Fail</td>';
                        break;
                }
                total += subtotal;
                // console.log(reducer);
                
            })
            // console.log("Total: ", total)
            const vpDiv = document.getElementById('vp');
            vpDiv.querySelector('p').textContent = vp.name;
            const percent = document.getElementById('percent');
            myAverage = ((total * 100) / (scores.length * 100)).toFixed();
            switch (true) {
                case myAverage > 79:
                    vpDiv.querySelector('blockquote').textContent = vp.commA;
                    percent.textContent = 'A';
                    break;
                case myAverage > 64:
                    vpDiv.querySelector('blockquote').textContent = vp.commB;
                    percent.textContent = 'B';
                    break;
                case myAverage > 49:
                    vpDiv.querySelector('blockquote').textContent = vp.commC;
                    percent.textContent = 'C';
                    break;
                case myAverage > 39:
                    vpDiv.querySelector('blockquote').textContent = vp.commD;
                    percent.textContent = 'D';
                    break;
                case myAverage > 29:
                    vpDiv.querySelector('blockquote').textContent = vp.commE;
                    percent.textContent = 'E';
                    break;
                case myAverage <= 29:
                    vpDiv.querySelector('blockquote').textContent = vp.commF;
                    percent.textContent = 'F';
                    break;
            }
        })*/
        /*
        offered.forEach((arr, ind) => {
            document.querySelectorAll('#section-grade table:nth-child(1) tr td:first-child')[ind].textContent = arr[1];
        })*/
        
    })
}
/*
// Dates
var date1 = new Date('2024-03-03');
var date2 = new Date('1990-04-15');

// Calculate the difference in milliseconds
var difference = Math.abs(date1 - date2);

// Convert the difference to days
var millisecondsPerDay = 1000 * 60 * 60 * 24 * 7 * 52;
var age = Math.floor(difference / millisecondsPerDay);

console.log('Difference in days:', age);
*/
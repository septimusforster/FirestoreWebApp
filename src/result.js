import { initializeApp, deleteApp } from "firebase/app"
import { getFirestore, collection, getDoc, doc, query, where } from "firebase/firestore"
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

// get EOT data

let eotData;
async function eot() {
    const eotRef = doc(db, "reserved", "EOT");
    await getDoc(eotRef).then(async (res) => {
        // store dates in eotDates
        eotData = res.data();
        const thisTerm = eotData.this_term;
        const nextTerm = eotData.next_term;
        const session = eotData.session;
        
        const ss = JSON.parse(sessionStorage.getItem('student'));
        const uid = ss.id;
        const photo = ss.photo_src;
        const regNo = ss.admission_no;
        const fullName = ss.last_name.concat(' ', ss.first_name, ' ', ss.other_name);
        const gender = 'Male Female'.split(' ').filter(x => x.startsWith(ss.gender))[0];
        const fullClass = `${ss.cls} ${ss.arm}`;
        const offered = Object.entries(ss.offered);
        const age = 21;

        //load photo
        document.images[1].src = photo || "../img/9035117_person_icon.png";

        function bioTable(a, b, c, d, tb, idx = 0) {
            for (const arg of arguments) {
                if (idx > 2 && tb === 3 || idx > 3) break;
                // if (idx > 3) break;
                document.querySelectorAll(`#section-bio table:nth-child(${tb}) tr td:nth-child(2)`)[idx].textContent = arg;
                idx++;
            }
        }
        bioTable(regNo, fullName, gender, age, 1);
        bioTable(fullClass, 50, 50, 50, 2);
        bioTable(thisTerm, nextTerm, session, null, 3);

        // load section grade table 1: subjects
        let num = configs[7].indexOf(ss.cls);
        chooseConfig(num);
        const docRef = doc(db, "scores", uid);
        await getDoc(docRef).then(res => {
            const scores = Object.entries(res.data()).sort();
            const sectionGrade = document.querySelectorAll('#section-grade table:nth-child(1)');

            scores.forEach(s => {
                let tr = document.createElement('TR');
            })
        })
        /*
        offered.forEach((arr, ind) => {
            document.querySelectorAll('#section-grade table:nth-child(1) tr td:first-child')[ind].textContent = arr[1];
        })
        */
    })
}
eot();
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
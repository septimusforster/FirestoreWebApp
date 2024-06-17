//REMEMBER TO WEBPACK IMPORTS: THEY ARE CURRENTLY USING "GSTATIC"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { collection, doc, getDoc, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
// import term_scores from "../../../import_for_export/JSON/scores - 3rd term/SSS2 (113).json" assert {type: 'json'};

let app = initializeApp(configs[4]); //SSS 2 config
let db = getFirestore(app);

// const collectionRef = collection(db, 'scores');
// const snapshot = (await getDocs(collectionRef));
// console.log(snapshot.docs);

window.addEventListener('load', (e) => {
    document.querySelector('main').classList.add('opq');
});
const table = document.querySelector('table');
const thead_row = table.querySelector('thead > tr');
const tfoot_td = table.querySelector('tfoot td');
const abbr = ['MTH','ENG','BSC','SOS','FRE','BUS','CRK','LIT','CHE','PHY','TD'];
const th = abbr.unshift('#','NAME'); //mutates array & returns new length of same array

tfoot_td.setAttribute('colspan', th)
for (let i = 0; i < th; i++) {
    thead_row.insertAdjacentHTML('beforeend', `
    <th>${abbr[i]}</th>
    `)
}
//get scores and students from sessionStorage as all_scores and all_students

// const first_student = term_scores[0];
// console.log(first_student);
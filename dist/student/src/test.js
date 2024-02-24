import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, query, where, and, or, updateDoc } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

// initial firebase app, assuming for SSS 3
var app = initializeApp(configs[5]);
// init services
var db = getFirestore();


// const selectElt = document.querySelector('select#classroom');
// selectElt.addEventListener('change', (e) => {
//     deleteApp(app);
//     let optIndex = e.target.selectedIndex - 1;
//     app = initializeApp(configs[optIndex]);
//     // init services
//     db = getFirestore()
//     // collection refs
// })
// lksHjPA7
// jsVQb8ew

const ss = JSON.parse(sessionStorage.getItem('testPayload'))

let buffer = new ArrayBuffer(3);
let dv = new DataView(buffer);
const uid = "7XURg1CwKZyjkDLSBiG8";
const testSubject = "BSC";
const testNum = 1;
const chosen = [2,3,1];
let updateVal = [null, null, null, null];

const quizForm = document.forms.quizForm;
quizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(quizForm);
    let score = 0;
    // const choice = Array.from(formData.values());
    let i;
    for (i = 0; i < chosen.length; i++) {
        if (chosen[i] === dv.getInt8(i)) {
            score++;
        }
    }
    const scoreRef = doc(db, "scores", uid)
    await getDoc(scoreRef).then( async res => {
        if (res.data()?.[testSubject] === undefined) {
            updateVal.splice(testNum, 1, score/3*15)
            await updateDoc(scoreRef, {
                [testSubject]: updateVal,
            })
            console.log("Test updated.")
        } else {
            if (res.data()[testSubject][testNum] != null) return window.alert("You've already taken this test.");
            let arr = res.data()[testSubject];
            arr.forEach((element, index) => {
                updateVal.splice(index, 1, element)
            });
            // updateVal = res.data()[testSubject];
            updateVal[testNum] = score/3*15;
            console.log("This is the updateVal: ", updateVal, '.')
    
            await setDoc(scoreRef, {
                [testSubject]: updateVal,
            })
            console.log('Test updated.')
        }
    })
})

quizForm.addEventListener('change', (e) => {
    dv.setInt8(e.target.name, e.target.value)
})
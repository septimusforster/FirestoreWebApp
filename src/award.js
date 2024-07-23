import { initializeApp, deleteApp } from "firebase/app";
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore";
const configs = [
    {
        "apiKey": "AIzaSyBJA5v78O_yZsw9Vkx7qZcdqo_Ek2Cg0nc",
        "authDomain": "jss-1-d8b98.firebaseapp.com",
        "projectId": "jss-1-d8b98",
        "storageBucket": "jss-1-d8b98.appspot.com",
        "messagingSenderId": "985767701555",
        "appId": "1:985767701555:web:4cbe7a5739b4f4288f0746",
        "measurementId": "G-KWGP4XGZS7"
    },
    {
        "apiKey": "AIzaSyAcW8SrGRjpae3yX41mengldQSkJZNSyyI",
        "authDomain": "jss-2-45bfb.firebaseapp.com",
        "projectId": "jss-2-45bfb",
        "storageBucket": "jss-2-45bfb.appspot.com",
        "messagingSenderId": "297181603876",
        "appId": "1:297181603876:web:deda0db38dfd99e56ad0b1",
        "measurementId": "G-HGF1RZF6G7"
    },
    {
        "apiKey": "AIzaSyBRrmYnGDXYcuhR9hxjUNHjTTAoaFU-iTU",
        "authDomain": "jss-3-9f56a.firebaseapp.com",
        "projectId": "jss-3-9f56a",
        "storageBucket": "jss-3-9f56a.appspot.com",
        "messagingSenderId": "485860840332",
        "appId": "1:485860840332:web:03eff5287d1c11e965bca9"
    },
    {
        "apiKey": "AIzaSyDAFU7YC7-F6Z5f7U_c4CaZfvMX2kWOvGY",
        "authDomain": "sss-1-c4e20.firebaseapp.com",
        "projectId": "sss-1-c4e20",
        "storageBucket": "sss-1-c4e20.appspot.com",
        "messagingSenderId": "583010609084",
        "appId": "1:583010609084:web:2301c411508b8bc1286db9"
    },
    {
        "apiKey": "AIzaSyBi2pDZDR1UYgE_0BokzSxfEUu6pdFJavE",
        "authDomain": "sss-2-6559e.firebaseapp.com",
        "projectId": "sss-2-6559e",
        "storageBucket": "sss-2-6559e.appspot.com",
        "messagingSenderId": "1080184329339",
        "appId": "1:1080184329339:web:afd1b3b963ff9e8b89fede"
    },
    {
        "apiKey": "AIzaSyCg54BF3m0TDPV3slZ0ctWf3s9x1dpaDDs",
        "authDomain": "sss-3-57cf1.firebaseapp.com",
        "projectId": "sss-3-57cf1",
        "storageBucket": "sss-3-57cf1.appspot.com",
        "messagingSenderId": "213082789734",
        "appId": "1:213082789734:web:0fdba98e8ffc2ac65b1aa7"
    },
    {    
        "apiKey": "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
        "authDomain": "fir-pro-152a1.firebaseapp.com",
        "projectId": "fir-pro-152a1",
        "storageBucket": "fir-pro-152a1.appspot.com",
        "messagingSenderId": "158660765747",
        "appId": "1:158660765747:web:bd2b4358cc5fc9067ddb46"
    },    
]
const classes = [
    "JSS 1",
    "JSS 2",
    "JSS 3",
    "SSS 1",
    "SSS 2",
    "SSS 3"
];
function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore(app);
}
let app = initializeApp(configs[6]); //FirebasePro config
let db = getFirestore(app);

// get EOT and subject collections for both junior and senior secondary
/*
const EOT = await getDoc(doc(db,"reserved","EOT"));
const jrsub = await getDoc(doc(db, "reserved", "2aOQTzkCdD24EX8Yy518"));
const srsub = await getDoc(doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq"));

let abbr, abbr_unmutated;
if (masterClass.startsWith("JSS")) {
    abbr = Object.keys(jrsub.data()).sort();
    // abbr_unmutated = Object.keys(jrsub.data()).sort();
} else if (masterClass.startsWith("SSS")) {
    abbr = Object.keys(srsub.data()).sort();
    // abbr_unmutated = Object.keys(srsub.data()).sort();
}
*/
//remove #loader & display <main>
const loader = document.getElementById("loader");
const main = document.querySelector("main");
loader.style.visibility = 'hidden';
main.removeAttribute("style");

//reference the AWARD button and its logic create
const awardBtn = document.querySelector("button#award-btn");
const classDialog = document.getElementById("class-dialog");
const closeDialogBtn = document.getElementById("close-dialog");
awardBtn.onclick = () => {classDialog.showModal()};
closeDialogBtn.onclick = () => {classDialog.close()};

//reference form and its submit logic create
const classForm = document.getElementById("class-form");
classForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    closeDialogBtn.click();
    loader.style.visibility = 'visible';
    //collect class name
    const fd = new FormData(classForm);
    const className = fd.get("classroom");
    console.log(className);
    //change configuration
    chooseConfig(classes.indexOf(className));
    //fetch from collection "students"
    const studentRef = collection(db, "students");
    await getDocs(studentRef).then(snapshot => {
        snapshot.docs.forEach(shot => {
            const lname = shot.get("last_name");
            const fname = shot.get("first_name");
            const oname = shot.get("other_name");
        });
    });
    //fetch from collection "scores"
    //supply "students" and "scores" into a function to be displayed in the DOM
    //first thead tr:first has name of class opened, thead tr:last has headers for names of students and subjects
    //of course, tbody contains the return and computed data denoting the position per subject
    e.submitter.disabled = false;
    e.submitter.style.cursor = 'pointer';
});

//populate table header with the [abbr] of the subjects
const table = document.querySelector("table");
const thead_row = table.querySelector('thead > tr');
// const th = abbr.unshift('#','NAME'); //mutates array & returns new length of same array
/*
tfoot_td.setAttribute('colspan', th);
for (let i = 0; i < th; i++) {
    thead_row.insertAdjacentHTML('beforeend', `
    <th>${abbr[i]}</th>
    `);
}
*/
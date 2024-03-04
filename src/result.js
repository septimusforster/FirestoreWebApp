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

const ss = JSON.parse(sessionStorage.getItem('student'));
const photo = ss.photo_src;
const regNo = ss.admission_no;
const fullName = ss.last_name.concat(' ', ss.first_name, ' ', ss.other_name);
const gender = 'Male Female'.split(' ').filter(x => x.startsWith(ss.gender))[0];
const cls = ss.cls;
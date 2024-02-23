import { initializeApp, deleteApp } from "firebase/app";
import {
    getFirestore, arrayUnion, arrayRemove, collection, getDoc, getDocs, setDoc, addDoc, deleteDoc, doc, serverTimestamp} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

// initialize firebase app
var app = initializeApp(configs[6])
var db;
// initialize storage
// const storage = getStorage();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore()
}

db = getFirestore()

// declare refs
const jnrRef = doc(db, "reserved", "2aOQTzkCdD24EX8Yy518");
const snrRef = doc(db, "reserved", "eWfgh8PXIEid5xMVPkoq");

const subDatalist = document.querySelector('datalist#subject');

if (sessionStorage.getItem("subs") === null) {
    await getDoc(jnrRef)
    .then( async doc => {
        let docSnap = doc.data();
        await getDoc(snrRef)
        .then(docb => {
            docSnap = { ...docSnap, ...docb.data()}
            sessionStorage.setItem('subs', JSON.stringify(docSnap))
            loadSubs();
            console.log('From server')
        })
    })
} else {
    // load subjects
    loadSubs();
}
function loadSubs() {
    const subArray = Object.entries(JSON.parse(sessionStorage.getItem('subs')));
    subArray.forEach(e => {
        subDatalist.insertAdjacentHTML('beforeend', `<option value='${e[0]}'>${e[1]}</option>`)
    })
}

let pdfFormVar, fe, qe, ch, ce;
const pdfForm = document.forms.pdfForm;
pdfForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(pdfForm);
    pdfFormVar = Array.from(formData.values());
    [fe, qe, ch, ...ce] = pdfFormVar;
    console.log('DONE !!!')
});

// let quizFormVar;
const clsDatalist = document.querySelector('datalist#cls');
const quizForm = document.forms.quizForm;
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(quizForm);
    const cls = formData.get('cls');
    const sub = formData.get('subject');
    const catNo = Number(formData.get('testNum'));
    const rating = Number(formData.get('rating'));
    const duration = Number(formData.get('duration'));
    const instr = formData.getAll('instr');
    const startTime = formData.get('startTime');
    const code = formData.get('code');
    // reset config
    let num = Number(clsDatalist.options.namedItem(cls).dataset.id)
    // console.log(num)
    chooseConfig(num)
    // send file to storage
    const storage = getStorage();
    const rootPath = ref(storage, `files/test/${sub}`);
    const _filename = ref(rootPath, fe.name)

    uploadBytes(_filename, fe)
        .then(async (snapshot) => {
            await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                const testRef = collection(db, "activities");
                await addDoc(collection(testRef, "test", sub), {
                    name: fe.name,
                    link: downloadURL,
                    questions: Number(qe),
                    choice: Number(ch),
                    chosen: ce,
                    catNo,
                    rating,
                    duration,
                    instr,
                    startTime,
                    timestamp: serverTimestamp(),
                })
                .then(async snapDoc => {                    
                    //send URL to teacher's doc
                    chooseConfig(6);
                    console.log("Finished.")
                    /*
                    await updateDoc(doc(db, "staffCollection", ss.id), {
                        [subPath]: arrayUnion({
                            [file.name]: downloadURL,
                            fileID: snapDoc.id,
                        })
                    })*/
                })
            })
        })
    // const myRef = doc(db, "students", cls)
})


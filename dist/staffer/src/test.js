import { initializeApp, deleteApp } from "firebase/app";
import {
    getFirestore, collection, getDoc, addDoc, doc} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
import entryCode from "./JSON/test.json" assert {type: 'json'};

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
    subArray.forEach((e, i) => {
        subDatalist.insertAdjacentHTML('beforeend', `<option data-id='${i}' value='${e[0]}'>${e[1]}</option>`)
    })
}
const dialogNotice = document.querySelector('dialog#notice');

let pdfFormVar, fe, qe, ch, ce;
const pdfForm = document.forms.pdfForm;
pdfForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(pdfForm);
    pdfFormVar = Array.from(formData.values());
    [fe, qe, ch, ...ce] = pdfFormVar;
    document.body.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
    })
    dialogNotice.querySelector('output').textContent = "Phase 1 and 2: CHECKED.";
    dialogNotice.showModal();
});


const clsDatalist = document.querySelector('datalist#cls');
const quizForm = document.forms.quizForm;
const submitBtn = document.querySelector('#submit-btn');
submitBtn.addEventListener('click', (e) => {
    // e.preventDefault();
    e.target.disabled = true;
    e.target.style.cursor = 'not-allowed';

    const formData = new FormData(quizForm);
    const cls = formData.get('cls');
    const sub = formData.get('subject');
    const catNo = Number(formData.get('testNum'));
    const rating = Number(formData.get('rating'));
    const duration = Number(formData.get('duration'));
    const instr = formData.getAll('instr');
    const startTime = formData.get('startTime');
    const startDate = formData.get('startDate');
    const code = formData.get('code');
    // reset config
    let num = Number(clsDatalist.options.namedItem(cls).dataset.id)
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
                    startDate,
                    code,
                })
                .then(async snapDoc => {                    
                    //send URL to teacher's doc
                    chooseConfig(6);
                    clearSheet();
                    iframe.srcdoc = `
                        <div style="margin:300px auto;padding:10px;width:300px;font-family:tahoma;font-size:16px;text-align:center;border-bottom:1px solid #777;color:#777;">
                            After choosing a PDF,<br/>its preview should be displayed here.    
                        </div>
                    `;
                    e.target.parentElement.close();
                    copyBtn.textContent = 'COPY';
                    copyBtn.classList.remove('copied');

                    pdfForm.reset();
                    quizForm.reset();
                    dialogNotice.querySelector('output').textContent = "Test has been uploaded successfully.";
                    dialogNotice.showModal();
                    e.target.disabled = false;
                    e.target.style.cursor = 'pointer';
                    document.body.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    })
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
})

const hiddenInput = document.querySelector('input[type="hidden"]');
const dialogCode = document.querySelector('#code-dialog');
const codeBtn = document.querySelector('#code-btn');
codeBtn.addEventListener('click', (e) => {
    let sub = document.querySelector('input[name="subject"]')
    let cls = document.querySelector('input[name="cls"]')
    document.querySelector('#span-sub').textContent = sub.value;
    document.querySelector('#span-class').textContent = cls.value;
    //generate code
    let randy = parseInt(Math.random()*1000);
    //add code to hidden input..
    dialogCode.querySelector('strong').textContent = hiddenInput.value = entryCode[randy].toUpperCase();
    dialogCode.showModal();
})
const copyBtn = document.querySelector('#copy-btn');
copyBtn.addEventListener('click', async (e) => {
    await navigator.clipboard.writeText(dialogCode.querySelector('strong').textContent)
        .then(() => {
            e.target.textContent = 'Copied!';
            e.target.classList.add('copied')
        })
        .catch(err => {
            console.log(err)
        })
})


/*

// let quizFormVar;
const clsDatalist = document.querySelector('datalist#cls');
const quizForm = document.forms.quizForm;
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';

    const formData = new FormData(quizForm);
    const cls = formData.get('cls');
    const sub = formData.get('subject');
    const catNo = Number(formData.get('testNum'));
    const rating = Number(formData.get('rating'));
    const duration = Number(formData.get('duration'));
    const instr = formData.getAll('instr');
    const startTime = formData.get('startTime');
    const code = formData.get('code');
    let timestamp = Intl.DateTimeFormat('en-us', {dateStyle: "medium"}).format(new Date());
    // reset config
    let num = Number(clsDatalist.options.namedItem(cls).dataset.id)
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
                    code,
                    timestamp,
                })
                .then(async snapDoc => {                    
                    //send URL to teacher's doc
                    chooseConfig(6);
                    clearSheet();
                    iframe.srcdoc = `
                        <div style="margin:300px auto;padding:10px;width:300px;font-family:tahoma;font-size:16px;text-align:center;border-bottom:1px solid #777;color:#777;">
                            After choosing a PDF,<br/>its preview should be displayed here.    
                        </div>
                    `;
                    pdfForm.reset();
                    quizForm.reset();
                    dialogNotice.querySelector('output').textContent = "Test has been uploaded successfully.";
                    dialogNotice.showModal();
                    e.submitter.disabled = false;
                    e.submitter.style.cursor = 'pointer';
                    document.body.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth',
                    })
                    /*
                    await updateDoc(doc(db, "staffCollection", ss.id), {
                        [subPath]: arrayUnion({
                            [file.name]: downloadURL,
                            fileID: snapDoc.id,
                        })
                    })
                })
            })
        })
    // const myRef = doc(db, "students", cls)
})

const hiddenInput = document.querySelector('input[type="hidden"]');
const dialogCode = document.querySelector('#code-dialog');
const codeBtn = document.querySelector('#code-btn');
codeBtn.addEventListener('click', (e) => {
    //generate code
    let randy = parseInt(Math.random()*1000);
    //add code to hidden input..
    dialogCode.querySelector('strong').textContent = hiddenInput.value = entryCode[randy];
    dialogCode.showModal();
})
const copyBtn = document.querySelector('#copy-btn');
copyBtn.addEventListener('click', async (e) => {
    await navigator.clipboard.writeText(dialogCode.querySelector('strong').textContent)
        .then(() => {
            e.target.textContent = 'Copied!';
            e.target.classList.add('copied')
        })
        .catch(err => {
            console.log(err)
        })
})
*/
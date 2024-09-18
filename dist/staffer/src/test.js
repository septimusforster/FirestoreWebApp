import { initializeApp, deleteApp } from "firebase/app";
import { getFirestore, collection, getDoc, getDocs, addDoc, doc, query, where, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import  configs from "../../../src/JSON/configurations.json" assert {type: 'json'};
import entryCode from "./JSON/test.json" assert {type: 'json'};

// initialize firebase app
var app = initializeApp(configs[6])
var db = getFirestore(app);
// initialize storage
// const storage = getStorage();

function chooseConfig(num) {
    deleteApp(app);
    app = initializeApp(configs[num]);
    // init services
    db = getFirestore(app);
}

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
    e.target.disabled = true;
    e.target.style.cursor = 'not-allowed';
    dialogNotice.querySelector('output').textContent = "Searching for and removing older files, if any.";
    dialogNotice.querySelector('button').style.display = 'none';
    dialogNotice.showModal();

    const timeoutID = setTimeout(async () => {

        let sub = document.querySelector('input[name="subject"]').value;
        let cls = document.querySelector('input[name="cls"]').value;
        const catNo = Number(document.getElementById('testNum').value);
    
        chooseConfig(configs[7].indexOf(cls));
        
        const colStorageRef = collection(db, "activities", `test/${sub}`);
        const q = query(colStorageRef, where("catNo", "==", catNo));
        const docSnap = await getDocs(q);
        if (!docSnap.empty) {
            let links = [];
            let docID = [];
            const re = new RegExp(/\/files.+\?/);
            docSnap.docs.forEach(arr => {
                let link = arr.get('link');
                let oldFileRef = decodeURIComponent(re.exec(link)[0]).slice(0,-1);
                links.push(oldFileRef);
                docID.push(arr.id)
            });
            // delete from storage
            const storage = getStorage();
            const p1 = links.map(async lnk => {
                let refr = ref(storage, lnk);
                deleteObject(refr).catch(err => {
                    console.log("(Storage/object-not-found)")
                });
                // await 
            });
            await Promise.allSettled(p1);
            console.log("Files deleted.");
    
            // delete doc from firebase
            const p2 = docID.map(async did => {
                await deleteDoc(doc(db, "activities"+`/test/${sub}`, did))
            });
            await Promise.allSettled(p2);
            console.log("docID deleted.");
            dialogNotice.close();
            dialogNotice.querySelector('button').style.display = 'initial';
    
            document.querySelector('#span-sub').textContent = sub;
            document.querySelector('#span-class').textContent = cls;
            //generate code
            let randy = parseInt(Math.random()*1000);
            //add code to hidden input..
            // dialogCode.querySelector('strong').textContent = hiddenInput.value = entryCode[randy].toUpperCase();
            dialogCode.showModal();
        } else {
            dialogNotice.close();
            dialogNotice.querySelector('button').style.display = 'initial';
            document.querySelector('#span-sub').textContent = sub;
            document.querySelector('#span-class').textContent = cls;
            //generate code
            let randy = parseInt(Math.random()*1000);
            //add code to hidden input..
            dialogCode.querySelector('strong').textContent = hiddenInput.value = entryCode[randy].toUpperCase();
            dialogCode.showModal();
        }
        e.target.disabled = false;
        e.target.style.cursor = 'pointer';
        clearTimeout(timeoutID);
    }, 3000)
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
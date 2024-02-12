import { initializeApp, deleteApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, doc, addDoc, getDoc, deleteDoc, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};


//declare all const and var
const uploadForm = document.querySelectorAll('form')[0];
const documentsWrapper = document.querySelector('#documents-wrapper div:nth-of-type(2)');
const evenSpans = document.querySelectorAll('.profile span:nth-of-type(even)');
const photo = document.querySelector('#avatar img');
const runBtn = document.querySelector('#documents-wrapper button');
const selectClassroom = document.querySelector('select#theClassroomId');
const commentOK = ["It's alright.","I get it.","Fine.","Okay."];
const commentYES = ["Yes, go on.","Of course.","Yes, please."];
const commentNO = ["No, I don't wanna.","No, sorry.","No, don't."];
const classArray = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"];
// var authorId = document.querySelector('#upload-wrapper input[type="hidden"]');
var fields = {};
const fileRef = "fileCollection";

// initialize firebase app
var app = initializeApp(configs[0]);
// init services
var db;

function chooseConfig(projNum) {
    deleteApp(app);
    app = initializeApp(configs[projNum]);
    db = getFirestore();
}

// collection refs
// const fileCollectionRef = collection(db, fileRef);
// const staffCollectionRef = doc(db, "staffCollection", sessionStorage.getItem('snapshotId'));

// load member profile
const ss = JSON.parse(sessionStorage.getItem('snapshotId'));
// load profile pic
if (ss.data.avatar) photo.src = ss.data.avatar;
// load full name and alias
const currUser = document.querySelector('#currentUsername');
const currPass = document.querySelector('#currentPassword');
evenSpans[0].textContent = ss.data.fullName;
evenSpans[1].textContent = currUser.dataset.value = ss.data.username;
currPass.dataset.value = ss.data.password;
// load classes taught in profile and selectElt
ss.data.classroomsTaught.forEach(classroom => {
    evenSpans[2].insertAdjacentHTML('afterbegin', `${classroom}<br>`)
    let option = new Option(classroom, classroom);
    selectClassroom.insertAdjacentElement('beforeend', option);
});
// load subjects taught in profile and selectElt
ss.data.subjectsTaught.forEach(subject => {
    for (const [k, v] of Object.entries(subject)) {
        evenSpans[3].insertAdjacentHTML('afterbegin', `${v}<br>`);
        let option = new Option(v, k);
        document.querySelector('select#theSubjectId').insertAdjacentElement('beforeend', option);
    }
});
document.querySelector('#profile-wrapper').children[2].style.display = 'flex';

//on form change
selectClassroom.addEventListener('change', (e) => {
    let optIndex = classArray.indexOf(e.target.value);
    chooseConfig(optIndex);
})

//on form submit
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';

    let theDateCreated = Intl.DateTimeFormat('en-us', {dateStyle: "medium"}).format(new Date());
    const formData = new FormData(uploadForm);
    let catPath = formData.get('category');
    let subPath = formData.get('theSubject');
    let file = formData.get('theFile');
    let info = formData.get('info');

    if(file.size) {
        const storage = getStorage();
        const rootPath = ref(storage, `files/${subPath}/${catPath}`);
        const imagesRef = ref(rootPath, file.name);
        uploadBytes(imagesRef, file).then(async (snapshot) => {
            await getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                // console.log('getdownloadURL succeeded.')
                const notesRef = collection(db, "activities");
                await addDoc(collection(notesRef, catPath, subPath), {
                    name: file.name,
                    dest: downloadURL,
                    catPath,
                    info,
                    timestamp: theDateCreated,
                })
                // console.log('Document added successfully.')
                document.querySelector('dialog#to-delete output').textContent = "Document upload successful.";
                document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
                document.querySelector('dialog#to-delete').showModal();
                document.querySelector('#file-selected').innerText = "";
                uploadForm.reset();
                e.submitter.disabled = false;
                e.submitter.style.cursor = 'pointer';
            });
        })
    } else {
        const notesRef = collection(db, "activities");
        await addDoc(collection(notesRef, catPath, subPath), {
            name: "No topic.",
            catPath,
            info,
            timestamp: theDateCreated,
        })
        document.querySelector('dialog#to-delete output').textContent = "Document upload successful.";
        document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
        document.querySelector('dialog#to-delete').showModal();
        document.querySelector('#file-selected').innerText = "";
        uploadForm.reset();
        e.submitter.disabled = false;
        e.submitter.style.cursor = 'pointer';
    }
})
//function to retrieve newly inserted data
function getDataOnValue() {
    const q = query(fileCollectionRef, where("theAuthorId", "==", authorId.value));
    onSnapshot(q, (snapshot) => {
        documentsWrapper.innerHTML = '';
        snapshot.docs.forEach(doc => {
            let data = doc.data();
            // insert docs into Document page
            documentsWrapper.insertAdjacentHTML('beforeend',`
                <label class="radio-container">${data.theFileName}
                    <input type="radio" name="rd" id="${doc.id}" value="${data.theFileEncoding}">
                    <span class="checkmark"></span>
                </label>
            `)
        })
    })
}
runBtn.onclick = (e) => {
    // if(e.target.value == "delete") {
        let fileId, fileLink, fileName;
     let radioList = document.querySelectorAll("input[type='radio']");
     let checked = false;
     radioList.forEach(radio => {
        if (radio.checked) {
            checked = true;
            fileId = radio.id;
            fileLink = radio.value;
            fileName = radio.parentElement.innerText;
            return;
        }
     });
     if (checked && e.target.value == "download") {
        document.querySelector('dialog#to-download output').textContent = "Download " + fileName;
        document.querySelector('dialog#to-download a:nth-of-type(2)').href = fileLink;
        document.querySelector('dialog#to-download a:nth-of-type(2)').download = fileName;
        document.querySelector('dialog#to-download a:nth-of-type(1)').textContent = commentNO[Math.floor(Math.random()*3)];
        document.querySelector('dialog#to-download a:nth-of-type(2)').textContent = commentYES[Math.floor(Math.random()*3)];
        document.querySelector('dialog#to-download').showModal();
     } else if (checked && e.target.value == "delete") {
        if (confirm("Delete  " + fileName)) {
            const ref = doc(db, fileRef, fileId)
            deleteDoc(ref)
            .then(() => {
               document.querySelector('dialog#to-delete output').textContent = "Document deleted.";
               document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
               document.querySelector('dialog#to-delete').showModal();
            })
        }
     } else {
        //showModal for nULL
        document.querySelector('dialog#to-delete output').textContent = "Please, first select a document.";
        document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
        document.querySelector('dialog#to-delete').showModal();
     }
}
fmSettings.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    chooseConfig(6);
    const formData = new FormData(fmSettings);
    const fullName = ['fullName', formData.get('fullName')];
    const username = ['username', formData.get('username')];
    const password = ['password', formData.get('password')];

    const dataArray = [fullName, username, password].filter(a => Boolean(a[1]));
    let entries = new Map(dataArray);
    let obj = Object.fromEntries(entries);

    await updateDoc(doc(db, "staffCollection", ss.id), obj)
    dialogSettings.close();

    document.querySelector('dialog#to-delete output').textContent = "Profile settings updated.";
    document.querySelector('dialog#to-delete a').textContent = commentOK[Math.floor(Math.random()*4)];
    document.querySelector('dialog#to-delete').showModal();
})
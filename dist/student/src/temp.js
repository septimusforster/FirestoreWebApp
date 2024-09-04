import { initializeApp } from "firebase/app";
import { getFirestore, doc, increment, updateDoc, query, where, and, or } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import configs from "../../../src/JSON/configurations.json" assert {type: 'json'};

const classIndex = ["JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"].indexOf(ss.class);
// initialize firebase app
var app = initializeApp(configs[classIndex])

// init services
const db = getFirestore();
//init references
const userRef = doc(db, 'session', ss.session, 'students', ss.id);

subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    const formData = new FormData(subjectForm);
    let obj = {}, i;
    const offered = formData.getAll('offered');
    offered.forEach((abbr, i) => {
        obj[abbr] = ss.reservedPayload[abbr];
    })

    await updateDoc(userRef, { offered: obj });
    dialogSuccess.firstElementChild.textContent = "Submit Successful.";
    dialogSuccess.lastElementChild.textContent = "Redirecting to login..."
    dialogSuccess.showModal();
    setTimeout(function() {
        location.href = "./logon.html";
    }, 5000)

})
const storage = getStorage();
const rootPath = ref(storage, `img/${ss.session}/${ss.class}`);

const photoSrc = document.getElementById('photoSrc');
const photoPreview = document.querySelector("[alt='photo-preview']");
photoSrc.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        document.querySelector('.footer input').classList.remove('deactivate');
    }
    const reader = new FileReader();
    reader.onload = function () {
        photoPreview.src = reader.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});
const dialogSuccess = document.querySelector('dialog#success');
photoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    e.submitter.style.cursor = 'not-allowed';
    const imagesRef = ref(rootPath, ss.id + "." + photoSrc.files[0].type.split('/')[1]);
    uploadBytes(imagesRef, photoSrc.files[0]).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            const docSnap = await updateDoc(userRef, {
                photo_src: downloadURL,
            });
            //bring up modal box: Login
            dialogSuccess.firstElementChild.textContent = "Upload Successful.";
            dialogSuccess.lastElementChild.textContent = "Redirecting to login...";
            dialogSuccess.showModal();
            setTimeout(function() {
                location.href = "./logon.html";
            }, 5000)
        });
    })
})
import { initializeApp } from "firebase/app";
import { getFirestore, doc, increment, updateDoc, query, where, and, or } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig = {    
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46",
};
// initialize firebase app
initializeApp(firebaseConfig)
// init services
const db = getFirestore();
//init references
const userRef = doc(db, ss.class, ss.id);

subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(subjectForm);
    const docSnap = await updateDoc(userRef, {
        offered: formData.getAll('offered'),
        upload_enabled: increment(1),
    });
    dialogSuccess.firstElementChild.textContent = "Submit Successful.";
    dialogSuccess.lastElementChild.textContent = "Redirecting to login..."
    setTimeout(function() {
        location.href = "./logon.html";
    }, 5000)
})
const storage = getStorage();
const rootPath = ref(storage, "img/" + ss.class);

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
    //md5 Hash Snapshot: phD3lG5Pgx1Tuu/lqQVO0A==
})
const dialogSuccess = document.querySelector('dialog#success');
photoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.submitter.disabled = true;
    const imagesRef = ref(rootPath, ss.id + "." + photoSrc.files[0].type.split('/')[1]);
    uploadBytes(imagesRef, photoSrc.files[0]).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            const docSnap = await updateDoc(userRef, {
                photo_src: downloadURL,
                upload_enabled: increment(1),
            });
            //bring up modal box: Login
            dialogSuccess.firstElementChild.textContent = "Upload Successful.";
            dialogSuccess.lastElementChild.textContent = "Redirecting to login..."
            setTimeout(function() {
                location.href = "./logon.html";
            }, 5000)
        });
    })
})
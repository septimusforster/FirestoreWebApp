import { initializeApp } from "firebase/app";
import { addDoc, collection, collectionGroup, query, where, doc, getDocs, getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig = {
    "apiKey": "AIzaSyCg54BF3m0TDPV3slZ0ctWf3s9x1dpaDDs",
    "authDomain": "sss-3-57cf1.firebaseapp.com",
    "projectId": "sss-3-57cf1",
    "storageBucket": "sss-3-57cf1.appspot.com",
    "messagingSenderId": "213082789734",
    "appId": "1:213082789734:web:0fdba98e8ffc2ac65b1aa7"
};
// initialize app
initializeApp(firebaseConfig);

//init services 
const db = getFirestore();

const storage = getStorage();
const rootPath = ref(storage, "files/MTH/Notes");

const inputFile = document.querySelector('input[type="file"]');
const img = document.querySelector('img');
inputFile.addEventListener('change', async (e) => {
    
    const imagesRef = ref(rootPath, e.target.files[0].name);

    /*
    const reader = new FileReader();
    reader.onload = function () {
        img.src = reader.result;
    }
    reader.readAsDataURL(e.target.files[0]);
    */
    //console.log(e.target.files[0])
    
    /*
    uploadBytes(imagesRef, e.target.files[0]).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
            const notesRef = collection(db, "activities");
            await addDoc(collection(notesRef, "notes", "mth"), {
                dest: downloadURL,
                timestamp: serverTimestamp(),
            })
            console.log('Successful.')
        });
    })
    */
    
    /*
    const notesRef = collection(db, "activities");
    await addDoc(collection(notesRef, "notes", "mth"), {
        dest: 'myurlforENGLISH',
        timestamp: serverTimestamp(),
    })
    */
    const museums = query(collectionGroup(db, 'mth'));
    const querySnapshot = await getDocs(museums);
    querySnapshot.forEach((doc) => {
        console.log(doc.id, ' => ', doc.data());
    });
    //console.log('Successful.')
    //md5 Hash Snapshot: phD3lG5Pgx1Tuu/lqQVO0A==
})
// const pdfRef = ref(storage, 'pdf/Mathematics');

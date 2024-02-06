import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, and, or } from "firebase/firestore";
const firebaseConfig = {    
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
// initialize firebase app
initializeApp(firebaseConfig)
// init services
const db = getFirestore();

subjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(subjectForm);
    const ref = doc(db, ss.class, ss.id);
    const docSnap = await setDoc(ref, {
        offered: formData.getAll('offered'),
    });
    
})
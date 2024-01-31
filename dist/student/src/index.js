import { initializeApp } from "firebase/app";
import { getFirestore, collection, collectionGroup, doc, getDoc, getDocs, query, where, and, or, addDoc } from "firebase/firestore";
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
const db = getFirestore()
// collection refs

const ref = doc(db, classroom.value, "myID");
const docSnap = await getDoc(ref);
if(docSnap.exists()) {
    console.log("Document exists.")
} else {
    console.log("Document does not exist.")
}
/*
import firebase from 'firebase/app'
import 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyB1FJnKHGt3Ch1KGFuZz_UtZm1EH811NEU",
    authDomain: "fir-pro-152a1.firebaseapp.com",
    projectId: "fir-pro-152a1",
    storageBucket: "fir-pro-152a1.appspot.com",
    messagingSenderId: "158660765747",
    appId: "1:158660765747:web:bd2b4358cc5fc9067ddb46"
};
//Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Get a reference to Firebase storage
const storage = firebase.storage();

//File input element
const fileInput = document.getElementById('file-job');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const storageRef = storage.ref('pdfs/' + file.name);
    const uploadTask = storageRef.put(file);
    //monitor upload progress
    uploadTask.on('state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytesTransferred) * 100;
        console.log('Upload is ' + progress + ' done.')
    },
        (error) => {
            console.log(error)
        },
        () => {
            console.log("File uploaded successfully.")
        }
    );
})
*/
import pk from "../src/JSON/upass.json" assert {type: 'json'};
console.log(pk[0]);
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyCT92x3HE8nUsYsKgQ2eJZU7DHQ83mTgwE",
    authDomain: "dca-mobile-26810.firebaseapp.com",
    projectId: "dca-mobile-26810",
    storageBucket: "dca-mobile-26810.appspot.com",
    messagingSenderId: "843119620986",
    appId: "1:843119620986:web:e1a4f469626cbd4f241cc3"
};
// initialize app
initializeApp(firebaseConfig);

const storage = getStorage();
const rootPath = ref(storage, "img/JSS 1");

const inputFile = document.querySelector('input[type="file"]');
const img = document.querySelector('img');
inputFile.addEventListener('change', (e) => {
    const imagesRef = ref(rootPath, e.target.files[0].name);
    const reader = new FileReader();
    reader.onload = function () {
        img.src = reader.result;
    }
    reader.readAsDataURL(e.target.files[0]);
    //console.log(e.target.files[0])
    /*
    uploadBytes(imagesRef, e.target.files[0]).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => console.log(downloadURL));
    })*/
    //md5 Hash Snapshot: phD3lG5Pgx1Tuu/lqQVO0A==
})
// const pdfRef = ref(storage, 'pdf/Mathematics');

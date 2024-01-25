import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
//declare all const and var
const uploadForm = document.querySelectorAll('form')[0];
const documentsWrapper = document.getElementById('documents-wrapper');
const evenSpans = document.querySelectorAll('.profile span:nth-of-type(even)');
const photo = document.querySelector('#avatar img');
var fields = {};

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
const fileCollectionRef = collection(db, "fileCollection");
const staffCollectionRef = doc(db, "staffCollection", "nw3qHYLzZcBgEIKr5OCq");

//add demo staff member
// addDoc(staffCollectionRef, {...{
//     fullname: "Matthew Henry",
//     username: "airlock",
//     password: "drone",
//     // classroomsTaught: ["JSS 1","JSS 3","demo"],
//     // subjectsTaught: ["Mathematics", "Physics"],
//     avatar: ""
// }, createdAt: serverTimestamp()})
//     .then(() => {
//         console.log("Demo staff member registered.")
//     })

//load member profile

const getSingleDoc = async () => {
    try {
        // const docRef = doc(db, collectionName, documentId);
        const docSnapshot = await getDoc(staffCollectionRef);

        if (docSnapshot.exists()) {
            const documentData = docSnapshot.data();
            return documentData;
        } else {
            console.log(`Document with ID ${documentId} does not exist in collection ${collectionName}.`);
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
};
getSingleDoc()
    .then((documentData) => {
        if(documentData) {
            photo.src = documentData.avatar;
            evenSpans[0].textContent = documentData.fullname;
            evenSpans[1].textContent = documentData.username;
            documentData.classroomsTaught.forEach(classroom => {
                evenSpans[2].insertAdjacentHTML('afterbegin', `${classroom}<br>`)
                //Enter these values also for the select element for classrooms
            })
            documentData.subjectsTaught.forEach(subject => {
                evenSpans[3].insertAdjacentHTML('afterbegin', `${subject}<br>`)
            })
            document.querySelector('#profile-wrapper').children[2].style.display = 'flex';
        }
    })
    
//on form change
uploadForm.addEventListener('change', (e) => {
    e.preventDefault();
    if(e.target.id == "fileId") {
        //get file, filename
        const file = e.target.files[0];
        const fileName = file.name;
        if(file.size > 1048487) {
            console.log("The selected file has exceeded the maximum size of 1 MiB allowed.")
            return;
        } else {

            //create base64 value
            const fr = new FileReader();
            fr.onload = function(event){
                fields["theFileName"] = fileName;
                fields["theFileEncoding"] = event.target.result;
            }
            fr.readAsDataURL(file);
        }
    } else {
        fields[e.target.name] = e.target.value;
    }
    // console.log(fields)
})

//on form submit
uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //get authorId
    const theAuthorId = document.querySelector('input[type="hidden"]').value;
    addDoc(fileCollectionRef, {...fields, theAuthorId, theDateCreated: serverTimestamp()})
        .then(() => {
            // reset fields
            fields = {};
            console.log("Document uploaded successfully.");
            getDataOnValue();
        })
})
//function to retrieve newly inserted data
function getDataOnValue() {
    onSnapshot(fileCollectionRef, (snapshot) => {
        snapshot.docs.forEach(doc => {
            let data = doc.data();
            // insert docs into Document page
            documentsWrapper.insertAdjacentHTML('beforeend',`
                <div class="files">
                    <label>
                        <input type="radio" name="fireDoc" id="${doc.id}" value="${data.theFileEncoding}">
                        ${data.theFileName}
                    </label>
                </div>    
            `)
        })
    })
}

// onSnapshot(fileCollectionRef,)

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